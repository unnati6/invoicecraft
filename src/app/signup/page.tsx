
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User } from 'lucide-react';
import Image from 'next/image';

export default function SignUpPage() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // For a real app, you would handle user registration here
    console.log('Sign up submitted');
    // On successful sign up, redirect to login or app's main page
    router.push('/login');
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
        <Card className="w-full shadow-xl bg-card/90 backdrop-blur-sm"> {/* Added some transparency to card */}
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl text-card-foreground">Create an Account</CardTitle>
            <CardDescription className="text-card-foreground/80">Enter your details to get started</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-card-foreground/90">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="fullName" type="text" placeholder="John Doe" required className="pl-10 bg-background/80 text-foreground placeholder:text-muted-foreground/70" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground/90">Email</Label>
                <div className="relative" suppressHydrationWarning={true}>
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="name@example.com" required className="pl-10 bg-background/80 text-foreground placeholder:text-muted-foreground/70" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-card-foreground/90">Password</Label>
                <div className="relative" suppressHydrationWarning={true}>
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" required className="pl-10 placeholder:text-muted-foreground/70 bg-background/80 text-foreground" placeholder="••••••••" />
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-card-foreground/90">Confirm Password</Label>
                <div className="relative" suppressHydrationWarning={true}>
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="confirmPassword" type="password" required className="pl-10 placeholder:text-muted-foreground/70 bg-background/80 text-foreground" placeholder="••••••••" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full">
                Create Account
              </Button>
              <p className="text-center text-sm text-card-foreground/80">
                Already have an account?{' '}
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
