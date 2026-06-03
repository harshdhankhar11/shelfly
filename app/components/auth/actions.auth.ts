"use server";

import { hash } from "bcryptjs";
import { UserRole } from "@/app/generated/prisma";
import prisma from "@/utils/prisma";
import redis from "@/utils/redis";
import { sendMail } from "@/utils/mail";
import { getVerificationEmailHtml } from "@/app/components/email/templates";

export async function registerUser(formData: {
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  role: UserRole;
}) {
  try {
    const { email, passwordHash, fullName, phone, role } = formData;

    if (!email || !passwordHash || !fullName || !role) {
      return { success: false, error: "All required fields must be filled" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "A user with this email already exists" };
    }

    const hashedPassword = await hash(passwordHash, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName,
        phone: phone || null,
        role,
        accountStatus: "ACTIVE",
        emailVerified: false,
      },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(`otp:${email}`, otp, "EX", 300);

    await sendMail({
      to: email,
      subject: "Verify Your Shelfly Account",
      htmlContent: getVerificationEmailHtml(fullName, otp),
    });

    return { success: true, email };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create user" };
  }
}

export async function verifyEmailAction(email: string, otp: string) {
  try {
    if (!email || !otp) {
      return { success: false, error: "Email and OTP are required" };
    }

    const cachedOtp = await redis.get(`otp:${email}`);

    if (!cachedOtp || cachedOtp !== otp) {
      return { success: false, error: "Invalid or expired verification code" };
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    await redis.del(`otp:${email}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Verification failed" };
  }
}

export async function resendOtpAction(email: string) {
  try {
    if (!email) {
      return { success: false, error: "Email is required" };
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.emailVerified) {
      return { success: false, error: "Email is already verified" };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(`otp:${email}`, otp, "EX", 300);

    await sendMail({
      to: email,
      subject: "Verify Your Shelfly Account (Resent)",
      htmlContent: getVerificationEmailHtml(user.fullName, otp),
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to resend code" };
  }
}
