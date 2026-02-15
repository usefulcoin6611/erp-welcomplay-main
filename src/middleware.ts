import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/api/auth"];

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip public routes and API auth routes
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Check session via BetterAuth API
    // We use betterFetch to call the internal session API
    const { data: session } = await betterFetch<any>(
        "/api/auth/get-session",
        {
            baseURL: request.nextUrl.origin,
            headers: {
                // Pass cookies from the original request
                cookie: request.headers.get("cookie") || "",
            },
        }
    );

    // If no session and trying to access protected route, redirect to login
    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // If session exists but trying to access login, redirect to dashboard
    if (session && pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all routes except static files and favicon
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
