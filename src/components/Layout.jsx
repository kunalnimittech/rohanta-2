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
  minimal = false,
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
              className="relative w-10 h-10 rounded-full bg-[#F4F4F5] dark:bg-[#151515] flex items-center justify-center text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#ECECEE] dark:hover:bg-[#222224] transition-colors active:scale-[0.96]"
            >
              <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA]" />
              )}
            </button>
          )}
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          {!minimal && (
            <button
              type="button"
              onClick={onGoHome}
              title="Priya Kumari"
              className="w-10 h-10 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] text-[13px] font-semibold flex items-center justify-center"
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
