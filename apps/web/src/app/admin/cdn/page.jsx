import AdminShell from "@/component/admin/AdminShell";
import AdminCdnManager from "@/features/admin-cdn/AdminCdnManager";
import { requireAdminSession } from "@/lib/adminSession";
import AvailabilityToggle from "@/component/admin/AvailabilityToggle";

export default async function AdminCdnPage() {
  const token = await requireAdminSession();

  return (
    <AdminShell
      title="Gestión de CDN & Assets"
      subtitle="Subida y administración de archivos multimedia"
      badge="Storage"
      actions={<AvailabilityToggle adminToken={token} />}
    >
      <AdminCdnManager adminToken={token} />
    </AdminShell>
  );
}
