import type { ChangeEvent, ReactElement } from "react";

type FieldProps = Readonly<{
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "url";
  value: string;
  onChange: (next: string) => void;
    icon: ReactElement;
    error?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}>;

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
