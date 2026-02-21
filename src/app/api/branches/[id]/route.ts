import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const branchSchema = z.object({
    name: z.string().min(1, "Nama branch wajib diisi"),
});

/**
 * GET /api/branches/[id]
 * Ambil data branch tunggal
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const branch = await prisma.branch.findUnique({
            where: { id },
        });

        if (!branch) {
            return NextResponse.json(
                { success: false, message: "Branch tidak ditemukan" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: branch,
        });
    } catch (error: any) {
        console.error("Error fetching branch:", error);
        return NextResponse.json(
            { success: false, message: "Gagal mengambil data branch" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/branches/[id]
 * Update data branch
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
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

        const branch = await prisma.branch.update({
            where: { id },
            data: { name },
        });

        return NextResponse.json({
            success: true,
            message: "Branch berhasil diperbarui",
            data: branch,
        });
    } catch (error: any) {
        console.error("Error updating branch:", error);
        return NextResponse.json(
            { success: false, message: "Gagal memperbarui branch" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/branches/[id]
 * Hapus data branch
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "super admin" && userRole !== "company") {
            return NextResponse.json(
                { success: false, message: "Forbidden: Akses ditolak" },
                { status: 403 }
            );
        }

        // Cek apakah ada user atau department yang masih terikat ke branch ini
        const departmentCount = await prisma.department.count({
            where: { branchId: id },
        });

        const userCount = await prisma.user.count({
            where: { branchId: id },
        });

        if (departmentCount > 0 || userCount > 0) {
            return NextResponse.json(
                { 
                    success: false, 
                    message: "Gagal menghapus: Branch masih memiliki department atau user yang terikat" 
                },
                { status: 400 }
            );
        }

        await prisma.branch.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Branch berhasil dihapus",
        });
    } catch (error: any) {
        console.error("Error deleting branch:", error);
        return NextResponse.json(
            { success: false, message: "Gagal menghapus branch" },
            { status: 500 }
        );
    }
}
