import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/customers/[id]
 * Ambil data satu customer
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

        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                branch: true,
            }
        });

        if (!customer) {
            return NextResponse.json(
                { success: false, message: "Customer tidak ditemukan" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: customer,
        });
    } catch (error: any) {
        console.error("Error fetching customer:", error);
        return NextResponse.json(
            { success: false, message: "Gagal mengambil data customer" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/customers/[id]
 * Update data customer
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

        // Hanya super admin atau company yang boleh update customer
        const userRole = (session.user as any).role;
        if (userRole !== "super admin" && userRole !== "company") {
            return NextResponse.json(
                { success: false, message: "Forbidden: Akses ditolak" },
                { status: 403 }
            );
        }

        const data = await request.json();

        const customer = await prisma.customer.update({
            where: { id },
            data: {
                ...data,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Customer berhasil diperbarui",
            data: customer,
        });
    } catch (error: any) {
        console.error("Error updating customer:", error);
        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, message: "Customer tidak ditemukan" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { success: false, message: "Gagal memperbarui customer" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/customers/[id]
 * Hapus data customer
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

        // Hanya super admin atau company yang boleh hapus customer
        const userRole = (session.user as any).role;
        if (userRole !== "super admin" && userRole !== "company") {
            return NextResponse.json(
                { success: false, message: "Forbidden: Akses ditolak" },
                { status: 403 }
            );
        }

        await prisma.customer.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Customer berhasil dihapus",
        });
    } catch (error: any) {
        console.error("Error deleting customer:", error);
        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, message: "Customer tidak ditemukan" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { success: false, message: "Gagal menghapus customer" },
            { status: 500 }
        );
    }
}
