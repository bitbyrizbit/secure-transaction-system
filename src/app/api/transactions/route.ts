import { NextResponse } from "next/server";
import { secureQuery } from "@/lib/tenant";
import prisma from "@/lib/prisma";
import { createTransactionSchema } from "@/lib/validations";
import { sendTransactionalEmail } from "@/lib/resend";

export async function GET() {
  try {
    // Phase 11: GET requires view_organization_transactions permission
    const transactions = await secureQuery("view_organization_transactions", async (ctx) => {
      return prisma.transaction.findMany({
        where: { organizationId: ctx.organizationId },
        orderBy: { createdAt: 'desc' }
      });
    });
    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "FORBIDDEN" ? 403 : 401 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = createTransactionSchema.safeParse(body);
    
    // Phase 12: Zod Validation
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid payload", details: parseResult.error.format() }, { status: 400 });
    }
    
    const data = parseResult.data;

    const result = await secureQuery("create_transactions", async (ctx) => {
      // Phase 13: Transactional Database Mutation (Atomicity)
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

    // Phase 18: Email Dispatch Handling - Do not await/block, just log failures
    sendTransactionalEmail({
      email: result.user.email,
      recipientName: result.user.name,
      eventType: "TRANSACTION_CREATED",
      transactionId: result.transaction.id,
      amount: result.transaction.amount.toString(),
      type: result.transaction.type,
      status: result.transaction.status,
    });

    return NextResponse.json({ success: true, transaction: result.transaction }, { status: 201 });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (error.message === "UNAUTHORIZED" || error.message === "USER_NOT_FOUND") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
