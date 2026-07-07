"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Control } from "react-hook-form";

type FormTextFieldProps = {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  description?: string;
};

export function FormTextField({
  control,
  name,
  label,
  placeholder,
  type = "text",
  required,
}: FormTextFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive"> *</span>}
          </FormLabel>
          <FormControl>
            <Input type={type} placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
