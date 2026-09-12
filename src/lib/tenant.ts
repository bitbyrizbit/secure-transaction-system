import { auth } from "@/lib/auth";
import prisma from "./prisma";
import { headers } from "next/headers";
import { hasPermission, Permission } from "./permissions";

export async function getTenantContext() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) {
        throw new Error("UNAUTHORIZED");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true }
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    return {
        user,
        organizationId: user.organizationId,
        role: user.role.name,
    };
}

export async function secureQuery<T>(
    permission: Permission,
    queryFn: (ctx: Awaited<ReturnType<typeof getTenantContext>>) => Promise<T>
) {
    const ctx = await getTenantContext();

    if (!hasPermission(ctx.role, permission)) {
        throw new Error("FORBIDDEN");
    }

    return queryFn(ctx);
}
