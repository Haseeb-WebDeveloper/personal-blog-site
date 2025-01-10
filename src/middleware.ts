import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "./lib/jwt";

const protectedRoutes = [
    '/admin',
    '/admin/posts',
    '/admin/posts/edit/[postId]',
    '/admin/analytics',
    '/admin/users',
];

// Define allowed origins for CORS
const allowedOrigins = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS?.split(',') || ['*']; // Use '*' to allow all origins, or specify trusted origins

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Handle CORS for API routes
    if (pathname.startsWith('/api')) {
        const origin = req.headers.get('origin');

        // Check if the origin is allowed
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin || '')) {
            const response = NextResponse.next();

            // Add CORS headers
            response.headers.set('Access-Control-Allow-Origin', origin || '*');
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

            // Handle preflight requests
            if (req.method === 'OPTIONS') {
                return new Response(null, {
                    status: 204,
                    headers: {
                        'Access-Control-Allow-Origin': origin || '*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    },
                });
            }

            return response;
        }

        // Block if the origin is not allowed
        return new Response('CORS Error: Origin not allowed', { status: 403 });
    }

    // Handle protected routes
    if (protectedRoutes.includes(pathname)) {
        const token = req.cookies.get('token');
        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', req.url));
        }

        try {
            const decoded = await verifyToken(token.value);
            if (!decoded) {
                return NextResponse.redirect(new URL('/auth/login', req.url));
            }
            return NextResponse.next();
        } catch (error) {
            return NextResponse.redirect(new URL('/auth/login', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)', '/'],
};
