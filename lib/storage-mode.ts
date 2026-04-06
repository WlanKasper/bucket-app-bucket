const PLACEHOLDER_SUPABASE_URL = "https://your-project.supabase.co";
const PLACEHOLDER_SUPABASE_KEY = "your-supabase-service-role-key";

export function getStorageDriver(): "file" | "supabase" {
  const configuredDriver = process.env.STORAGE_DRIVER?.trim().toLowerCase();

  if (configuredDriver === "file" || configuredDriver === "supabase") {
    return configuredDriver;
  }

  if (process.env.NODE_ENV !== "production") {
    const url = process.env.SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (
      !url ||
      !key ||
      url === PLACEHOLDER_SUPABASE_URL ||
      key === PLACEHOLDER_SUPABASE_KEY
    ) {
      return "file";
    }
  }

  return "supabase";
}
