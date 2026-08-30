import styles from "@/features/analytics-dashboard/AnalyticsDashboard.module.css";

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return <div className={styles.emptyState}>{message}</div>;
}
