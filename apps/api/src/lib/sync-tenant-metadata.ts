import type { Session } from "@supabase/supabase-js";
import { DEV_SEED_TENANT_ID, type UserRole } from "@jewellery-erp/shared";
import { getSupabaseAdminClient, getSupabasePublicClient } from "./supabase.js";

const DEV_SEED_ROLE: UserRole = "OWNER";

export async function syncDevTenantAndRefreshSession(session: Session): Promise<{
  ok: true;
  accessToken: string;
  expiresIn: number;
} | { ok: false; message: string }> {
  const admin = getSupabaseAdminClient();
  const publicClient = getSupabasePublicClient();

  if (!publicClient) {
    return { ok: false, message: "Supabase auth is not configured" };
  }
  if (!admin) {
    return {
      ok: false,
      message: "SUPABASE_SERVICE_ROLE_KEY is required to attach tenant context on login"
    };
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(session.user.id, {
    app_metadata: { tenant_id: DEV_SEED_TENANT_ID, role: DEV_SEED_ROLE }
  });
  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  const { data: refreshData, error: refreshError } = await publicClient.auth.refreshSession({
    refresh_token: session.refresh_token
  });
  if (refreshError || !refreshData.session) {
    return { ok: false, message: refreshError?.message || "Failed to refresh session after metadata sync" };
  }

  return {
    ok: true,
    accessToken: refreshData.session.access_token,
    expiresIn: refreshData.session.expires_in
  };
}
