"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost";
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  isLoading,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  let baseStyles = "inline-flex items-center justify-center rounded-[6px] px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  let variantStyles = "";
  if (variant === "primary") {
    variantStyles = "bg-primary text-white hover:bg-opacity-90 focus:ring-primary";
  } else if (variant === "secondary") {
    variantStyles = "bg-secondary text-white hover:bg-opacity-90 focus:ring-secondary";
  } else if (variant === "accent") {
    variantStyles = "bg-accent text-white hover:bg-opacity-90 focus:ring-accent";
  } else if (variant === "outline") {
    variantStyles = "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-55 focus:ring-primary";
  } else if (variant === "ghost") {
    variantStyles = "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-primary";
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="mr-2 h-4 w-4 animate-spin text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
