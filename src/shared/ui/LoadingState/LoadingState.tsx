import "./LoadingState.css";

export interface LoadingStateProps {
  label?: string;
}

export default function LoadingState({
  label = "Loading...",
}: LoadingStateProps) {
  return (
    <div
      className="ui-loading-state"
      role="status"
      aria-live="polite"
    >
      <span className="ui-loading-state__spinner" />
      <span>{label}</span>
    </div>
  );
}
