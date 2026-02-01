"use client";

import { DashboardSidebar, type SidebarItem } from "./dashboard-sidebar";

interface DashboardLayoutProps {
  sidebarItems: SidebarItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function DashboardLayout({
  sidebarItems,
  activeItem,
  onItemClick,
  title,
  subtitle,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen">
      <DashboardSidebar
        items={sidebarItems}
        activeItem={activeItem}
        onItemClick={onItemClick}
        title={title}
        subtitle={subtitle}
      />
      <main className="lg:pl-72">
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
