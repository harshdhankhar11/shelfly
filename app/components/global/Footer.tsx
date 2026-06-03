"use client";

import React from "react";
import Link from "next/link";
import { Box } from "lucide-react";

const Linkedin = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-4 w-4"
  >
    <path d="M19 3A2 2 0 0121 5V19A2 2 0 0119 21H5A2 2 0 013 19V5A2 2 0 015 3H19M8.5 17V10.5H6V17H8.5M7.25 9.25A1.25 1.25 0 118.5 8A1.25 1.25 0 017.25 9.25M18 17V13C18 11.9 17.1 11 16 11C14.9 11 14.1 11.9 14.1 13V17H16.6V13C16.6 12.5 17.1 12 17.7 12C18.3 12 18.9 12.5 18.9 13V17H21Z" />
  </svg>
);

const Twitter = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-4 w-4"
  >
    <path d="M22.46 6C21.69 6.35 20.86 6.58 20 6.69C20.88 6.16 21.56 5.3 21.88 4.3C21.05 4.8 20.16 5.17 19.23 5.42C18.45 4.57 17.39 4 16.2 4C13.66 4 11.68 5.97 11.68 8.52C11.68 8.87 11.72 9.21 11.8 9.53C7.72 9.3 4.1 7.38 1.67 4.38C1.25 5.01 1 5.75 1 6.56C1 8.08 1.87 9.44 3.11 10.17C2.39 10.15 1.72 9.95 1.12 9.63C1.12 9.65 1.12 9.68 1.12 9.71C1.12 11.66 2.46 13.24 4.29 13.57C3.89 13.68 3.45 13.74 3 13.74C2.67 13.74 2.35 13.71 2.04 13.66C2.68 15.22 4.19 16.34 6.11 16.38C4.59 17.42 2.77
  18.01 0 18.01C0.66 18.01 1.32 17.99 1.97 17.95C3.89 19.07 5.39 19.68 7.21 19.68C16.2 19.68 21.15 12.8 21.15 8.52C21.15 8.28 21.15 8.04 21.14 7.81C22.01 7.24 22.75 6.56 23.46 5.77L22.46 6Z" />
  </svg>
);

const Github = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-4 w-4"
  >
    <path d="M12 2C6.47715 2 2 6.47715 2 12C2 16.4183 5.65685 20.1667 10.4375 21.8333C11.0375 21.9167 11.25 21.5833 11.25 21.2917C11.25 21.0208 11.2375 20.3333 11.2311 19.4167C7.8375 20.0833 7.2311 18.75 7.2311 18.75C6.65685 17.4167 6.0625 17.0833 6.0625 17.083
    C5.4375 16.4167 6.125 16.4375 6.125 16.4375C6.8125 16.5208 7.1875 17.2083 7.1875 17.2083C7.875 18.2917 8.96875 17.875 9.34375 17.5833C9.4375 16.9583 9.71875 16.5208 10.0311 16.25C7.2311 15.9792 4.40685 15 4.40685 10C4.40685 8.83333 4.84375 7.91667 5.625 7C5.53185 6.72917 5.15685 5.8125 5.71875 4.6875C5.71875 4.6875 6.46875 4.39583 11.2311 6C12.0311 5.70833 12.8438 5.5625 13.6564 5.5625C14.4688
    5.5625 15.2814 5.70833 16.0814 6C20.8438 4.39583 21.5938 4.6875 21.5938 4.6875C22.1567 5.8125 21.7817 6.72917 21.6874 7C22.4688 7.91667 22.9057 8.83333 22.9057 10C22.9057 15 20.0804 15.9792 17.2804 16.25C17.7188 16.5833 18.1567 17.2083 18.1567 18.25C18.1567 19.8125 18.1432 20.9583 18.1432 21.2917C18.1432 21.5833 18.3567 21.9167 18.9567 21.8333C23.7374 20.1667 27.3942 16.4183 27.3942 12C27.3942 6.47715 22.9168 2 17.3942 2H12Z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white/40 py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-gradient-to-br from-primary to-secondary text-white">
                <Box className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold tracking-tight text-gray-900">Shelfly</span>
            </Link>
            <p className="text-xs text-gray-500">
              Smart Inventory & Order Management solutions tailored for modern businesses.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-xs text-gray-500 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a href="#features" className="text-xs text-gray-500 hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-xs text-gray-500 hover:text-primary transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-xs text-gray-500 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs text-gray-500 hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Social</h4>
            <div className="flex gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <Github />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <Linkedin />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-150 pt-8 text-center">
          <p className="text-[11px] text-gray-400">
            &copy; {new Date().getFullYear()} Shelfly. All rights reserved. Made in India.
          </p>
        </div>
      </div>
    </footer>
  );
}
