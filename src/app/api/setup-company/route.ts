import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    
    // Check if user already has a company setup
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { branchId: true }
    })

    if (existingUser?.branchId) {
      return NextResponse.json({ 
        success: false, 
        message: "Perusahaan Anda sudah terdaftar. Mengalihkan ke dashboard..." 
      }, { status: 400 })
    }

    const body = await request.json()
    const { companyName, address, phone, website } = body

    if (!companyName) {
      return NextResponse.json({ success: false, message: "Nama perusahaan wajib diisi" }, { status: 400 })
    }

    // Use transaction for data integrity
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create the branch (Central Branch for the company)
      const branch = await tx.branch.create({
        data: {
          name: companyName,
          address: address || null,
          phone: phone || null,
          website: website || null,
          email: session.user.email,
          ownerId: userId, // Set ownerId to company user ID
          users: {
            connect: { id: userId }
          }
        }
      })

      // 2. Update the user's branchId and ownerId
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          branchId: branch.id,
          ownerId: userId, // Set ownerId to self
          name: session.user.name || companyName
        }
      })

      return { branch, updatedUser }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Setup profil perusahaan berhasil",
      data: {
        branchId: result.branch.id
      }
    })

  } catch (error) {
    console.error("Setup company error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to setup company",
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 })
  }
}
