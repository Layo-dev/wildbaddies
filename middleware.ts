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
  const hasAgeCookie = request.cookies.has(AGE_COOKIE_NAME);
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
          
          // WARNING: This re-initialization wipes headers clean!
          supabaseResponse = NextResponse.next({ request });
          
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    await supabase.auth.getUser();
  }

  // 3. CRITICAL: Inject the header at the VERY END so it survives the Supabase reset
  supabaseResponse.headers.set("x-age-verified", isAgeVerified ? "true" : "false");

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.jpg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
