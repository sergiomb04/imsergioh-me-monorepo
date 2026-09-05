import AdminShell from "@/component/admin/AdminShell";
import AdminLinksManager from "@/features/admin-links/AdminLinksManager";
import { requireAdminSession } from "@/lib/adminSession";
import AvailabilityToggle from "@/component/admin/AvailabilityToggle";

export default async function AdminLinksPage() {
  const token = await requireAdminSession();

  return (
    <AdminShell
      title="Acortador de Links"
      subtitle="Gestión de enlaces cortos y estadísticas de clics"
      badge="URL Manager"
      actions={<AvailabilityToggle adminToken={token} />}
    >
      <AdminLinksManager />
    </AdminShell>
  );
}
