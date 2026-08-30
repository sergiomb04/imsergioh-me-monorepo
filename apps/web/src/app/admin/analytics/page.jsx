import AdminShell from "@/component/admin/AdminShell";
import { AnalyticsDashboard } from "@/features/analytics-dashboard/AnalyticsDashboard";
import { requireAdminSession } from "@/lib/adminSession";
import AvailabilityToggle from "@/component/admin/AvailabilityToggle";

export default async function AdminAnalyticsPage() {
  const token = await requireAdminSession();

  return (
    <AdminShell
      title="Analíticas en tiempo real"
      subtitle="Seguimiento de sesiones activas, eventos de navegación y orígenes de tráfico en vivo"
      badge="LiveState"
      actions={<AvailabilityToggle adminToken={token} />}
    >
      <AnalyticsDashboard adminToken={token} embedded hideHeader />
    </AdminShell>
  );
}
