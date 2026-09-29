import { NextResponse } from "next/server";

interface ClaimRequestBody {
  name?: string;
  phone?: string;
}

export async function POST(request: Request) {
  try {
    // Artificial latency to exercise UI loading states
    await new Promise((resolve) => setTimeout(resolve, 800));

    const body: ClaimRequestBody = await request.json().catch(() => ({}));
    const { name, phone } = body;

    // Validate name
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid name (at least 2 letters)." },
        { status: 400 }
      );
    }

    // Validate Indian phone number (10 digits starting with 6-9)
    const cleanedPhone = phone?.replace(/\D/g, "");
    if (!cleanedPhone || !/^[6-9]\d{9}$/.test(cleanedPhone)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // Simulated error scenario for review verification (duplicate claim)
    if (cleanedPhone.endsWith("0000")) {
      return NextResponse.json(
        { success: false, message: "This phone number has already claimed this offer." },
        { status: 409 }
      );
    }

    // Generate random 4-character voucher suffix
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const claimCode = `MORROW-${randomCode}`;

    return NextResponse.json({
      success: true,
      claimCode,
      message: "Your offer has been claimed.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to process your request." },
      { status: 500 }
    );
  }
}
