import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/api/auth"];

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Check if the route is public
    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
    const isAuthRoute = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";

    // Only fetch session if we are accessing a protected route OR an auth route (to redirect away)
    // Optimization: Don't check session for purely public assets/routes if we can help it, 
    // but here we need to know if user is logged in to redirect them FROM login page.
    
    // Check session via BetterAuth API
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

    // 1. If user IS authenticated and tries to access auth pages -> Redirect to dashboard
    if (session && isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 2. If user is NOT authenticated and tries to access protected route -> Redirect to login
    if (!session && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all routes except static files, images, favicon, and API auth routes
        "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
    ],
};
