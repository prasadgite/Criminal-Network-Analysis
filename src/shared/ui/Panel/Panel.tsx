import type { ReactNode } from "react";

import "./Panel.css";

export interface PanelProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Panel({
  title,
  description,
  actions,
  children,
  className = "",
}: PanelProps) {
  return (
    <section
      className={[
        "ui-panel",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {(title || description || actions) && (
        <header className="ui-panel__header">
          <div>
            {title && (
              <h2 className="ui-panel__title">
                {title}
              </h2>
            )}

            {description && (
              <p className="ui-panel__description">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="ui-panel__actions">
              {actions}
            </div>
          )}
        </header>
      )}

      <div className="ui-panel__body">
        {children}
      </div>
    </section>
  );
}
