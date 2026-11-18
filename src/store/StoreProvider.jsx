// In-memory store: React Context + useReducer, persisted to localStorage.
// Action names are plain verbs so a Node/Express API can replace them 1:1
// (POST /applications/:id/submit, POST /donations/:id/webhook, ...).
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { buildSeedState, formatINR, firstNameInitial, initialsOf, formatDate } from '../data/mockData';
import { ageFromDob } from '../data/rules';
import { allocate, calcCheckout } from './ledger';
import {
  getStudent,
  getSponsor,
  getUser,
  getGuardian,
  studentRemainingNeed,
  studentPackageTotals,
  studentConfirmed,
} from './selectors';

export const STORE_KEY = 'sb_store_v1';
const STORE_VERSION = 5;

let seq = 0;
export const uid = (prefix) => `${prefix}-${Date.now().toString(36)}${(seq++).toString(36)}`;
const now = () => new Date().toISOString();

// --- small immutable helpers -------------------------------------------------
const patchById = (arr, id, patch) =>
  arr.map((x) => (x.id === id ? { ...x, ...(typeof patch === 'function' ? patch(x) : patch) } : x));
const patchWhere = (arr, pred, patch) =>
  arr.map((x) => (pred(x) ? { ...x, ...(typeof patch === 'function' ? patch(x) : patch) } : x));

// Delivery channels are mocked; only the in-app list is real.
export const CHANNELS_BY_CATEGORY = {
  Consent: ['In-app', 'SMS', 'WhatsApp'],
  Documents: ['In-app', 'SMS'],
  Approval: ['In-app', 'Email'],
  Funding: ['In-app', 'Email', 'SMS'],
  Payout: ['In-app', 'Email', 'SMS'],
  Progress: ['In-app', 'WhatsApp'],
  System: ['In-app', 'Email'],
};
const notify = (s, userId, category, title, detail, key) =>
  !userId || (key && s.notifications.some((n) => n.key === key && n.userId === userId))
    ? s
    : {
        ...s,
        notifications: [
          { id: uid('n'), userId, category, title, detail, at: now(), unread: true, channels: CHANNELS_BY_CATEGORY[category] || ['In-app'], ...(key ? { key } : {}) },
          ...s.notifications,
        ],
      };

const notifyRole = (s, role, category, title, detail, key) =>
  s.users.filter((u) => u.role === role).reduce((acc, u) => notify(acc, u.id, category, title, detail, key), s);

const audit = (s, actor, action, entity, entityId) => ({
  ...s,
  auditLog: [
    { id: uid('au'), actorId: actor?.id || 'system', role: actor?.role || 'system', action, entity, entityId, at: now() },
    ...s.auditLog,
  ],
});

const setStatus = (s, studentId, status) => ({ ...s, students: patchById(s.students, studentId, { status }) });
const studentUser = (s, studentId) => getStudent(s, studentId)?.userId;
const guardianUser = (s, studentId) => getGuardian(s, studentId)?.userId;
const short = (s, studentId) => firstNameInitial(getStudent(s, studentId)?.fullName || '');

/** Moves Listed <-> Partially funded <-> Fully funded based on confirmed money. */
function refreshFundingStatus(s, studentId) {
  const st = getStudent(s, studentId);
  if (!st || !['Listed', 'Partially funded', 'Fully funded'].includes(st.status)) return s;
  const need = studentPackageTotals(s, studentId).verifiedNeed;
  const got = studentConfirmed(s, studentId);
  const next = got <= 0 ? 'Listed' : got >= need ? 'Fully funded' : 'Partially funded';
  if (next === st.status) return s;
  let out = setStatus(s, studentId, next);
  if (next === 'Fully funded') {
    out = notify(out, st.userId, 'Funding', 'You are fully funded', 'Your package is 100% funded. The trust will pay your institute directly.');
    out = notify(out, guardianUser(out, studentId), 'Funding', `${st.fullName.split(' ')[0]} is fully funded`, 'The trust will pay the institute directly against its fee invoice.');
    out.users.filter((u) => u.role === 'institute' && u.orgId === st.instituteId).forEach((u) => {
      out = notify(out, u.id, 'Payout', 'Invoice requested', `${st.fullName} is fully funded. Please upload the fee invoice for instalment 1.`);
    });
  }
  return out;
}

