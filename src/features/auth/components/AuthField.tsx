import { FC, ReactNode } from "react";

interface AuthFieldProps {
  id: string;
  label: string;
  required?: boolean;
  tag?: string;
  error?: string;
  children: ReactNode;
}

export const AuthField: FC<AuthFieldProps> = ({
  id,
  label,
  required = false,
  tag,
  error,
  children,
}) => {
  return (
    <div className="auth-field-group">
      <label htmlFor={id} className="auth-label">
        <span>{label}</span>
        {required && (
          <span style={{ color: "var(--color-primary)" }}>
            ● {tag || "REQUIRED"}
          </span>
        )}
      </label>
      <div className="auth-input-wrapper">{children}</div>
      {error && <span className="auth-field-error">{error}</span>}
    </div>
  );
};
