import styles from "@/features/analytics-dashboard/AnalyticsDashboard.module.css";
import GoogleLogoutButton from "@/component/admin/GoogleLogoutButton";

interface DashboardHeaderProps {
  title: string;
  showLogout?: boolean;
}

export function DashboardHeader({ title, showLogout = false }: DashboardHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
      </div>

      {showLogout ? <GoogleLogoutButton /> : null}
    </header>
  );
}