// --- reducer -----------------------------------------------------------------
export function reducer(state, action) {
  const { type, payload: p = {}, actor } = action;
  let s = state;

  switch (type) {
    case 'reset':
      return buildSeedState();

    // ---- generic student-side setters (used by the existing pages) ---------
    case 'updateStudent': {
      const patch = { ...p.patch };
      if ('dob' in patch) patch.age = ageFromDob(patch.dob);
      if ('fullName' in patch) patch.initials = initialsOf(patch.fullName);
      return { ...s, students: patchById(s.students, p.studentId, patch) };
    }

    case 'registerStudent': {
      // Sign up (after phone OTP): creates the user and a Draft student record.
      const n = s.students.filter((x) => x.id.startsWith('SB-2026-0047')).length;
      const id = `SB-2026-${String(4700 + n + 1).padStart(6, '0')}`;
      const suffix = id.slice(-6);
      const DOCS = [
        ['class10', 'Class 10 marksheet', 'digilocker'],
        ['aadhaar', 'Aadhaar', 'digilocker'],
        ['income', 'Income certificate', 'manual'],
        ['school_id', 'School ID / Bonafide', 'manual'],
        ['photo', 'Passport photo', 'manual'],
        ['caste_ews', 'Caste / EWS certificate (optional)', 'manual'],
      ];
      s = {
        ...s,
        users: [...s.users, { id: p.userId, role: 'student', name: p.name, email: p.email, mobile: p.mobile, orgId: id }],
        students: [
          ...s.students,
          {
            id, userId: p.userId, fullName: p.name, initials: initialsOf(p.name), dob: '', age: null, gender: p.gender || 'Female',
            mobile: p.mobile, email: p.email, state: '', district: '', school: '', board: 'CBSE', studentClass: '11',
            class10Marks: '', incomeBand: '₹1–2.5L', sop: '', familyIncome: null, status: 'Draft', listedAt: null,
            guardianId: `g-${suffix}`, verifierId: null, courseId: null, packageId: null, exam: null, instituteId: null,
            batchId: null, createdAt: now(),
          },
        ],
        guardians: [
          ...s.guardians,
          { id: `g-${suffix}`, userId: null, studentId: id, name: '', relation: 'Mother', mobile: '', email: '', consentState: 'not_sent', approvedDate: null, consentSentAt: null, consentAt: null, otpVerified: false },
        ],
        documents: [
          ...s.documents,
          ...DOCS.map(([type, name, source]) => ({ id: type, type, studentId: id, name, status: 'not_uploaded', source, detail: 'Not uploaded yet', rejectReason: null })),
        ],
      };
      s = { ...s, settings: { ...s.settings, demoStudentId: id } }; // the demo script follows the newest sign-up
      s = notify(s, p.userId, 'System', 'Welcome to Sikshit Bharat', 'Your mobile is verified. Start your application when you are ready.');
      return audit(s, { id: p.userId, role: 'student' }, 'Registered (phone OTP verified)', 'student', id);
    }

    case 'digilockerSync': {
      // Sandbox only. success: Class 10 + Aadhaar verified. failure: student re-uploads manually.
      const ok = p.success !== false;
      s = {
        ...s,
        documents: patchWhere(
          s.documents,
          (d) => d.studentId === p.studentId && ['class10', 'aadhaar'].includes(d.id),
          (d) =>
            ok
              ? { status: 'verified', source: 'digilocker', rejectReason: null, detail: d.status === 'verified' && d.source === 'digilocker' ? d.detail : 'Verified via DigiLocker' }
              : { status: 'rejected', source: 'manual', rejectReason: 'DigiLocker could not fetch this document. Please upload it manually.', detail: 'DigiLocker could not fetch this. Please upload it manually.' }
        ),
      };
      s = notify(s, studentUser(s, p.studentId), 'Documents', ok ? 'DigiLocker synced' : 'DigiLocker could not fetch your documents', ok ? 'Class 10 marksheet and Aadhaar are verified.' : 'Please upload your Class 10 marksheet and Aadhaar manually.');
      return audit(s, actor, ok ? 'DigiLocker sync success' : 'DigiLocker sync failed', 'student', p.studentId);
    }

    case 'submitOutcome': {
      s = { ...s, students: patchById(s.students, p.studentId, { outcome: { ...p.outcome, at: now() }, status: 'Completed' }) };
      // The result is added to the sponsors' Sponsorship Certificates at the end of the course.
      const result = `${p.outcome.exam}: ${p.outcome.qualified ? 'qualified' : 'completed the course'}${p.outcome.college ? `, admitted to ${p.outcome.college}` : ''}`;
      s = { ...s, certificates: patchWhere(s.certificates, (c) => c.type === 'sponsorship' && c.studentIds.includes(p.studentId), { result }) };
      [...new Set(s.donations.filter((d) => d.studentId === p.studentId && d.status === 'success').map((d) => d.sponsorId))].forEach((sid) => {
        s = notify(s, getSponsor(s, sid)?.userId, 'Progress', `Result from ${short(s, p.studentId)}`, result);
      });
      s = notifyRole(s, 'admin', 'Progress', 'Final result submitted', `${short(s, p.studentId)}: ${p.outcome.exam}, ${p.outcome.qualified ? 'qualified' : 'did not qualify'}.`);
      return audit(s, actor, 'Submitted final outcome', 'student', p.studentId);
    }
    case 'setStudentDocuments': {
      const others = s.documents.filter((d) => d.studentId !== p.studentId);
      return { ...s, documents: [...others, ...p.documents.map((d) => ({ ...d, studentId: p.studentId, type: d.type || d.id }))] };
    }
    case 'updateGuardian':
      return {
        ...s,
        guardians: patchWhere(s.guardians, (g) => g.studentId === p.studentId, (g) =>
          // Moving back to pending restarts the 48-hour link window.
          p.patch.consentState === 'pending' && g.consentState !== 'pending' ? { ...p.patch, consentSentAt: now() } : p.patch
        ),
      };
    case 'setPackageExtras': {
      const before = s.packages.find((x) => x.studentId === p.studentId)?.extras || [];
      s = { ...s, packages: patchWhere(s.packages, (x) => x.studentId === p.studentId, { extras: p.extras }) };
      const added = p.extras.filter((e) => e.state === 'needs_review' && !e.excluded && !before.some((b) => b.id === e.id));
      added.forEach((e) => {
        s = notifyRole(s, 'admin', 'Approval', 'Extra to review', `${short(s, p.studentId)} asked for ${e.category} ${formatINR(e.amount)}.`);
      });
      return s;
    }
    case 'setPackageLocked':
      return {
        ...s,
        packages: patchWhere(s.packages, (x) => x.studentId === p.studentId, { locked: p.locked, lockedAt: p.locked ? now() : null }),
      };
    case 'selectCourse': {
      const course = s.catalogue.courses.find((c) => c.id === p.courseId);
      if (!course) return s;
      const st = getStudent(s, p.studentId);
      s = {
        ...s,
        students: patchById(s.students, p.studentId, { courseId: course.id, exam: course.exam, instituteId: course.instituteId, batchId: course.batches[0]?.id }),
      };
      const has = s.packages.some((x) => x.studentId === p.studentId);
      const pkgPatch = { courseId: course.id, courseFee: course.fee, durationMonths: course.durationMonths };
      return {
        ...s,
        packages: has
          ? patchWhere(s.packages, (x) => x.studentId === p.studentId, pkgPatch)
          : [...s.packages, { id: `pkg-${st.id.slice(-6)}`, studentId: st.id, extras: [], discount: 0, familyContribution: 0, locked: false, adminApproved: false, ...pkgPatch }],
      };
    }
    case 'addProgress': {
      s = { ...s, progress: [{ ...p.record, studentId: p.studentId, verifiedBy: null, submittedAt: now() }, ...s.progress] };
      s = notify(s, getStudent(s, p.studentId)?.verifierId, 'Progress', 'Progress update to verify', `${short(s, p.studentId)} · ${p.record.type}, ${p.record.month}.`);
      return audit(s, actor, `Progress update: ${p.record.type} (${p.record.month})`, 'progress', p.record.id);
    }
    case 'verifyProgress': {
      // decision: 'verified' | 'flagged' (at risk) | 'correction'
      const rec = s.progress.find((r) => r.id === p.recordId);
      if (!rec) return s;
      s = {
        ...s,
        progress: patchById(s.progress, rec.id, {
          status: p.decision,
          verifiedBy: actor?.id,
          verifiedAt: now(),
          verifierNote: p.note || null,
          ...(p.decision === 'flagged' ? { progressStatus: 'at_risk' } : {}),
        }),
      };
      const who = studentUser(s, rec.studentId);
      if (p.decision === 'verified') {
        s = notify(s, who, 'Progress', `${rec.type} accepted`, 'Your progress update was checked with your institute.');
        // Student update for the sponsors who fund this student (first name + initial only).
        [...new Set(s.donations.filter((d) => d.studentId === rec.studentId && d.status === 'success').map((d) => d.sponsorId))].forEach((sid) => {
          s = notify(s, getSponsor(s, sid)?.userId, 'Progress', `Update from ${short(s, rec.studentId)}`, `${rec.month}: ${rec.type} ${rec.score}${rec.attendance != null ? `, attendance ${rec.attendance}%` : ''}.`);
        });
      }
      if (p.decision === 'correction') s = notify(s, who, 'Progress', `Please correct ${rec.type}`, p.note);
      if (p.decision === 'flagged') {
        s = notify(s, who, 'Progress', 'Your mentor team will check in', 'We want to make sure you have the support you need this month.');
        s = notifyRole(s, 'admin', 'Progress', 'Student flagged at risk', `${short(s, rec.studentId)} · ${rec.month}: ${p.note}`);
      }
      return audit(s, actor, `Progress ${p.decision}: ${rec.type} (${rec.month})`, 'progress', rec.id);
    }

    case 'markAllNotificationsRead':
      return { ...s, notifications: s.notifications.map((n) => (n.userId === p.userId ? { ...n, unread: false } : n)) };

    case 'runReminders': {
      // Daily scheduled reminders (cron in a real backend). Keys stop duplicates.
      const today = p.today ? new Date(p.today) : new Date();
      const day = today.toISOString().slice(0, 10);
      const DAYMS = 86400000;
      // Verifier SLA: due within 24 hours, or overdue (admin is told too).
      s.reviews.filter((r) => r.verifierId && !r.decidedAt && r.slaDueAt).forEach((r) => {
        const left = new Date(r.slaDueAt).getTime() - today.getTime();
        if (left < 0) {
          s = notify(s, r.verifierId, 'Approval', 'Verification overdue', `${short(s, r.studentId)} was due on ${formatDate(r.slaDueAt)}.`, `sla-over-${r.id}`);
          s = notifyRole(s, 'admin', 'Approval', 'Verifier task overdue', `${short(s, r.studentId)} · ${getUser(s, r.verifierId)?.name}.`, `sla-over-admin-${r.id}`);
        } else if (left < DAYMS) {
          s = notify(s, r.verifierId, 'Approval', 'Verification due soon', `${short(s, r.studentId)} is due by ${formatDate(r.slaDueAt)}.`, `sla-soon-${r.id}`);
        }
      });
      // Monthly progress: remind enrolled/funded students before the 7th.
      if (today.getDate() <= 7) {
        const month = new Date(today.getFullYear(), today.getMonth() - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
        s.students.filter((st) => ['Enrolled', 'Fully funded', 'Partially funded'].includes(st.status)).forEach((st) => {
          if (s.progress.some((pr) => pr.studentId === st.id && pr.month === month)) return;
          s = notify(s, st.userId, 'Progress', `${month.split(' ')[0]} progress due by the 7th`, 'Upload attendance and test scores from your institute.', `prog-${st.id}-${month}`);
        });
      }
      // SIP: reminder 3 days before the debit.
      s.sponsors.filter((sp) => sp.sip?.status === 'active').forEach((sp) => {
        let next = new Date(today.getFullYear(), today.getMonth(), sp.sip.day);
        if (next <= today) next = new Date(today.getFullYear(), today.getMonth() + 1, sp.sip.day);
        if (next.getTime() - today.getTime() <= 3 * DAYMS)
          s = notify(s, sp.userId, 'Funding', 'SIP renews soon', `${formatINR(sp.sip.amount)} + fee will be debited on ${formatDate(next.toISOString())}.`, `sip-${sp.id}-${next.toISOString().slice(0, 10)}`);
      });
      // Guardian consent: one reminder after 24 hours, before the 48-hour expiry.
      s.guardians.filter((g) => g.consentState === 'pending' && g.consentSentAt && g.userId).forEach((g) => {
        const age = today.getTime() - new Date(g.consentSentAt).getTime();
        if (age > DAYMS && age < 2 * DAYMS)
          s = notify(s, g.userId, 'Consent', `Reminder: consent for ${getStudent(s, g.studentId)?.fullName.split(' ')[0]}`, 'The link expires 48 hours after it was sent.', `consent-rem-${g.id}-${g.consentSentAt}`);
      });
      return { ...s, settings: { ...s.settings, lastReminderRun: day } };
    }

    case 'markNotificationRead':
      return { ...s, notifications: patchById(s.notifications, p.id, { unread: false }) };
    case 'setSettings':
      s = { ...s, settings: { ...s.settings, ...p } };
      return Object.keys(p).some((k) => k !== 'demoMode' && k !== 'simulateDigilockerFailure')
        ? audit(s, actor, `Changed settings: ${Object.keys(p).join(', ')}`, 'settings', 'settings')
        : s;

    // ---- application pipeline ----------------------------------------------
    case 'submitApplication': {
      const resubmit = getStudent(s, p.studentId)?.status === 'Info requested';
      const prevVerifier = resubmit ? getStudent(s, p.studentId)?.verifierId : null;
      s = setStatus(s, p.studentId, 'Under verification');
      s = { ...s, students: patchById(s.students, p.studentId, { submittedAt: now(), infoRequest: null }) };
      if (!s.reviews.some((r) => r.studentId === p.studentId && !r.decidedAt)) {
        const due = prevVerifier ? new Date(Date.now() + s.settings.verifierSlaDays * 86400000).toISOString() : null;
        s = { ...s, reviews: [...s.reviews, { id: uid('rv'), studentId: p.studentId, verifierId: prevVerifier, assignedAt: prevVerifier ? now() : null, slaDueAt: due, submittedAt: now(), checklist: {}, notes: '', recommendation: null, reason: '', decidedAt: null }] };
        if (prevVerifier) s = notify(s, prevVerifier, 'Approval', 'Updated application to re-check', `${short(s, p.studentId)} sent the information you asked for.`);
      }
      s = notify(s, studentUser(s, p.studentId), 'Approval', 'Application submitted', 'A trust officer will verify it.');
      s = notify(s, guardianUser(s, p.studentId), 'Approval', 'Application submitted', 'The trust will now verify the application. A verifier may call you.');
      s = notifyRole(s, 'admin', 'Approval', 'New application', `${short(s, p.studentId)} submitted an application. Assign a verifier.`);
      return audit(s, actor, 'Submitted application', 'student', p.studentId);
    }

    case 'sendConsentLink': {
      const wasPending = getGuardian(s, p.studentId)?.consentState === 'pending';
      s = { ...s, guardians: patchWhere(s.guardians, (g) => g.studentId === p.studentId, { consentState: 'pending', consentSentAt: now() }) };
      const gd = getGuardian(s, p.studentId);
      if (gd && !gd.userId) {
        // The consent link creates a lightweight guardian login (mobile OTP).
        const gUserId = `u-gdn-${p.studentId.slice(-6)}`;
        s = {
          ...s,
          users: s.users.some((u) => u.id === gUserId) ? s.users : [...s.users, { id: gUserId, role: 'guardian', name: gd.name || 'Guardian', email: gd.email || '', mobile: gd.mobile || '', orgId: gd.id }],
          guardians: patchById(s.guardians, gd.id, { userId: gUserId }),
        };
      }
      const st = getStudent(s, p.studentId);
      if (st && st.status === 'Draft') s = setStatus(s, p.studentId, 'Consent pending');
      s = notify(s, guardianUser(s, p.studentId), 'Consent', wasPending ? `Reminder: consent for ${st?.fullName.split(' ')[0]}` : `Consent requested for ${st?.fullName.split(' ')[0]}`, wasPending ? 'A new 48-hour link has been sent. Please review and give consent.' : 'Please review the application and give consent.');
      return audit(s, actor, 'Sent guardian consent link', 'guardian', getGuardian(s, p.studentId)?.id);
    }

    case 'guardianConsent': {
      // decision: 'approved' | 'declined'
      const approved = p.decision === 'approved';
      s = {
        ...s,
        guardians: patchWhere(s.guardians, (g) => g.studentId === p.studentId, {
          ...(p.name ? { name: p.name } : {}),
          ...(p.relation ? { relation: p.relation } : {}),
          ...(p.photoConsent != null ? { photoConsent: !!p.photoConsent } : {}),
          consentState: p.decision,
          consentAt: now(),
          otpVerified: approved,
          approvedDate: approved ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
          declineReason: approved ? null : p.reason,
        }),
      };
      const st = getStudent(s, p.studentId);
      if (approved && st?.status === 'Consent pending') s = setStatus(s, p.studentId, 'Draft');
      s = notify(s, st?.userId, 'Consent', approved ? 'Guardian consent approved' : 'Guardian declined consent', approved ? `${getGuardian(s, p.studentId)?.name} approved your application.` : p.reason || 'Please talk to your guardian.');
      return audit(s, actor, approved ? 'Guardian gave consent' : 'Guardian declined consent', 'guardian', getGuardian(s, p.studentId)?.id);
    }

    case 'assignVerifier': {
      const days = s.settings.verifierSlaDays;
      const due = new Date(Date.now() + days * 86400000).toISOString();
      const v = getUser(s, p.verifierId);
      const open = s.reviews.find((r) => r.studentId === p.studentId && !r.decidedAt);
      s = open
        ? { ...s, reviews: patchById(s.reviews, open.id, { verifierId: p.verifierId, assignedAt: now(), slaDueAt: due }) }
        : { ...s, reviews: [...s.reviews, { id: uid('rv'), studentId: p.studentId, verifierId: p.verifierId, assignedAt: now(), slaDueAt: due, submittedAt: now(), checklist: {}, notes: '', recommendation: null, reason: '', decidedAt: null }] };
      s = { ...s, students: patchById(s.students, p.studentId, { verifierId: p.verifierId }) };
      s = notify(s, p.verifierId, 'Approval', 'New verification task', `${short(s, p.studentId)} is assigned to you. Due in ${days} days.`);
      s = notify(s, studentUser(s, p.studentId), 'Approval', 'Verifier assigned', `${v?.name.split(' ')[0]} from the trust will verify your application.`);
      return audit(s, actor, `Assigned verifier ${v?.name}`, 'student', p.studentId);
    }

    case 'saveReviewDraft':
      return { ...s, reviews: patchById(s.reviews, p.reviewId, { checklist: p.checklist, notes: p.notes }) };

    case 'verifierDecision': {
      // recommendation: 'approve' | 'reject' | 'request_info' | 'escalate'
      const rv = s.reviews.find((r) => r.id === p.reviewId);
      if (!rv) return s;
      s = { ...s, reviews: patchById(s.reviews, rv.id, { recommendation: p.recommendation, reason: p.reason || '', checklist: p.checklist ?? rv.checklist, notes: p.notes ?? rv.notes, decidedAt: now() }) };
      if (p.recommendation === 'reject') {
        // Verifier rejection is a recommendation: the student sees a calm card,
        // and admin can still overturn it from the application page.
        s = setStatus(s, rv.studentId, 'Rejected');
        s = { ...s, students: patchById(s.students, rv.studentId, { rejectReason: p.reason, rejectedByVerifier: true }) };
        s = notify(s, studentUser(s, rv.studentId), 'Approval', 'Application not recommended', p.reason);
        s = notify(s, guardianUser(s, rv.studentId), 'Approval', 'Application not recommended', p.reason);
      }
      if (p.recommendation === 'request_info') {
        s = setStatus(s, rv.studentId, 'Info requested');
        s = { ...s, students: patchById(s.students, rv.studentId, { infoRequest: p.reason }) };
        s = notify(s, studentUser(s, rv.studentId), 'Documents', 'More information needed', p.reason);
        s = notify(s, guardianUser(s, rv.studentId), 'Documents', 'The trust needs more information', p.reason);
      }
      s = notifyRole(s, 'admin', 'Approval', p.recommendation === 'escalate' ? 'Verifier escalated an application' : 'Verifier recommendation received', `${short(s, rv.studentId)}: ${p.recommendation.replace('_', ' ')}${p.reason ? ` · ${p.reason}` : ''}.`);
      return audit(s, actor, `Verifier recommended ${p.recommendation}`, 'review', rv.id);
    }

    case 'adminApproveListing': {
      s = setStatus(s, p.studentId, 'Listed');
      s = { ...s, students: patchById(s.students, p.studentId, { listedAt: now(), overrideReason: p.overrideReason || null, rejectedByVerifier: false, rejectReason: null }) };
      s = { ...s, packages: patchWhere(s.packages, (x) => x.studentId === p.studentId, { adminApproved: true, adminApprovedAt: now() }) };
      s = notify(s, studentUser(s, p.studentId), 'Approval', 'You are listed', 'Your application is approved and visible to verified sponsors.');
      s = notify(s, guardianUser(s, p.studentId), 'Approval', 'Application approved', 'Your child is now listed for sponsors.');
      s = refreshFundingStatus(s, p.studentId);
      return audit(s, actor, p.overrideReason ? `Listed student (override: ${p.overrideReason})` : 'Listed student', 'student', p.studentId);
    }

    case 'adminRejectApplication': {
      s = setStatus(s, p.studentId, 'Rejected');
      s = { ...s, students: patchById(s.students, p.studentId, { rejectReason: p.reason, rejectedByVerifier: false }) };
      s = notify(s, studentUser(s, p.studentId), 'Approval', 'Application not approved', p.reason);
      s = notify(s, guardianUser(s, p.studentId), 'Approval', 'Application not approved', p.reason);
      return audit(s, actor, `Rejected application: ${p.reason}`, 'student', p.studentId);
    }

    case 'adminRequestInfo': {
      s = setStatus(s, p.studentId, 'Info requested');
      s = { ...s, students: patchById(s.students, p.studentId, { infoRequest: p.reason }) };
      s = notify(s, studentUser(s, p.studentId), 'Documents', 'More information needed', p.reason);
      s = notify(s, guardianUser(s, p.studentId), 'Documents', 'The trust needs more information', p.reason);
      return audit(s, actor, `Sent back for info: ${p.reason}`, 'student', p.studentId);
    }

    case 'reviewDocument': {
      // decision: 'verified' | 'rejected'
      s = {
        ...s,
        documents: patchWhere(s.documents, (d) => d.studentId === p.studentId && d.id === p.docId, {
          status: p.decision,
          rejectReason: p.decision === 'rejected' ? p.reason : null,
          detail: p.decision === 'rejected' ? p.reason : 'Checked by trust officer',
        }),
      };
      const doc = s.documents.find((d) => d.studentId === p.studentId && d.id === p.docId);
      s = notify(s, studentUser(s, p.studentId), 'Documents', p.decision === 'verified' ? `${doc?.name} accepted` : `${doc?.name} needs a re-upload`, p.decision === 'verified' ? 'Checked by the trust team.' : p.reason);
      if (p.decision === 'rejected') s = notify(s, guardianUser(s, p.studentId), 'Documents', `Document needed: ${doc?.name}`, p.reason);
      return audit(s, actor, `Document ${p.decision}`, 'document', `${p.studentId}:${p.docId}`);
    }

    case 'reviewExtra': {
      // decision: 'accept' | 'accept_lower' | 'remove'
      const pkg = s.packages.find((x) => x.studentId === p.studentId);
      if (!pkg) return s;
      const extras = pkg.extras.map((e) =>
        e.id !== p.extraId
          ? e
          : p.decision === 'remove'
          ? { ...e, state: 'rejected', adminNote: p.note }
          : { ...e, state: 'normal', excluded: false, approved: true, amount: p.decision === 'accept_lower' ? Number(p.amount) : e.amount, adminNote: p.note || null }
      );
      s = { ...s, packages: patchById(s.packages, pkg.id, { extras }) };
      const ex = extras.find((e) => e.id === p.extraId);
      s = notify(s, studentUser(s, p.studentId), 'Approval', p.decision === 'remove' ? `${ex.category} extra removed` : `${ex.category} extra approved`, p.decision === 'remove' ? p.note : `${formatINR(ex.amount)} added to your package.`);
      return audit(s, actor, `Extra ${p.decision}: ${ex.category} ${formatINR(ex.amount)}`, 'package', pkg.id);
    }

    case 'lockPackage':
      s = { ...s, packages: patchWhere(s.packages, (x) => x.studentId === p.studentId, { locked: true, lockedAt: now() }) };
      // An approved one-time exam/course switch ends when the new package is locked.
      if (getStudent(s, p.studentId)?.courseChangeAllowed)
        s = { ...s, students: patchById(s.students, p.studentId, { courseChangeAllowed: false, examSwitchUsed: true }) };
      return audit(s, actor, 'Locked package', 'package', `pkg:${p.studentId}`);

    case 'requestChange':
      if (p.kind === 'exam_switch') s = { ...s, students: patchById(s.students, p.studentId, { examSwitchRequested: true }) };
      s = { ...s, changeRequests: [{ id: uid('cr'), studentId: p.studentId, kind: p.kind, detail: p.detail, state: 'open', at: now() }, ...s.changeRequests] };
      s = notifyRole(s, 'admin', 'Approval', 'Change request', `${short(s, p.studentId)}: ${p.detail}`);
      return audit(s, actor, `Change request: ${p.kind}`, 'student', p.studentId);

    case 'requestInstitute':
      s = { ...s, instituteRequests: [{ id: uid('ir'), studentId: p.studentId, ...p.request, state: 'open', at: now() }, ...s.instituteRequests] };
      s = notifyRole(s, 'admin', 'Approval', 'Institute request', `${short(s, p.studentId)} asked to add ${p.request.name}, ${p.request.city}.`);
      return audit(s, actor, `Requested institute ${p.request.name}`, 'student', p.studentId);

    case 'requestNewConsentLink': {
      // Guardian opened an expired link and asked for a fresh one.
      const st = getStudent(s, p.studentId);
      s = notify(s, st?.userId, 'Consent', 'Your guardian asked for a new link', `${getGuardian(s, p.studentId)?.name || 'Your guardian'} opened an expired consent link. Tap Resend link on your application.`);
      return audit(s, actor, 'Guardian asked for a new consent link', 'guardian', getGuardian(s, p.studentId)?.id);
    }

    case 'reportConsentLink': {
      s = notifyRole(s, 'admin', 'Consent', 'Consent link reported', `${getGuardian(s, p.studentId)?.name || 'A guardian'} says the link for ${short(s, p.studentId)} looks wrong: ${p.reason}`);
      return audit(s, actor, `Guardian reported consent link: ${p.reason}`, 'guardian', getGuardian(s, p.studentId)?.id);
    }

    case 'uploadDocument': {
      // Manual upload (student, or guardian when the trust asks for it).
      s = {
        ...s,
        documents: patchWhere(s.documents, (d) => d.studentId === p.studentId && d.id === p.docId, {
          status: 'uploaded', source: 'manual', rejectReason: null, fileName: p.file?.name || null,
          detail: p.byGuardian ? 'Uploaded by guardian · Pending check' : 'Uploaded · Pending check',
        }),
      };
      const doc = s.documents.find((d) => d.studentId === p.studentId && d.id === p.docId);
      if (p.byGuardian) s = notify(s, studentUser(s, p.studentId), 'Documents', `${getGuardian(s, p.studentId)?.name?.split(' ')[0] || 'Your guardian'} uploaded ${doc?.name}`, 'It will be checked by the trust team.');
      return audit(s, actor, `Uploaded ${doc?.name}`, 'document', `${p.studentId}:${p.docId}`);
    }

    case 'dropStudent': {
      // Money allocated but not paid moves to the general pool (not refunded to the donor).
      const bal =
        s.allocations.filter((a) => a.targetType === 'student' && a.targetId === p.studentId).reduce((n, a) => n + a.amount, 0) -
        s.disbursements.filter((d) => d.studentId === p.studentId && ['paid', 'confirmed'].includes(d.status)).reduce((n, d) => n + d.amount, 0);
      s = setStatus(s, p.studentId, 'Dropped');
      if (bal > 0) {
        s = {
          ...s,
          allocations: [
            ...s.allocations,
            { id: uid('al'), donationId: null, targetType: 'student', targetId: p.studentId, amount: -bal, state: 'confirmed', createdAt: now(), note: 'Dropped: moved to pool' },
            { id: uid('al'), donationId: null, targetType: 'pool', targetId: 'general', amount: bal, state: 'confirmed', createdAt: now(), note: `From ${p.studentId} (dropped)` },
          ],
        };
        const sponsorIds = [...new Set(s.donations.filter((d) => d.studentId === p.studentId && d.status === 'success').map((d) => d.sponsorId))];
        sponsorIds.forEach((sid) => {
          s = notify(s, getSponsor(s, sid)?.userId, 'Funding', `${short(s, p.studentId)} has left the programme`, `${formatINR(bal)} not yet paid out has moved to the general pool to support other students.`);
        });
      }
      return audit(s, actor, `Marked dropped: ${p.reason || ''}`, 'student', p.studentId);
    }

    // ---- sponsors -----------------------------------------------------------
    case 'registerSponsor': {
      const kyc = p.sponsor.type === 'individual' ? 'not_required' : 'pending';
      s = {
        ...s,
        users: s.users.some((u) => u.id === p.sponsor.userId) ? s.users : [...s.users, { id: p.sponsor.userId, role: 'sponsor', name: p.sponsor.org?.name || p.sponsor.displayName, email: p.sponsor.email, mobile: p.sponsor.mobile, orgId: p.sponsor.id }],
        sponsors: [...s.sponsors.filter((x) => x.id !== p.sponsor.id), { ...p.sponsor, kycStatus: kyc, kycSubmittedAt: kyc === 'pending' ? now() : null, joinedAt: now() }],
      };
      if (kyc === 'pending') s = notifyRole(s, 'admin', 'Approval', 'Sponsor KYC pending', `${p.sponsor.displayName} submitted documents. Target: 48 hours.`);
      return audit(s, actor, 'Registered sponsor', 'sponsor', p.sponsor.id);
    }

    case 'verifySponsorKyc': {
      const ok = p.decision === 'verified';
      s = { ...s, sponsors: patchById(s.sponsors, p.sponsorId, { kycStatus: p.decision, kycVerifiedAt: ok ? now() : null, kycRejectReason: ok ? null : p.reason }) };
      const sp = getSponsor(s, p.sponsorId);
      s = notify(s, sp?.userId, 'Approval', ok ? 'Your organisation is verified' : 'Verification needs attention', ok ? 'Your name can now be public and private programmes are unlocked.' : p.reason);
      return audit(s, actor, ok ? 'Verified sponsor KYC' : `Rejected sponsor KYC: ${p.reason}`, 'sponsor', p.sponsorId);
    }

    case 'updateSponsor':
      s = { ...s, sponsors: patchById(s.sponsors, p.sponsorId, p.patch) };
      return audit(s, actor, `Updated sponsor preferences: ${Object.keys(p.patch).join(', ')}`, 'sponsor', p.sponsorId);

    case 'updateSip': {
      // status: 'active' | 'paused' | 'cancelled'. Money already received stays allocated.
      const sp = getSponsor(s, p.sponsorId);
      if (!sp?.sip) return s;
      s = { ...s, sponsors: patchById(s.sponsors, sp.id, { sip: { ...sp.sip, status: p.status, updatedAt: now() } }) };
      const verb = { active: 'resumed', paused: 'paused', cancelled: 'cancelled' }[p.status];
      s = notify(s, sp.userId, 'Funding', `SIP ${verb}`, p.status === 'cancelled' ? 'No further debits will be taken. Thank you for giving every month.' : p.status === 'paused' ? 'We will not debit you until you resume.' : `Next debit on day ${sp.sip.day} of the month.`);
      return audit(s, actor, `SIP ${verb}`, 'sponsor', sp.id);
    }

    // ---- donations ----------------------------------------------------------
    case 'createDonation': {
      const c = calcCheckout(p.amount, p.feePercent ?? s.settings.platformFeePercent, p.feeMode ?? s.settings.feeMode);
      const d = {
        id: p.id, sponsorId: p.sponsorId, packageProductId: p.packageProductId, studentId: p.studentId || null, cohortId: p.cohortId || null,
        poolId: p.studentId || p.cohortId ? null : p.poolId || 'general', amount: c.toStudents, fee: c.fee, total: c.total,
        paymentRef: p.offline ? p.paymentRef : `pay_${p.id.toUpperCase()}`, status: p.offline ? 'pending' : 'created', createdAt: p.createdAt || now(),
        receiptNo: null, offline: !!p.offline, offlineMode: p.offlineMode || null, sip: !!p.sip, sipDay: p.sipDay || null, anonymous: !!p.anonymous, tranche: p.tranche || null,
        method: p.method || null,
      };
      s = { ...s, donations: [...s.donations, d] };
      return audit(s, actor, `Created donation ${formatINR(c.total)}`, 'donation', d.id);
    }

    case 'markDonationPending':
      return { ...s, donations: patchById(s.donations, p.donationId, { status: 'pending' }) };

    case 'gatewayWebhookFailure': {
      s = { ...s, donations: patchById(s.donations, p.donationId, { status: 'failed', failReason: p.reason || 'Payment failed' }) };
      const d = s.donations.find((x) => x.id === p.donationId);
      s = notify(s, getSponsor(s, d.sponsorId)?.userId, 'Funding', d.sip ? 'SIP debit failed' : 'Payment failed', d.sip ? `Your SIP of ${formatINR(d.total)} could not be debited.` : 'No money was taken. You can try again.');
      if (d.sip) s = notifyRole(s, 'admin', 'Funding', 'SIP debit failed', `${getSponsor(s, d.sponsorId)?.displayName}: ${formatINR(d.total)}.`);
      return audit(s, { id: 'gateway', role: 'system' }, 'Gateway webhook: failed', 'donation', p.donationId);
    }

    case 'gatewayWebhookSuccess': {
      // The ONLY place a donation becomes success (never from the browser redirect).
      const d = s.donations.find((x) => x.id === p.donationId);
      if (!d || d.status === 'success') return s;
      const remaining = d.studentId ? studentRemainingNeed(s, d.studentId) : 0;
      const lines = allocate({ ...d, toStudents: d.amount }, { remainingNeed: remaining });
      const receiptCount = s.receipts.length + 101;
      const receiptNo = `SB/80G/${new Date().getFullYear()}/${String(receiptCount).padStart(6, '0')}`;
      const sp = getSponsor(s, d.sponsorId);
      s = {
        ...s,
        donations: patchById(s.donations, d.id, { status: 'success', receiptNo, paidAt: now() }),
        allocations: [...s.allocations, ...lines.map((l, i) => ({ id: `al-${d.id}-${i + 1}`, donationId: d.id, ...l, state: 'pending', createdAt: now() }))],
        receipts: [...s.receipts, { id: `rc-${d.id}`, donationId: d.id, number: receiptNo, amount: d.total, issuedAt: now(), panMasked: sp?.pan ? `XXXXX${sp.pan.slice(5, 9)}X` : 'Not provided', section: '80G' }],
        reconciliation: [...s.reconciliation, { id: `re-${d.id}`, donationId: d.id, gatewayAmount: d.total, bankAmount: null, state: 'pending', checkedBy: null, checkedAt: null, note: '' }],
      };
      if (d.sip && d.sipDay && sp) {
        // First SIP payment sets up the monthly mandate.
        s = { ...s, sponsors: patchById(s.sponsors, sp.id, { sip: { amount: d.amount, day: d.sipDay, status: 'active', startedAt: now() } }) };
      }
      s = notify(s, sp?.userId, 'Funding', 'Payment successful', `${formatINR(d.total)} received. Your 80G receipt ${receiptNo} is ready.`);
      if (d.studentId) {
        const toStudent = lines.find((l) => l.targetType === 'student')?.amount || 0;
        s = notify(s, studentUser(s, d.studentId), 'Funding', `A sponsor contributed ${formatINR(toStudent)}`, 'The trust is confirming the payment with the bank.');
        s = notify(s, guardianUser(s, d.studentId), 'Funding', 'New contribution', `${formatINR(toStudent)} was pledged for your child's package.`);
      }
      s = notifyRole(s, 'admin', 'Funding', 'Donation received', `${sp?.displayName}: ${formatINR(d.total)} (incl. ${formatINR(d.fee)} fee).`);
      s = notifyRole(s, 'finance', 'Funding', 'Donation to reconcile', `${formatINR(d.total)} from ${sp?.displayName} is waiting for a bank match.`);
      return audit(s, { id: 'gateway', role: 'system' }, `Gateway webhook: success ${formatINR(d.total)}`, 'donation', d.id);
    }

    case 'sipCycle': {
      // Demo: advance one monthly SIP debit (success or failure). Each cycle is a
      // normal donation to the general pool with its own monthly receipt.
      const sp = getSponsor(s, p.sponsorId);
      if (!sp?.sip || sp.sip.status !== 'active') return s;
      const last = s.donations.filter((d) => d.sponsorId === sp.id && d.sip).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
      const base = last ? new Date(last.createdAt) : new Date();
      const at = new Date(base.getFullYear(), base.getMonth() + 1, sp.sip.day, 6, 0, 0).toISOString();
      const id = uid('dsip');
      const sipProduct = s.packageProducts.find((x) => x.type === 'SIP');
      s = reducer(s, { type: 'createDonation', payload: { id, sponsorId: sp.id, packageProductId: sipProduct?.id, poolId: 'general', amount: sp.sip.amount, sip: true, createdAt: at, method: 'UPI AutoPay' }, actor });
      return p.fail
        ? reducer(s, { type: 'gatewayWebhookFailure', payload: { donationId: id, reason: 'Mandate debit failed: insufficient balance' }, actor })
        : reducer(s, { type: 'gatewayWebhookSuccess', payload: { donationId: id }, actor });
    }

    case 'reconcileDonation': {
      // state: 'matched' | 'mismatch' | 'resolved'
      const matched = p.state === 'matched' || p.state === 'resolved';
      s = {
        ...s,
        reconciliation: patchWhere(s.reconciliation, (r) => r.donationId === p.donationId, {
          state: p.state, bankAmount: p.bankAmount ?? undefined, note: p.note || '', checkedBy: actor?.id, checkedAt: now(),
        }),
        allocations: patchWhere(s.allocations, (a) => a.donationId === p.donationId, { state: matched ? 'confirmed' : 'pending' }),
      };
      const d = s.donations.find((x) => x.id === p.donationId);
      if (matched && d?.studentId) {
        s = notify(s, studentUser(s, d.studentId), 'Funding', 'Funds received', 'The trust has confirmed the contribution with the bank.');
        s = refreshFundingStatus(s, d.studentId);
      }
      if (p.state === 'mismatch') s = notifyRole(s, 'admin', 'Funding', 'Reconciliation mismatch', `${getSponsor(s, d.sponsorId)?.displayName}: ${p.note}`);
      return audit(s, actor, `Reconciliation ${p.state}`, 'donation', p.donationId);
    }

    case 'allocateDonation': {
      // Pool top-up: move pool money to a student (or cohort). Capped at remaining need.
      const amt = Math.min(Number(p.amount), p.studentId ? studentRemainingNeed(s, p.studentId) : Number(p.amount));
      if (amt <= 0) return s;
      s = {
        ...s,
        allocations: [
          ...s.allocations,
          { id: uid('al'), donationId: null, targetType: 'pool', targetId: p.poolId || 'general', amount: -amt, state: 'confirmed', createdAt: now(), note: p.reason },
          { id: uid('al'), donationId: null, targetType: p.studentId ? 'student' : 'cohort', targetId: p.studentId || p.cohortId, amount: amt, state: 'confirmed', createdAt: now(), note: p.reason, fromPool: p.poolId || 'general' },
        ],
      };
      if (p.studentId) {
        s = notify(s, studentUser(s, p.studentId), 'Funding', `${formatINR(amt)} added from the trust pool`, 'The trust topped up your package from pooled donations.');
        s = refreshFundingStatus(s, p.studentId);
      }
      return audit(s, actor, `Pool top-up ${formatINR(amt)}: ${p.reason}`, 'student', p.studentId || p.cohortId);
    }

    case 'transferOperations':
      s = { ...s, opsTransfers: [...s.opsTransfers, { id: uid('ot'), amount: Number(p.amount), at: now(), by: actor?.id, note: p.note || 'Monthly transfer to operating account' }] };
      return audit(s, actor, `Moved ${formatINR(p.amount)} to operating account`, 'opsTransfer', 'operations');

    // ---- payouts (maker-checker) --------------------------------------------
    case 'createDisbursement': {
      // Maker (finance or admin) prepares a payout. It starts as a draft unless submitted straight away.
      if (actor && !['finance', 'admin'].includes(actor.role)) return s;
      const d = {
        id: p.id || uid('ds'), status: p.submit ? 'pending_trustee' : 'draft', createdBy: actor?.id, createdAt: now(), approvedBy: null, approvedAt: null,
        utr: null, paidOn: null, confirmedAt: null, rejectReason: null, ...p.disbursement,
      };
      s = { ...s, disbursements: [...s.disbursements, d] };
      if (p.invoice) {
        // Invoice uploaded by finance/admin on behalf of the institute, or an existing institute invoice.
        const existing = s.invoices.find((i) => i.id === p.invoice.id);
        s = existing
          ? { ...s, invoices: patchById(s.invoices, existing.id, { status: 'used' }) }
          : { ...s, invoices: [...s.invoices, { id: uid('inv'), status: 'used', uploadedBy: actor?.id, at: now(), ...p.invoice }] };
      }
      if (p.submit) {
        s = notifyRole(s, 'trustee', 'Payout', 'Payout awaiting your approval', `${formatINR(d.amount)} for ${short(s, d.studentId)}, instalment ${d.instalmentNo}.`);
        s = notifyRole(s, 'admin', 'Payout', 'Payout awaiting trustee', `${formatINR(d.amount)} for ${short(s, d.studentId)}.`);
      }
      return audit(s, actor, `Created disbursement ${formatINR(d.amount)}${p.submit ? ' and sent to trustee' : ' (draft)'}`, 'disbursement', d.id);
    }

    case 'submitDisbursement': {
      const d = s.disbursements.find((x) => x.id === p.disbursementId);
      if (!d || d.status !== 'draft') return s;
      s = { ...s, disbursements: patchById(s.disbursements, d.id, { status: 'pending_trustee', submittedAt: now() }) };
      s = notifyRole(s, 'trustee', 'Payout', 'Payout awaiting your approval', `${formatINR(d.amount)} for ${short(s, d.studentId)}, instalment ${d.instalmentNo}.`);
      s = notifyRole(s, 'admin', 'Payout', 'Payout awaiting trustee', `${formatINR(d.amount)} for ${short(s, d.studentId)}.`);
      return audit(s, actor, 'Sent disbursement to trustee', 'disbursement', d.id);
    }

    case 'discardDisbursement': {
      const d = s.disbursements.find((x) => x.id === p.disbursementId);
      if (!d || d.status !== 'draft') return s;
      s = { ...s, disbursements: s.disbursements.filter((x) => x.id !== d.id), invoices: patchWhere(s.invoices, (i) => i.invoiceNo === d.invoiceNo && i.status === 'used', { status: 'submitted' }) };
      return audit(s, actor, 'Discarded draft disbursement', 'disbursement', d.id);
    }

    case 'retryPayout': {
      // After a bank return the trustee approval still stands; finance pays again and enters a new UTR.
      s = { ...s, disbursements: patchById(s.disbursements, p.disbursementId, { status: 'approved', utr: null, paidOn: null }) };
      return audit(s, actor, 'Payout ready to pay again after bank return', 'disbursement', p.disbursementId);
    }

    case 'recordRefund': {
      // Student dropped after payout: the institute refunds to the trust account; it goes to the general pool.
      const amt = Number(p.amount);
      if (!amt) return s;
      const id = uid('rf');
      s = {
        ...s,
        refunds: [...(s.refunds || []), { id, studentId: p.studentId, disbursementId: p.disbursementId, amount: amt, at: now(), note: p.note }],
        allocations: [...s.allocations, { id: uid('al'), donationId: null, targetType: 'pool', targetId: 'general', amount: amt, state: 'confirmed', createdAt: now(), note: `Refund from institute for ${p.studentId}` }],
      };
      return audit(s, actor, `Recorded institute refund ${formatINR(amt)} to the pool`, 'refund', id);
    }

    case 'uploadInvoice': {
      if (actor?.role === 'institute' && getUser(s, actor.id)?.orgId !== p.invoice.instituteId) return s;
      const inv = { id: uid('inv'), status: 'submitted', uploadedBy: actor?.id, at: now(), ...p.invoice };
      s = { ...s, invoices: [...s.invoices, inv] };
      s = notifyRole(s, 'finance', 'Payout', 'New fee invoice', `${inv.invoiceNo} · ${formatINR(inv.amount)} for ${short(s, inv.studentId)}, instalment ${inv.instalmentNo}.`);
      return audit(s, actor, `Uploaded invoice ${inv.invoiceNo}`, 'invoice', inv.id);
    }

    case 'trusteeDecision': {
      const d = s.disbursements.find((x) => x.id === p.disbursementId);
      if (!d || d.status !== 'pending_trustee') return s;
      if (actor?.role !== 'trustee' || d.createdBy === actor?.id) return s; // only trustees approve; maker and checker must be different people
      const ok = p.decision === 'approved';
      s = { ...s, disbursements: patchById(s.disbursements, d.id, { status: ok ? 'approved' : 'rejected', approvedBy: actor?.id, approvedAt: now(), rejectReason: ok ? null : p.reason }) };
      s = notifyRole(s, 'finance', 'Payout', ok ? 'Payout approved' : 'Payout rejected', ok ? `${formatINR(d.amount)} for ${short(s, d.studentId)}. Pay by NEFT/RTGS and enter the UTR.` : p.reason);
      return audit(s, actor, ok ? 'Approved disbursement' : `Rejected disbursement: ${p.reason}`, 'disbursement', d.id);
    }

    case 'markPaid': {
      const d = s.disbursements.find((x) => x.id === p.disbursementId);
      s = { ...s, disbursements: patchById(s.disbursements, d.id, { status: 'paid', utr: p.utr, paidOn: p.paidOn, paidBy: actor?.id }) };
      s = { ...s, invoices: patchWhere(s.invoices, (i) => i.invoiceNo === d.invoiceNo, { status: 'paid' }) };
      s = notify(s, guardianUser(s, d.studentId), 'Payout', `Instalment ${d.instalmentNo} paid`, `${formatINR(d.amount)} paid by the trust to the institute.`);
      s = notify(s, studentUser(s, d.studentId), 'Payout', `Instalment ${d.instalmentNo} paid`, `${formatINR(d.amount)} paid to your institute.`);
      s.users.filter((u) => u.role === 'institute' && u.orgId === d.instituteId).forEach((u) => {
        s = notify(s, u.id, 'Payout', 'Payment sent', `${formatINR(d.amount)} for ${short(s, d.studentId)}, UTR ${p.utr}. Please confirm receipt.`);
      });
      return audit(s, actor, `Entered UTR ${p.utr}`, 'disbursement', d.id);
    }

    case 'markPaymentFailed': {
      // Bank return: status failed; the amount is automatically back in the student's balance.
      s = { ...s, disbursements: patchById(s.disbursements, p.disbursementId, { status: 'failed', rejectReason: p.reason }) };
      s = notifyRole(s, 'finance', 'Payout', 'Bank return', `${p.reason}. The amount is back in the student's balance.`);
      s = notifyRole(s, 'admin', 'Payout', 'Bank return on a payout', p.reason);
      return audit(s, actor, `Payout failed: ${p.reason}`, 'disbursement', p.disbursementId);
    }

    case 'instituteConfirm': {
      const d = s.disbursements.find((x) => x.id === p.disbursementId);
      if (!d || d.status !== 'paid') return s;
      // An institute login can only confirm its own payouts (admin/finance can act on its behalf).
      if (actor?.role === 'institute' && getUser(s, actor.id)?.orgId !== d.instituteId) return s;
      s = { ...s, disbursements: patchById(s.disbursements, d.id, { status: 'confirmed', confirmedAt: now(), receiptFile: p.receiptFile || null }) };
      if (getStudent(s, d.studentId)?.status === 'Fully funded') {
        s = setStatus(s, d.studentId, 'Enrolled');
        s = notify(s, studentUser(s, d.studentId), 'Payout', 'You are enrolled', 'Your institute confirmed your fee. All the best for your classes.');
        s = notify(s, guardianUser(s, d.studentId), 'Payout', 'Your child is enrolled', 'The institute confirmed receiving the fee from the trust.');
      }
      s = notifyRole(s, 'finance', 'Payout', 'Institute confirmed fee receipt', `${formatINR(d.amount)} for ${short(s, d.studentId)}.`);
      s = audit(s, actor, 'Institute confirmed fee receipt', 'disbursement', d.id);
      // Confirmed = utilised. Sponsors of this student whose package carries a Sponsorship
      // Certificate get one (once per sponsor and student).
      const donors = {};
      s.donations
        .filter((x) => x.studentId === d.studentId && x.status === 'success')
        .forEach((x) => {
          const prod = s.packageProducts.find((pp) => pp.id === x.packageProductId);
          if (prod && prod.certificateTemplate !== 'sponsorship') return;
          const amt = s.allocations.filter((a) => a.donationId === x.id && a.targetType === 'student').reduce((n, a) => n + a.amount, 0);
          if (!donors[x.sponsorId]) donors[x.sponsorId] = { amount: 0, donationId: x.id };
          donors[x.sponsorId].amount += amt;
        });
      Object.entries(donors).forEach(([sponsorId, info]) => {
        const has = s.certificates.some((c) => c.sponsorId === sponsorId && c.type === 'sponsorship' && c.studentIds.includes(d.studentId));
        if (!has && info.amount > 0)
          s = reducer(s, { type: 'issueCertificate', payload: { certificate: { sponsorId, type: 'sponsorship', studentIds: [d.studentId], amount: info.amount, donationId: info.donationId, disbursementId: d.id } }, actor: { id: 'system', role: 'system' } });
      });
      return s;
    }

    case 'issueCertificate': {
      const number = `SB/CERT/${new Date().getFullYear()}/${String(s.certificates.length + 42).padStart(6, '0')}`;
      s = { ...s, certificates: [...s.certificates, { id: uid('ce'), number, issuedAt: now(), signedBy: p.signedBy || 'u-trustee', ...p.certificate }] };
      s = notify(s, getSponsor(s, p.certificate.sponsorId)?.userId, 'Funding', 'Certificate ready', `Your ${p.certificate.type.replace('_', ' ')} certificate ${number} is ready.`);
      return audit(s, actor, `Issued certificate ${number}`, 'certificate', number);
    }

    case 'instituteChangeRequest': {
      const inst = s.catalogue.institutes.find((i) => i.id === p.instituteId);
      s = notifyRole(s, 'admin', 'Approval', `Profile change from ${inst?.name}`, p.detail);
      return audit(s, actor, `Institute asked for a profile change: ${p.detail}`, 'institute', p.instituteId);
    }

    // ---- thank-you notes ----------------------------------------------------
    case 'sendThankYou':
      s = { ...s, thankYouNotes: [{ id: uid('ty'), studentId: p.studentId, sponsorId: p.sponsorId, text: p.text, state: 'pending', at: now() }, ...s.thankYouNotes] };
      s = notifyRole(s, 'admin', 'Approval', 'Thank-you note to moderate', `From ${short(s, p.studentId)}.`);
      return audit(s, actor, 'Sent a thank-you note for moderation', 'thankYouNote', s.thankYouNotes[0].id);

    case 'moderateThankYou': {
      const t = s.thankYouNotes.find((x) => x.id === p.noteId);
      s = { ...s, thankYouNotes: patchById(s.thankYouNotes, p.noteId, { state: p.decision, moderatedAt: now() }) };
      if (p.decision === 'approved') s = notify(s, getSponsor(s, t.sponsorId)?.userId, 'Progress', `A note from ${short(s, t.studentId)}`, t.text);
      s = notify(s, studentUser(s, t.studentId), 'Funding', p.decision === 'approved' ? 'Your thank-you note was shared' : 'Your thank-you note was not shared', p.reason || 'Thank you for writing.');
      return audit(s, actor, `Thank-you note ${p.decision}`, 'thankYouNote', p.noteId);
    }

    // ---- admin inboxes ------------------------------------------------------
    case 'resolveChangeRequest': {
      // decision: 'approved' | 'declined'
      const cr = s.changeRequests.find((x) => x.id === p.requestId);
      if (!cr) return s;
      const ok = p.decision === 'approved';
      s = { ...s, changeRequests: patchById(s.changeRequests, cr.id, { state: p.decision, note: p.note || '', resolvedAt: now(), resolvedBy: actor?.id }) };
      if (ok) {
        // Unlock the package so the student can edit; exam switch also reopens the course step once.
        s = { ...s, packages: patchWhere(s.packages, (x) => x.studentId === cr.studentId, { locked: false, lockedAt: null }) };
        if (cr.kind === 'exam_switch') s = { ...s, students: patchById(s.students, cr.studentId, { courseChangeAllowed: true }) };
      }
      if (cr.kind === 'exam_switch') s = { ...s, students: patchById(s.students, cr.studentId, { examSwitchRequested: false }) };
      s = notify(s, studentUser(s, cr.studentId), 'Approval', ok ? 'Change request approved' : 'Change request declined',
        ok ? (cr.kind === 'exam_switch' ? 'You can now change your exam or course once. Lock your package again when done.' : 'Your package is unlocked. Make the change and lock it again.') : p.note || 'Please contact the trust for details.');
      return audit(s, actor, `Change request ${p.decision}: ${cr.detail}`, 'student', cr.studentId);
    }

    case 'resolveInstituteRequest': {
      const ir = s.instituteRequests.find((x) => x.id === p.requestId);
      if (!ir) return s;
      s = { ...s, instituteRequests: patchById(s.instituteRequests, ir.id, { state: p.decision, note: p.note || '', resolvedAt: now() }) };
      s = notify(s, studentUser(s, ir.studentId), 'Approval', p.decision === 'added' ? `${ir.name} is being added` : `${ir.name} could not be added`, p.note || (p.decision === 'added' ? 'The trust is onboarding this institute. You can choose it once it is approved.' : 'Please choose an approved institute.'));
      return audit(s, actor, `Institute request ${p.decision}: ${ir.name}`, 'instituteRequest', ir.id);
    }

    case 'decideInstitute': {
      // decision: 'approved' | 'rejected'
      const ok = p.decision === 'approved';
      s = {
        ...s,
        catalogue: {
          ...s.catalogue,
          institutes: patchById(s.catalogue.institutes, p.instituteId, {
            approvalStatus: p.decision, bankVerified: ok ? p.bankVerified !== false : false, decidedAt: now(), rejectReason: ok ? null : p.reason,
          }),
        },
      };
      const inst = s.catalogue.institutes.find((i) => i.id === p.instituteId);
      s.users.filter((u) => u.role === 'institute' && u.orgId === p.instituteId).forEach((u) => {
        s = notify(s, u.id, 'Approval', ok ? 'Your institute is approved' : 'Institute not approved', ok ? 'Students can now choose your courses.' : p.reason);
      });
      return audit(s, actor, ok ? `Approved institute ${inst?.name}` : `Rejected institute ${inst?.name}: ${p.reason}`, 'institute', p.instituteId);
    }

    case 'resendReceipt': {
      const rc = s.receipts.find((r) => r.id === p.receiptId);
      const d = rc && s.donations.find((x) => x.id === rc.donationId);
      if (!d) return s;
      s = notify(s, getSponsor(s, d.sponsorId)?.userId, 'Funding', 'Receipt sent again', `Your 80G receipt ${rc.number} for ${formatINR(rc.amount)} was sent again.`);
      return audit(s, actor, `Resent receipt ${rc.number}`, 'receipt', rc.id);
    }

    case 'confirmOfflineDonation': {
      // Finance confirms a cheque / bank transfer has reached the trust account;
      // it then follows the same path as a gateway success.
      s = reducer(s, { type: 'gatewayWebhookSuccess', payload: { donationId: p.donationId }, actor });
      return audit(s, actor, 'Confirmed offline donation received', 'donation', p.donationId);
    }

    // ---- catalogue ----------------------------------------------------------
    case 'upsertInstitute':
      s = { ...s, catalogue: { ...s.catalogue, institutes: [...s.catalogue.institutes.filter((i) => i.id !== p.institute.id), p.institute] } };
      return audit(s, actor, 'Saved institute', 'institute', p.institute.id);
    case 'upsertExam':
      s = { ...s, catalogue: { ...s.catalogue, exams: s.catalogue.exams.map((e) => (e.id === p.exam.id ? p.exam : e)) } };
      return audit(s, actor, `Updated ${p.exam.id} progress template`, 'exam', p.exam.id);
    case 'upsertCourse':
      s = { ...s, catalogue: { ...s.catalogue, courses: [...s.catalogue.courses.filter((c) => c.id !== p.course.id), p.course] } };
      return audit(s, actor, 'Saved course', 'course', p.course.id);
    case 'upsertProduct':
      s = { ...s, packageProducts: [...s.packageProducts.filter((x) => x.id !== p.product.id), p.product] };
      return audit(s, actor, 'Saved package product', 'packageProduct', p.product.id);

    case 'upsertUser':
      s = { ...s, users: [...s.users.filter((u) => u.id !== p.user.id), p.user] };
      if (p.user.role === 'verifier' && !s.verifiers.some((v) => v.id === p.user.id))
        s = { ...s, verifiers: [...s.verifiers, { id: p.user.id, name: p.user.name, email: p.user.email, mobile: p.user.mobile, districts: p.user.districts || [] }] };
      return audit(s, actor, `Invited ${p.user.role} ${p.user.name}`, 'user', p.user.id);

    default:
      if (import.meta.env.DEV) console.warn('Unknown store action', type);
      return s;
  }
}

// --- persistence ---------------------------------------------------------------
function loadInitial() {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === STORE_VERSION) return parsed;
    }
  } catch {
    /* storage blocked or corrupt: fall back to seed */
  }
  return buildSeedState();
}

// --- context -------------------------------------------------------------------
const StoreContext = createContext(null);

export function StoreProvider({ children, initialState }) {
  // initialState is for tests and previews; the app loads from localStorage / seed.
  const [state, rawDispatch] = useReducer(reducer, initialState, (init) => init || loadInitial());
  const actorRef = useRef(null);

  // Scheduled reminders: run once per day when the app opens (a cron job in a real backend).
  useEffect(() => {
    if (state.settings.lastReminderRun !== new Date().toISOString().slice(0, 10)) rawDispatch({ type: 'runReminders', payload: {}, actor: { id: 'system', role: 'system' } });
  }, [state.settings.lastReminderRun]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota / private mode */
    }
  }, [state]);

  const value = useMemo(() => {
    const dispatch = (type, payload) => rawDispatch({ type, payload, actor: actorRef.current });
    const resetDemo = () => {
      try {
        window.localStorage.removeItem(STORE_KEY);
      } catch {
        /* ignore */
      }
      rawDispatch({ type: 'reset' });
    };
    const setActor = (actor) => {
      actorRef.current = actor;
    };
    return { state, dispatch, resetDemo, setActor };
  }, [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
