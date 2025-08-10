export interface Member {
  id: number;
  name: string;
  avatar_url: string | null;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

async function request<T>(
  method: string,
  path: string,
  body?: Record<string, any>
): Promise<T> {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`Supabase request failed: ${res.status}`);
  }
  return res.json();
}

export function getMembers() {
  return request<Member[]>("GET", "members?select=*");
}

export function addMember(name: string, avatar_url?: string) {
  return request<Member>("POST", "members", { name, avatar_url });
}
