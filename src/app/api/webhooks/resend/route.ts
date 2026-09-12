import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const webhookSecret = process.env.RESEND_WEBHOOK_SECRET || "whsec_dummy";

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const headersList = await headers();

    // Phase 20: Webhook Security (Svix signature verification)
    const svix_id = headersList.get("svix-id");
    const svix_timestamp = headersList.get("svix-timestamp");
    const svix_signature = headersList.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing Svix headers", { status: 400 });
    }

    const wh = new Webhook(webhookSecret);
    let event: unknown;

    try {
      event = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("Webhook signature verification failed:", msg);
      return new Response("Invalid signature", { status: 400 });
    }

    // Phase 21: Email Event Persistence
    const e = event as Record<string, unknown>;
    const data = (e.data ?? {}) as Record<string, unknown>;
    const type = typeof e.type === "string" ? e.type : "unknown";
    const emailId = typeof data.email_id === "string" ? data.email_id : "unknown";
    const toArr = Array.isArray(data.to) ? data.to : [];
    const recipient = typeof toArr[0] === "string" ? toArr[0] : "unknown";
    const subject = typeof data.subject === "string" ? data.subject : null;

    await prisma.emailEvent.create({
      data: {
        emailId,
        eventType: type,
        recipient,
        subject,
        payload: e as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook processing error:", msg);
    return new Response("Internal Server Error", { status: 500 });
  }
}
