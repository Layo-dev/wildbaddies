import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AGE_COOKIE_NAME = "age_verified";

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return (
    ua.includes("googlebot") ||
    ua.includes("bingbot") ||
    ua.includes("slurp") ||
    ua.includes("duckduckbot") ||
    ua.includes("baiduspider") ||
    ua.includes("yandexbot") ||
    ua.includes("facebookexternalhit") ||
    ua.includes("twitterbot")
  );
}

export async function middleware(request: NextRequest) {
  // 1. Initialize the response chain
  let supabaseResponse = NextResponse.next({ request });
  
  const userAgent = request.headers.get("user-agent") || "";
  
  // Robust checking logic: check standard cookies AND fallback to raw headers for edge layers
  const rawCookies = request.headers.get("cookie") || "";
  const hasAgeCookie = request.cookies.has(AGE_COOKIE_NAME) || rawCookies.includes(`${AGE_COOKIE_NAME}=1`);
  
  const isAgeVerified = hasAgeCookie || isBot(userAgent);

  // 2. Run Supabase Session Ring
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    await supabase.auth.getUser();
  }

  // 3. Inject validation configurations
  supabaseResponse.headers.set("x-age-verified", isAgeVerified ? "true" : "false");
  
  // 4. CRITICAL CRACK FOR LIVE PREVIEWS: Disable middleware caching completely 
  supabaseResponse.headers.set("x-middleware-cache", "no-cache");

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.jpg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)\$).*)"],
};
