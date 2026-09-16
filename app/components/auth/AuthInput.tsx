
"use client";

import { InputHTMLAttributes } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function AuthInput({
  label,
  id,
  ...props
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <input
        id={id}
        {...props}
        className="
          h-12
          w-full
          rounded-xl
          border
          border-gray-200
          bg-white
          px-4
          text-sm
          text-gray-900
          outline-none
          transition
          placeholder:text-gray-400
          focus:border-green-500
          focus:ring-4
          focus:ring-green-500/10
        "
      />
    </div>
  );
}

