import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const webhookSecret = process.env.RESEND_WEBHOOK_SECRET || "whsec_dummy";

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const headersList = await headers();
    
    // Phase 20: Webhook Security (Svix verification)
    const svix_id = headersList.get("svix-id");
    const svix_timestamp = headersList.get("svix-timestamp");
    const svix_signature = headersList.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing Svix headers", { status: 400 });
    }

    const wh = new Webhook(webhookSecret);
    let event: any;

    try {
      event = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response("Invalid signature", { status: 400 });
    }

    // Phase 21: Email Event Persistence
    const { type, data } = event;
    const emailId = data?.email_id;
    const recipient = data?.to?.[0] || "unknown";
    
    await prisma.emailEvent.create({
      data: {
        emailId: emailId || "unknown",
        eventType: type,
        recipient: recipient,
        subject: data?.subject || null,
        payload: event,
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook processing error:", error.message);
    return new Response("Internal Server Error", { status: 500 });
  }
}
