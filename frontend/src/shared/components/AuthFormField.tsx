import { Block } from "baseui/block";
import { FormControl } from "baseui/form-control";
import { Input } from "baseui/input";

type InputChange = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

export interface AuthFormFieldProps {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: InputChange) => void;
  placeholder: string;
  autoComplete?: string;
  disabled?: boolean;
}

export function AuthFormField({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled = false,
}: AuthFormFieldProps) {
  return (
    <Block marginBottom="scale600">
      <FormControl label={label}>
        <Input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          autoComplete={autoComplete}
          disabled={disabled}
        />
      </FormControl>
    </Block>
  );
}
