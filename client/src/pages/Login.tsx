import { useState } from "react";
import { Redirect, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const { user, signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Redirect to="/" />;
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signInWithEmail(email);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4">
      <img src="/generated-icon.png" alt="Logo" className="h-16 w-16" />
      <form onSubmit={handleEmail} className="w-full max-w-sm space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Sign in with Email"}
        </Button>
      </form>
      <Button variant="outline" className="w-full max-w-sm" onClick={signInWithGoogle}>
        Continue with Google
      </Button>
      <p className="text-sm text-muted-foreground">
        Don't have an account? <Link href="/register" className="underline">Register</Link>
      </p>
    </div>
  );
}
