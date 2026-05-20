export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  return base.replace(/\/$/, "");
}

export async function readApiJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text.slice(0, 200) };
  }
}
