import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/utils/auth";
import prisma from "@/utils/prisma";
import VerifyEmailForm from "@/app/components/auth/VerifyEmailForm";

export default async function VerifyEmailPage() {
  const session = await auth();

  if (session && session.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { emailVerified: true },
    });

    if (user && user.emailVerified) {
      redirect("/dashboard");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(40rem_40rem_at_center,theme(colors.teal.50),theme(colors.slate.50))]" />
      <Suspense fallback={
        <div className="w-full max-w-md p-8 rounded-[6px] border border-white bg-white/70 shadow-lg backdrop-blur-md text-center text-xs font-semibold text-gray-500">
          Loading verification...
        </div>
      }>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
