import { createClient, type Session } from "@supabase/supabase-js";
import { DEV_SEED_TENANT_ID, type UserRole } from "@jewellery-erp/shared";

const DEV_SEED_ROLE: UserRole = "OWNER";

export async function syncDevTenantAndRefreshSession(session: Session): Promise<{
  ok: true;
  accessToken: string;
  expiresIn: number;
} | { ok: false; message: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    return { ok: false, message: "Supabase is not configured" };
  }
  if (!serviceRoleKey) {
    return {
      ok: false,
      message: "SUPABASE_SERVICE_ROLE_KEY is required to attach tenant context on login"
    };
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { error: updateError } = await admin.auth.admin.updateUserById(session.user.id, {
    app_metadata: { tenant_id: DEV_SEED_TENANT_ID, role: DEV_SEED_ROLE }
  });
  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  const publicClient = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

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
