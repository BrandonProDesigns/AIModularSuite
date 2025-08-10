// Simple Supabase client wrapper. In a real application this would
// initialize the Supabase client using environment variables.
// Here we assume a global `supabase` instance is available at runtime.
// This keeps TypeScript satisfied without introducing a new dependency.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = (globalThis as any).supabase;
