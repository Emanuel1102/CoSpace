import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldShellProps {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}

function FieldShell({ label, htmlFor, hint, children }: FieldShellProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

const controlClasses =
  "min-h-12 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/15";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function TextField({ label, hint, id, ...props }: TextFieldProps) {
  const fieldId = id ?? props.name;
  if (!fieldId) {
    throw new Error("TextField requires an id or name");
  }
  return (
    <FieldShell label={label} htmlFor={fieldId} hint={hint}>
      <input id={fieldId} className={controlClasses} {...props} />
    </FieldShell>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  children: ReactNode;
}

export function SelectField({ label, hint, id, children, ...props }: SelectFieldProps) {
  const fieldId = id ?? props.name;
  if (!fieldId) {
    throw new Error("SelectField requires an id or name");
  }
  return (
    <FieldShell label={label} htmlFor={fieldId} hint={hint}>
      <select id={fieldId} className={controlClasses} {...props}>
        {children}
      </select>
    </FieldShell>
  );
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function TextareaField({ label, hint, id, ...props }: TextareaFieldProps) {
  const fieldId = id ?? props.name;
  if (!fieldId) {
    throw new Error("TextareaField requires an id or name");
  }
  return (
    <FieldShell label={label} htmlFor={fieldId} hint={hint}>
      <textarea id={fieldId} className={`${controlClasses} min-h-32 resize-y`} {...props} />
    </FieldShell>
  );
}
