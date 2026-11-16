import { NextRequest, NextResponse } from "next/server";
import { createServiceRequest } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, message: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Bot honeypot: if website is filled, silently succeed without saving
    if (body.website && String(body.website).trim().length > 0) {
      return NextResponse.json({ ok: true, message: "Request received" });
    }

    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim();
    const service = String(body.service ?? "").trim();
    const role = body.role ? String(body.role).trim() : "Service request";
    const message = body.message ? String(body.message).trim() : "";

    const fieldErrors: Record<string, string> = {};

    if (!name || name.length < 2) {
      fieldErrors.name = "Enter your name.";
    }

    const digits = phone.replace(/\D/g, "");
    if (!phone || !/^[+()\d\s-]{7,20}$/.test(phone) || digits.length < 7) {
      fieldErrors.phone = "Enter a valid contact number.";
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fieldErrors.email = "Enter a valid email address.";
    }

    if (!service) {
      fieldErrors.service = "Choose a service.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Please check the highlighted fields.",
          fieldErrors,
        },
        { status: 400 }
      );
    }

    // Get client IP address
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || null;

    const result = await createServiceRequest({
      name,
      email,
      phone,
      service,
      role,
      message,
      ip_address: ip,
    });

    return NextResponse.json(
      {
        ok: true,
        id: result.insertId,
        message: "Service request submitted successfully.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error saving service request to MySQL:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Database connection error";

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to submit request. Please try again later.",
        error: process.env.NODE_ENV !== "production" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
