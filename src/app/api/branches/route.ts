import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/branches
 * Ambil semua data branch
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const branches = await prisma.branch.findMany({
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

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Hanya super admin atau company yang boleh buat branch
        const userRole = (session.user as any).role;
        if (userRole !== "super admin" && userRole !== "company") {
            return NextResponse.json(
                { success: false, message: "Forbidden: Akses ditolak" },
                { status: 403 }
            );
        }

        const { name } = await request.json();

        if (!name) {
            return NextResponse.json(
                { success: false, message: "Nama branch wajib diisi" },
                { status: 400 }
            );
        }

        const branch = await prisma.branch.create({
            data: { name },
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
