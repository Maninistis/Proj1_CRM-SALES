"use client";

import { Input } from "@/components/ui/input";

type Props = React.ComponentProps<typeof Input>;

export function PhoneInput({ onChange, ...props }: Props) {
  return (
    <Input
      inputMode="tel"
      onChange={(e) => {
        const filtered = e.target.value.replace(/[^0-9+ ]/g, "");
        e.target.value = filtered;
        onChange?.(e);
      }}
      {...props}
    />
  );
}
