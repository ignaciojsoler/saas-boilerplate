import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
  className?: string;
  rightElement?: React.ReactNode;
  name?: string;
  disabled?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ id, label, type = "text", placeholder, required = false, value, onChange, error, className, rightElement, name, disabled }, ref) => {
    return (
      <div className={cn("grid gap-2", className)}>
        <div className="flex items-center justify-between">
          <Label htmlFor={id}>{label}</Label>
          {rightElement}
        </div>
        <Input
          ref={ref}
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={error ? "border-red-500" : ""}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

FormField.displayName = "FormField"; 