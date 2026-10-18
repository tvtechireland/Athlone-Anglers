import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from "@/lib/supabase/env";

// Optimistic check only — the real check lives in src/lib/dal.ts
// (verifySession), run on every committee page. This just avoids a
// round-trip to a page that will immediately redirect anyway, and
// refreshes the Supabase session cookie.
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!isSupabaseConfigured) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const isLoginPage = request.nextUrl.pathname === "/committee/login";

  if (!data.user && !isLoginPage) {
    return NextResponse.redirect(new URL("/committee/login", request.url));
  }

  if (data.user && isLoginPage) {
    return NextResponse.redirect(new URL("/committee/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/committee/:path*"],
};
