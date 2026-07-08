"use client";

import { Input } from "@/components/ui/input";

type Props = React.ComponentProps<typeof Input>;

export function PhoneInput({ onChange, ...props }: Props) {
  return (
    <Input
      inputMode="numeric"
      onChange={(e) => {
        const digits = e.target.value.replace(/[^0-9]/g, "");
        e.target.value = digits;
        onChange?.(e);
      }}
      {...props}
    />
  );
}
