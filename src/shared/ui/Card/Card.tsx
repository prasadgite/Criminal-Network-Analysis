import type { HTMLAttributes, ReactNode } from "react";

import "./Card.css";

export interface CardProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

export default function Card({
  children,
  interactive = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "ui-card",
        interactive ? "ui-card--interactive" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
