"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  Globe,
  HelpCircle,
  Kanban,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { DASHBOARD_NAV, PLANS } from "@/lib/constants";
import { useWorkspace } from "@/lib/store/workspace-provider";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Globe,
  Layers,
  Kanban,
  MessageSquare,
  Workflow,
  BarChart3,
  Sparkles,
  CreditCard,
  Settings,
  HelpCircle,
};

export function Sidebar() {
  const pathname = usePathname();
  const { data } = useWorkspace();
  const plan = PLANS.find((p) => p.id === data?.workspace.plan);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-surface glass">
      <div className="flex h-16 items-center border-b border-border px-4">
        <Logo size="sm" />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {DASHBOARD_NAV.map((item) => {
          const Icon = iconMap[item.icon] ?? LayoutDashboard;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-purple/15 text-purple-bright shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <div className="rounded-lg bg-gradient-to-br from-purple/20 to-green/10 p-3">
          <p className="text-xs font-medium text-foreground">
            Plano {plan?.name ?? "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {data?.workspace.name ?? "Workspace"}
          </p>
        </div>
      </div>
    </aside>
  );
}
