"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { AdminDashboard } from "@/components/portal/AdminDashboard";
import { portalApi, type AuthUser } from "@/lib/portal-api";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = portalApi.getToken();
    const savedUser = portalApi.getCurrentUser();

    if (!savedToken || !savedUser) {
      router.push("/portal");
      return;
    }

    // Verify admin role
    if (savedUser.role !== "ADMIN") {
      router.push("/portal");
      return;
    }

    setToken(savedToken);
    setUser(savedUser);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    portalApi.clearToken();
    router.push("/portal");
  };

  if (loading || !user || !token) {
    return (
      <div className="min-h-screen bg-stone-50 py-8">
        <Container className="max-w-6xl">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
          </div>
        </Container>
      </div>
    );
  }

  return <AdminDashboard user={user} token={token} onLogout={handleLogout} />;
}
