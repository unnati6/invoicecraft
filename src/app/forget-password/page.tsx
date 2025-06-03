
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, KeyRound } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("If an account exists for this email, a password reset link has been sent. Please check your inbox (and spam folder).");
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email to reset your password.",
      });
      // Optionally redirect after a delay or keep them on the page
      // setTimeout(() => router.push('/login'), 5000); 
    } catch (err: any) {
      console.error("Forgot password error:", err.message);
      let friendlyMessage = "An unexpected error occurred. Please try again.";
      if (err.code === "auth/invalid-email") {
        friendlyMessage = "The email address is not valid.";
      } else if (err.code === "auth/user-not-found") {
        // For security reasons, Firebase doesn't explicitly say user not found here.
        // So we give a generic message, similar to what sendPasswordResetEmail does.
        setMessage("If an account exists for this email, a password reset link has been sent.");
         toast({
            title: "Password Reset Email Sent",
            description: "Please check your email to reset your password (if your account exists).",
        });
        setLoading(false);
        return; // Don't show a specific error for user not found
      }
      setError(friendlyMessage);
      toast({
        title: "Error Sending Reset Email",
        description: friendlyMessage,
        variant: "destructive",
      });
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
            <KeyRound className="mx-auto h-8 w-8 text-primary" />
            <CardTitle className="text-2xl text-card-foreground">Forgot Your Password?</CardTitle>
            <CardDescription className="text-card-foreground/80">
              No problem! Enter your email address and we&apos;ll send you a link to reset it.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground/90">Email Address</Label>
                <div className="relative" suppressHydrationWarning={true}>
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    className="pl-10 bg-background/80 text-foreground placeholder:text-muted-foreground/70" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Password Reset Email'}
              </Button>
              <p className="text-center text-sm text-card-foreground/80">
                Remember your password?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Login
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
