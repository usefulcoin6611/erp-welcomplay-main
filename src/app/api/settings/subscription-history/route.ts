import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/settings/subscription-history
 * Returns the authenticated company user's subscription order history.
 * Used by settings Order tab (Subscription History).
 * Query: search (optional), page (default 1), pageSize (default 10).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "company") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subscription history is only available for company accounts",
        },
        { status: 403 },
      );
    }

    const userId = session.user.id as string;
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") ?? "").trim();
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("pageSize") ?? "10", 10)),
    );

    const where: { userId: string; OR?: Array<Record<string, unknown>> } = {
      userId,
    };

    if (search) {
      where.OR = [
        { orderId: { contains: search, mode: "insensitive" } },
        { planName: { contains: search, mode: "insensitive" } },
        { paymentType: { contains: search, mode: "insensitive" } },
        { coupon: { contains: search, mode: "insensitive" } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { orderDate: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          orderId: true,
          userName: true,
          planName: true,
          price: true,
          paymentStatus: true,
          paymentType: true,
          coupon: true,
          receipt: true,
          isRefund: true,
          orderDate: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    const data = orders.map((o) => ({
      id: o.id,
      order_id: o.orderId,
      name: o.userName,
      plan_name: o.planName,
      price: Number(o.price),
      status: o.paymentStatus,
      payment_type: o.paymentType,
      date: o.orderDate.toISOString().slice(0, 10),
      coupon: o.coupon ?? undefined,
      receipt: o.receipt ?? undefined,
      is_refund: o.isRefund,
    }));

    return NextResponse.json({
      success: true,
      data: {
        orders: data,
        totalRecords: total,
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription history:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subscription history" },
      { status: 500 },
    );
  }
}
