import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const branchSchema = z.object({
    name: z.string().min(1, "Nama branch wajib diisi"),
});

import { getTenantFilter, getTenantId } from "@/lib/multi-tenancy";

/**
 * GET /api/branches
 * Ambil semua data branch
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as any;
        const userId = user.id;
        const userRole = user.role;

        // Auto-fix for existing data: if current user is 'company' and has no ownerId, set it.
        // Also fix the branch connected to them.
        if (userRole === "company") {
            const currentUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, ownerId: true, branchId: true }
            });

            if (currentUser && !currentUser.ownerId) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { ownerId: userId }
                });
                
                if (currentUser.branchId) {
                    await (prisma as any).branch.update({
                        where: { id: currentUser.branchId },
                        data: { ownerId: userId }
                    });
                }
            }
        }

        const tenantFilter = await getTenantFilter(session.user);
        if (!tenantFilter) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const branches = await prisma.branch.findMany({
            where: tenantFilter,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            success: true,
            data: branches,
        });
    } catch (error: any) {
        console.error("Error fetching branches:", error);
        return NextResponse.json(
            { success: false, message: "Gagal mengambil data branch" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/branches
 * Tambah branch baru
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as any;
        const userRole = user.role;

        // Hanya super admin atau company yang boleh buat branch
        if (userRole !== "super admin" && userRole !== "company") {
            return NextResponse.json(
                { success: false, message: "Forbidden: Akses ditolak" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validation = branchSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: validation.error.errors[0].message,
                    errors: validation.error.format(),
                },
                { status: 400 }
            );
        }

        const { name } = validation.data;
        const ownerId = getTenantId(session.user);

        const branch = await prisma.branch.create({
            data: { 
                name,
                ownerId,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Branch berhasil dibuat",
            data: branch,
        });
    } catch (error: any) {
        console.error("Error creating branch:", error);
        return NextResponse.json(
            { success: false, message: "Gagal membuat branch" },
            { status: 500 }
        );
    }
}
