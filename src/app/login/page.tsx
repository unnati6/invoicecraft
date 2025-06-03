// src/app/login/page.tsx

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { securedApiCall } from '@/lib/api';
import { AuthResponse } from '@/lib/types'; // <--- Import the new type here

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = { email, password };
      console.log("Frontend: Sending login request to backend...");

      // Specify the expected return type for securedApiCall
      const response = await securedApiCall<AuthResponse>('/api/authentication/login', { // <--- Here's the change
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
if (response === null) { // <--- Added this check
          throw new Error("Login failed: Unexpected empty response from server.");
      }

      if (response.accessToken) { // Now 'response' is narrowed to AuthResponse
        localStorage.setItem("supabaseAccessToken", response.accessToken);
        if (response.refreshToken) {
            localStorage.setItem("supabaseRefreshToken", response.refreshToken);
        }
        toast({ title: "Success", description: "Login successful!"});
        router.push('/dashboard');
      } else {
        throw new Error(response.error || "Login failed due to unexpected response.");
      }
    } catch (err: any) {
      console.error("Login error from backend call:", err);
      const errorMessage = err.message || "An unexpected error occurred during login.";
      setError(errorMessage);
      
      toast({ title: "Error", description:errorMessage, variant: "destructive" });
    
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center animated-gradient-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex w-full justify-center">
          <Image
            src="/images/revynox_logo_black.png"
            alt="Revynox Logo"
            width={200}
            height={50}
            className="dark:invert"
          />
        </div>
        <Card className="w-full shadow-xl bg-card/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl text-card-foreground">Welcome Back!</CardTitle>
            <CardDescription className="text-card-foreground/80">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground/90">Email</Label>
                <div className="relative" suppressHydrationWarning={true}>
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="name@example.com" required className="pl-10 bg-background/80 text-foreground placeholder:text-muted-foreground/70"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-card-foreground/90">Password</Label>
                <div className="relative" suppressHydrationWarning={true}>
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" required className="pl-10 placeholder:text-muted-foreground/70 bg-background/80 text-foreground" placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
             {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex items-center justify-end">
                <Link href="/forget-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging In...' : 'Login'}
              </Button>
              <p className="text-center text-sm text-card-foreground/80">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                  Sign Up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}