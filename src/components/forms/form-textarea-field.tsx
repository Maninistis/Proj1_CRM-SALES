"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { Control } from "react-hook-form";

type FormTextareaFieldProps = {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
};

export function FormTextareaField({
  control,
  name,
  label,
  placeholder,
  required,
  rows = 3,
}: FormTextareaFieldProps) {
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
            <Textarea
              placeholder={placeholder}
              rows={rows}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
