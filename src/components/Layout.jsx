import React, { useState } from 'react';
import {
  LayoutGrid,
  FileText,
  FolderCheck,
  Package,
  IndianRupee,
  TrendingUp,
  Bell,
  Settings,
  MoreHorizontal,
  LogOut,
  Users,
} from 'lucide-react';
import { Logo, ThemeToggle, BottomSheet } from './ui';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'application', label: 'Application', icon: FileText },
  { id: 'documents', label: 'Documents', icon: FolderCheck },
  { id: 'package', label: 'Package', icon: Package },
  { id: 'funding', label: 'Funding', icon: IndianRupee },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function TopBar({
  isDark,
  onToggleTheme,
  unreadCount = 0,
  onOpenNotifications,
  onGoHome,
  initials = 'PK',
  userName = 'Priya Kumari',
  minimal = false,
  onOpenDemo,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <button
          type="button"
          onClick={onGoHome}
          className="inline-flex items-center gap-2.5 text-[#0A0A0A] dark:text-[#FAFAFA] active:scale-[0.98] transition-transform"
        >
          <Logo className="w-7 h-7" />
          <span className="text-[17px] font-semibold tracking-[-0.02em]">
            Sikshit Bharat
          </span>
        </button>

        <div className="flex items-center gap-2.5 md:gap-3">
          {!minimal && (
            <button
              type="button"
              onClick={onOpenNotifications}
              aria-label="Notifications"
              className="hit-44 relative w-10 h-10 rounded-full bg-[#F4F4F5] dark:bg-[#151515] flex items-center justify-center text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#ECECEE] dark:hover:bg-[#222224] transition-colors active:scale-[0.96]"
            >
              <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA]" />
              )}
            </button>
          )}
          {onOpenDemo && (
            <button
              type="button"
              onClick={onOpenDemo}
              aria-label="Switch demo role"
              title="Demo mode: switch role"
              className="hit-44 w-10 h-10 rounded-full bg-[#F4F4F5] dark:bg-[#151515] flex items-center justify-center text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#ECECEE] dark:hover:bg-[#222224] transition-colors active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/20 dark:focus-visible:ring-[#FAFAFA]/25"
            >
              <Users className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>
          )}
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          {!minimal && (
            <button
              type="button"
              onClick={onGoHome}
              aria-label={userName}
              title={userName}
              className={`hit-44 w-10 h-10 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] text-[13px] font-semibold items-center justify-center ${
                onOpenDemo ? 'hidden sm:flex' : 'flex'
              }`}
            >
              {initials}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function StudentShell({
  activeNav,
  onSelectNav,
  isDark,
  onToggleTheme,
  unreadCount,
  onLogout,
  onOpenDemo,
  children,
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  const mobilePrimary = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'application', label: 'Application', icon: FileText },
    { id: 'funding', label: 'Funding', icon: IndianRupee },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  const mobileMore = [
    { id: 'documents', label: 'Documents', icon: FolderCheck },
    { id: 'package', label: 'Package', icon: Package },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const isMoreActive = mobileMore.some((m) => m.id === activeNav);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAFAFA] transition-colors duration-200">
      <TopBar
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        unreadCount={unreadCount}
        onOpenNotifications={() => onSelectNav('notifications')}
        onGoHome={() => onSelectNav('dashboard')}
        onOpenDemo={onOpenDemo}
      />

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 pt-2 pb-28 md:pb-16 flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 pt-2">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectNav(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-[14px] transition-all duration-150 active:scale-[0.98] ${
                    active
                      ? 'bg-[#F4F4F5] dark:bg-[#151515] font-semibold text-[#0A0A0A] dark:text-[#FAFAFA]'
                      : 'font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA] hover:bg-[#F4F4F5]/60 dark:hover:bg-[#151515]/60'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                    <span>{item.label}</span>
                  </span>
                  {item.id === 'notifications' && unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#0A0A0A] text-white dark:bg-[#FAFAFA] dark:text-[#0A0A0A]">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 pt-6 border-t border-[#ECECEE] dark:border-[#262626]">
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-[14px] font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA] hover:bg-[#F4F4F5]/60 dark:hover:bg-[#151515]/60 transition-colors"
            >
              <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area (max 1040px) */}
        <main className="flex-1 min-w-0 max-w-[1040px]">{children}</main>
      </div>

      {/* Mobile Floating Bottom Pill Bar */}
      <div className="md:hidden fixed bottom-4 inset-x-4 z-40 flex justify-center pointer-events-none">
        <nav className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-full bg-white/95 dark:bg-[#151515]/95 backdrop-blur-md shadow-soft-lg border border-[#ECECEE] dark:border-[#262626]">
          {mobilePrimary.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectNav(item.id)}
                className={`flex flex-col items-center justify-center px-3.5 py-2 rounded-full transition-all active:scale-[0.95] ${
                  active
                    ? 'bg-[#F4F4F5] dark:bg-[#262626] text-[#0A0A0A] dark:text-[#FAFAFA]'
                    : 'text-[#52525B] dark:text-[#A1A1AA]'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                <span className="text-[10px] font-medium mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center px-3.5 py-2 rounded-full transition-all active:scale-[0.95] ${
              isMoreActive
                ? 'bg-[#F4F4F5] dark:bg-[#262626] text-[#0A0A0A] dark:text-[#FAFAFA]'
                : 'text-[#52525B] dark:text-[#A1A1AA]'
            }`}
          >
            <MoreHorizontal className="w-[18px] h-[18px]" strokeWidth={1.75} />
            <span className="text-[10px] font-medium mt-0.5">More</span>
          </button>
        </nav>
      </div>

      <BottomSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="More"
      >
        <div className="space-y-2">
          {mobileMore.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectNav(item.id);
                  setMoreOpen(false);
                }}
                className="w-full flex items-center justify-between px-5 py-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#222224] text-[#0A0A0A] dark:text-[#FAFAFA] font-medium text-[15px] active:scale-[0.98] transition-transform"
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </span>
                {item.id === 'notifications' && unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#0A0A0A] text-white dark:bg-[#FAFAFA] dark:text-[#0A0A0A]">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setMoreOpen(false);
              onLogout();
            }}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-[20px] border border-[#ECECEE] dark:border-[#262626] text-[#52525B] dark:text-[#A1A1AA] font-medium text-[15px]"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.75} />
            <span>Log out</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

// ===========================================================================
// RoleShell — same shell as StudentShell (desktop sidebar, TopBar, mobile
// floating pill + More sheet), parameterised by role. StudentShell above is
// left untouched so the student portal looks exactly as before.
// ===========================================================================
export function RoleShell({
  roleLabel,
  navItems,
  mobilePrimaryIds,
  activeNav,
  onSelectNav,
  homeNav,
  isDark,
  onToggleTheme,
  unreadCount = 0,
  notificationsNav = 'notifications',
  onLogout,
  onOpenDemo,
  initials,
  userName,
  children,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryIds = mobilePrimaryIds || navItems.slice(0, 4).map((n) => n.id);
  const mobilePrimary = primaryIds.map((id) => navItems.find((n) => n.id === id)).filter(Boolean);
  const mobileMore = navItems.filter((n) => !primaryIds.includes(n.id));
  const isMoreActive = mobileMore.some((m) => m.id === activeNav);
  const hasNotifications = navItems.some((n) => n.id === notificationsNav);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAFAFA] transition-colors duration-200">
      <TopBar
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        unreadCount={unreadCount}
        onOpenNotifications={() => hasNotifications && onSelectNav(notificationsNav)}
        onGoHome={() => onSelectNav(homeNav || navItems[0].id)}
        onOpenDemo={onOpenDemo}
        initials={initials}
        userName={userName}
      />

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 pt-2 pb-28 md:pb-16 flex gap-8">
        <aside className="hidden md:flex flex-col w-56 shrink-0 pt-2">
          <div className="px-4 pb-4 text-[11px] font-semibold uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA]">
            {roleLabel}
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectNav(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-[14px] transition-all duration-150 active:scale-[0.98] ${
                    active
                      ? 'bg-[#F4F4F5] dark:bg-[#151515] font-semibold text-[#0A0A0A] dark:text-[#FAFAFA]'
                      : 'font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA] hover:bg-[#F4F4F5]/60 dark:hover:bg-[#151515]/60'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {(item.badge || (item.id === notificationsNav && unreadCount > 0)) ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#0A0A0A] text-white dark:bg-[#FAFAFA] dark:text-[#0A0A0A]">
                      {item.badge || unreadCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 pt-6 border-t border-[#ECECEE] dark:border-[#262626]">
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-[14px] font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA] hover:bg-[#F4F4F5]/60 dark:hover:bg-[#151515]/60 transition-colors"
            >
              <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 max-w-[1040px]">{children}</main>
      </div>

      <div className="md:hidden fixed bottom-4 inset-x-4 z-40 flex justify-center pointer-events-none">
        <nav className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-full bg-white/95 dark:bg-[#151515]/95 backdrop-blur-md shadow-soft-lg border border-[#ECECEE] dark:border-[#262626]">
          {mobilePrimary.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectNav(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center min-w-[56px] px-3 py-2 rounded-full transition-all active:scale-[0.95] ${
                  active ? 'bg-[#F4F4F5] dark:bg-[#262626] text-[#0A0A0A] dark:text-[#FAFAFA]' : 'text-[#52525B] dark:text-[#A1A1AA]'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                <span className="text-[10px] font-medium mt-0.5 max-w-[64px] truncate">{item.short || item.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center min-w-[56px] px-3 py-2 rounded-full transition-all active:scale-[0.95] ${
              isMoreActive ? 'bg-[#F4F4F5] dark:bg-[#262626] text-[#0A0A0A] dark:text-[#FAFAFA]' : 'text-[#52525B] dark:text-[#A1A1AA]'
            }`}
          >
            <MoreHorizontal className="w-[18px] h-[18px]" strokeWidth={1.75} />
            <span className="text-[10px] font-medium mt-0.5">More</span>
          </button>
        </nav>
      </div>

      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} title="More">
        <div className="space-y-2">
          {mobileMore.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectNav(item.id);
                  setMoreOpen(false);
                }}
                className="w-full flex items-center justify-between px-5 py-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#222224] text-[#0A0A0A] dark:text-[#FAFAFA] font-medium text-[15px] active:scale-[0.98] transition-transform"
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </span>
                {item.id === notificationsNav && unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#0A0A0A] text-white dark:bg-[#FAFAFA] dark:text-[#0A0A0A]">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setMoreOpen(false);
              onLogout();
            }}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-[20px] border border-[#ECECEE] dark:border-[#262626] text-[#52525B] dark:text-[#A1A1AA] font-medium text-[15px]"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.75} />
            <span>Log out</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

/** "Switch demo role" sheet. Exists only to walk the end-to-end story in one tab. */
export function DemoRoleSheet({ open, onClose, accounts, currentUserId, onPick, onOpenScript }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Switch demo role">
      <div className="space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40">
          Demo mode
        </span>
        <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
          Jump between roles to follow one application from sign up to certificate. Data is shared across roles in this browser.
        </p>
        {onOpenScript && (
          <button
            type="button"
            onClick={onOpenScript}
            className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-[20px] bg-[#0A0A0A] text-white dark:bg-[#FAFAFA] dark:text-[#0A0A0A] text-left active:scale-[0.98] transition-transform"
          >
            <span>
              <span className="block text-[15px] font-semibold">Open the demo script</span>
              <span className="block text-[13px] opacity-70">17 steps, from sign-up to certificate</span>
            </span>
            <span aria-hidden="true" className="text-[18px]">→</span>
          </button>
        )}
        <div className="space-y-2">
          {accounts.map((a) => {
            const active = a.userId === currentUserId;
            return (
              <button
                key={a.userId}
                type="button"
                onClick={() => onPick(a)}
                aria-current={active ? 'true' : undefined}
                className={`w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-[20px] text-left transition-all active:scale-[0.98] ${
                  active
                    ? 'bg-white dark:bg-[#222224] ring-2 ring-[#0A0A0A] dark:ring-[#FAFAFA]'
                    : 'bg-[#F4F4F5] dark:bg-[#222224] hover:bg-[#ECECEE] dark:hover:bg-[#2E2E32]'
                }`}
              >
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold text-[#0A0A0A] dark:text-[#FAFAFA] truncate">{a.label}</span>
                  <span className="block text-[13px] text-[#52525B] dark:text-[#A1A1AA] truncate">{a.name}</span>
                </span>
                {active && (
                  <span className="text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA] shrink-0">Current</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
