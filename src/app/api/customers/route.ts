import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/customers
 * Ambil semua data customer
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const customers = await prisma.customer.findMany({
            include: {
                branch: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({
            success: true,
            data: customers,
        });
    } catch (error: any) {
        console.error("Error fetching customers:", error);
        return NextResponse.json(
            { success: false, message: "Gagal mengambil data customer" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/customers
 * Tambah customer baru
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Hanya super admin atau company yang boleh buat customer
        const userRole = (session.user as any).role;
        if (userRole !== "super admin" && userRole !== "company") {
            return NextResponse.json(
                { success: false, message: "Forbidden: Akses ditolak" },
                { status: 403 }
            );
        }

        const data = await request.json();

        // Basic validation
        if (!data.name || !data.email || !data.customerCode) {
            return NextResponse.json(
                { success: false, message: "Nama, Email, dan Customer Code wajib diisi" },
                { status: 400 }
            );
        }

        const customer = await prisma.customer.create({
            data: {
                ...data,
                createdById: session.user.id,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Customer berhasil dibuat",
            data: customer,
        });
    } catch (error: any) {
        console.error("Error creating customer:", error);
        if (error.code === 'P2002') {
            return NextResponse.json(
                { success: false, message: "Customer Code atau Email sudah digunakan" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, message: "Gagal membuat customer" },
            { status: 500 }
        );
    }
}
