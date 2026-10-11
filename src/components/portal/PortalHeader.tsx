"use client";

import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/lib/portal-api";

interface PortalHeaderProps {
  user: AuthUser;
  onLogout: () => void;
}

export function PortalHeader({ user, onLogout }: PortalHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-900">
          {user.firstName[0]}
          {user.lastName[0]}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-stone-900">
              Welcome back, {user.firstName} {user.lastName}
            </h1>
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
              {user.role}
            </span>
          </div>
          <p className="text-xs text-stone-500">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user.role === "admin" && (
          <Link
            href="https://pioneer-backend-5qhe.onrender.com/api/v1/docs"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            API Docs
          </Link>
        )}
        <Button
          variant="outline"
          tone="neutral"
          onClick={onLogout}
          className="border-red-200 text-red-700 hover:bg-red-50"
        >
          <LogOut className="mr-1.5 h-3.5 w-3.5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
