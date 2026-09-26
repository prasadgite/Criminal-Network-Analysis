import type { ReactNode } from "react";

import "./EmptyState.css";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="ui-empty-state">
      <div className="ui-empty-state__icon">
        —
      </div>

      <h2 className="ui-empty-state__title">
        {title}
      </h2>

      {description && (
        <p className="ui-empty-state__description">
          {description}
        </p>
      )}

      {action && (
        <div className="ui-empty-state__action">
          {action}
        </div>
      )}
    </div>
  );
}
