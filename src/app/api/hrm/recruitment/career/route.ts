import { NextResponse } from "next/server";

/**
 * Tier 3 – Career (mock).
 * Mengembalikan data mock untuk halaman career / lowongan publik.
 * Nantinya bisa diganti dengan query Job yang status active dan visibility public.
 */
const MOCK_CAREER_JOBS = [
  {
    id: "mock-1",
    title: "Software Engineer",
    department: "Engineering",
    location: "Jakarta",
    type: "Full-time",
    postedAt: "2025-02-20",
  },
  {
    id: "mock-2",
    title: "Product Manager",
    department: "Product",
    location: "Jakarta",
    type: "Full-time",
    postedAt: "2025-02-18",
  },
  {
    id: "mock-3",
    title: "HR Specialist",
    department: "Human Resources",
    location: "Bandung",
    type: "Full-time",
    postedAt: "2025-02-15",
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: MOCK_CAREER_JOBS,
    _meta: "Mock data. Ganti dengan query Job (status active, visibility) untuk production.",
  });
}
