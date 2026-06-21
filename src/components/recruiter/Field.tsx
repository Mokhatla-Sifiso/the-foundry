import type { ChangeEvent, ReactElement } from "react";

type FieldProps = Readonly<{
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "url";
  value: string;
  onChange: (next: string) => void;
  /** Inline icon rendered inside the `.inp` box. */
  icon: ReactElement;
  /** Error message — when truthy the `.field.invalid` class is applied. */
  error?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}>;

/**
 * Form field — VERBATIM markup from §11. Label + `.inp` box with icon
 * on the left and an input. `.field.invalid` shows the `.err` message
 * and switches the border to warn color.
 */
export function Field({
  name,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  icon,
  error,
  autoComplete,
  autoFocus,
}: FieldProps): React.ReactElement {
  const errorId = `${name}-error`;
  return (
    <div className={`field${error ? " invalid" : ""}`}>
      <label htmlFor={name}>{label}</label>
      <div className="inp">
        {icon}
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
      </div>
      <div className="err" id={errorId}>
        {error}
      </div>
    </div>
  );
}
