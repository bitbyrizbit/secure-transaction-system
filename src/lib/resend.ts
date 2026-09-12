import { Resend } from "resend";
import ActivityAlert from "@/emails/ActivityAlert";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

export async function sendTransactionalEmail(data: {
  email: string;
  recipientName: string;
  eventType: string;
  transactionId: string;
  amount: string;
  type: string;
  status: string;
}) {
  try {
    const { data: response, error } = await resend.emails.send({
      from: "SecureTx <notifications@secure-tx.com>",
      to: [data.email],
      subject: `Transaction Alert: ${data.eventType}`,
      react: React.createElement(ActivityAlert, {
        recipientName: data.recipientName,
        eventType: data.eventType,
        transactionId: data.transactionId,
        amount: data.amount,
        type: data.type,
        status: data.status,
        timestamp: new Date().toISOString(),
      }),
    });

    if (error) {
      console.error("Resend API error (but transaction succeeded):", error);
      return { success: false, error };
    }
    return { success: true, response };
  } catch (error) {
    console.error("Failed to dispatch email:", error);
    return { success: false, error };
  }
}
