import { z } from "zod";
import { TransactionType } from "@prisma/client";

export const createTransactionSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  type: z.enum(
    Object.values(TransactionType) as [TransactionType, ...TransactionType[]],
    { message: "Invalid transaction type" }
  ),
  description: z.string().max(255, "Description is too long").optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
