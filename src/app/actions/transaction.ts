"use server"

import { secureQuery } from "@/lib/tenant";
import prisma from "@/lib/prisma";
import { createTransactionSchema, CreateTransactionInput } from "@/lib/validations";
import { sendTransactionalEmail } from "@/lib/resend";

export async function createTransactionAction(input: CreateTransactionInput) {
  try {
    const parseResult = createTransactionSchema.safeParse(input);
    
    // Phase 12: Zod Validation
    if (!parseResult.success) {
      return { error: "Invalid payload", details: parseResult.error.format() };
    }
    
    const data = parseResult.data;

    const result = await secureQuery("create_transactions", async (ctx) => {
      // Phase 13: Transactional DB mutation
      return prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            amount: data.amount,
            type: data.type,
            description: data.description,
            organizationId: ctx.organizationId,
            userId: ctx.user.id,
          }
        });

        // Phase 15: Audit Logging
        const auditLog = await tx.auditLog.create({
          data: {
            action: "TRANSACTION_CREATED",
            entity: "Transaction",
            entityId: transaction.id,
            metadata: { amount: data.amount, type: data.type },
            organizationId: ctx.organizationId,
            userId: ctx.user.id,
            transactionId: transaction.id,
          }
        });

        return { transaction, auditLog, user: ctx.user };
      });
    });

    // Phase 18: Email Dispatch Handling (Do not block)
    sendTransactionalEmail({
      email: result.user.email,
      recipientName: result.user.name,
      eventType: "TRANSACTION_CREATED",
      transactionId: result.transaction.id,
      amount: result.transaction.amount.toString(),
      type: result.transaction.type,
      status: result.transaction.status,
    });

    return { success: true, transaction: result.transaction };
  } catch (error: any) {
    if (error.message === "FORBIDDEN") return { error: "Forbidden" };
    if (error.message === "UNAUTHORIZED" || error.message === "USER_NOT_FOUND") return { error: "Unauthorized" };
    return { error: "Internal Server Error" };
  }
}
