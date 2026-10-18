"use client";

import { useEffect } from "react";

// Supabase's invite/recovery emails redirect to the Site URL (our
// homepage) with the session tokens in the URL hash - there's no way to
// point the dashboard's "Send invitation" email at a specific page. This
// catches that hash on whichever page it lands on and forwards it to the
// page that actually handles it.
export default function AuthHashRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token") && /type=(invite|recovery)/.test(hash)) {
      window.location.replace(`/committee/accept-invite${hash}`);
    }
  }, []);

  return null;
}
