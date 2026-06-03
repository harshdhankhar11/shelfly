"use client";

import React from "react";
import { Loader2, User, KeyRound, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  accountStatus: string;
}

export default function BuyerProfilePage() {
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [profileStatus, setProfileStatus] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false);

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordStatus, setPasswordStatus] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/buyer/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFullName(data.fullName);
        setPhone(data.phone || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus(null);
    setIsUpdatingProfile(true);

    try {
      const res = await fetch("/api/buyer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setProfileStatus({ type: "success", message: "Profile details updated successfully." });
      } else {
        const data = await res.json();
        setProfileStatus({ type: "error", message: data.error || "Failed to update profile." });
      }
    } catch {
      setProfileStatus({ type: "error", message: "Network error occurred." });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "New passwords do not match." });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const res = await fetch("/api/buyer/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setPasswordStatus({ type: "success", message: "Password updated successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        setPasswordStatus({ type: "error", message: data.error || "Failed to change password." });
      }
    } catch {
      setPasswordStatus({ type: "error", message: "Network error occurred." });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-emerald-605 animate-spin" />
        <p className="text-xs text-slate-550 mt-2">Loading user specifications...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-205 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Configuration</h1>
        <p className="text-xs text-slate-550 mt-1">
          Customize contact indicators, configure authorization passwords, and monitor limits.
        </p>
      </div>

      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 rounded-[6px] border border-slate-200 bg-white p-5 shadow-sm space-y-5 h-fit">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-250">
                <User className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{profile.fullName}</h3>
                <p className="text-xs text-slate-500">{profile.email}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-555">Account Role:</span>
                <span className="font-bold text-emerald-705 uppercase bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-[6px]">
                  {profile.role}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-555">System Status:</span>
                <span className="font-bold text-slate-700 uppercase bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-[6px] flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{profile.accountStatus}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="rounded-[6px] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Profile Specifications
              </h3>

              {profileStatus && (
                <div
                  className={`p-3 rounded-[6px] text-xs font-semibold border ${
                    profileStatus.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-805"
                      : "bg-rose-50 border-rose-200 text-rose-705"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {profileStatus.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span>{profileStatus.message}</span>
                  </span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <Button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="bg-emerald-600 hover:bg-emerald-500 text-xs px-4 py-2"
                  >
                    {isUpdatingProfile ? "Updating Details..." : "Save Profile Details"}
                  </Button>
                </div>
              </form>
            </div>

            <div className="rounded-[6px] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Security & Passwords
              </h3>

              {passwordStatus && (
                <div
                  className={`p-3 rounded-[6px] text-xs font-semibold border ${
                    passwordStatus.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-805"
                      : "bg-rose-50 border-rose-200 text-rose-705"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {passwordStatus.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span>{passwordStatus.message}</span>
                  </span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <Button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="bg-emerald-600 hover:bg-emerald-500 text-xs px-4 py-2"
                  >
                    {isUpdatingPassword ? "Updating Password..." : "Modify Secure Credentials"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
