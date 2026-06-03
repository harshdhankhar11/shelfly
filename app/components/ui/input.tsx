"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = "",
  id,
  type = "text",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={id} className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      ) : null}
      <div className="relative rounded-[6px] shadow-sm">
        {icon ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            {icon}
          </div>
        ) : null}
        <input
          id={id}
          type={type}
          className={`block w-full rounded-[6px] border border-gray-200 bg-white py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500 ${
            icon ? "pl-10" : "pl-3"
          } ${
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-500" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
