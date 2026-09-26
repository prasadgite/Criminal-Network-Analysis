import type { InputHTMLAttributes } from "react";

import "./Input.css";

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export default function Input({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="ui-input">
      {label && (
        <label
          className="ui-input__label"
          htmlFor={id}
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={[
          "ui-input__control",
          error ? "ui-input__control--error" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />

      {error && (
        <span className="ui-input__error">
          {error}
        </span>
      )}

      {!error && hint && (
        <span className="ui-input__hint">
          {hint}
        </span>
      )}
    </div>
  );
}
