import styles from "@/features/analytics-dashboard/AnalyticsDashboard.module.css";

interface LoadingPanelProps {
  minHeight?: number;
}

export function LoadingPanel({ minHeight = 180 }: LoadingPanelProps) {
  return <div className={styles.skeleton} style={{ minHeight }} aria-hidden="true" />;
}
