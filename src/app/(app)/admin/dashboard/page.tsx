
'use client';

import * as React from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllUsers, toggleUserActiveStatus } from '@/lib/actions';
import type { User, PlanType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, isAfter } from 'date-fns';
import { Users, UserCheck, UserX } from 'lucide-react';

interface SignupStat {
  period: string;
  count: number;
}

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [signupStats, setSignupStats] = React.useState<SignupStat[]>([]);
  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const userData = await getAllUsers();
        setUsers(userData);
        calculateSignupStats(userData);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch user data.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const calculateSignupStats = (allUsers: User[]) => {
    const now = new Date();
    const periods = [
      { label: 'Last 7 Days', days: 7 },
      { label: 'Last 30 Days', days: 30 },
      { label: 'Last 90 Days', days: 90 },
      { label: 'Last 365 Days', days: 365 },
    ];

    const stats = periods.map(period => {
      const cutoffDate = subDays(now, period.days);
      const count = allUsers.filter(user => isAfter(new Date(user.signupDate), cutoffDate)).length;
      return { period: period.label, count };
    });
    setSignupStats(stats);
  };

  const handleToggleActive = async (userId: string, currentIsActive: boolean) => {
    setUpdatingUserId(userId);
    try {
      const updatedUser = await toggleUserActiveStatus(userId, !currentIsActive);
      if (updatedUser) {
        setUsers(prevUsers => prevUsers.map(u => u.id === userId ? updatedUser : u));
        toast({ title: 'Success', description: `User ${updatedUser.name} has been ${updatedUser.isActive ? 'activated' : 'deactivated'}.` });
      } else {
        toast({ title: 'Error', description: 'Failed to update user status.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setUpdatingUserId(null);
    }
  };
  
  const getPlanTypeVariant = (planType: PlanType): "default" | "secondary" | "outline" | "destructive" => {
    switch (planType) {
      case 'Enterprise':
      case 'Pro':
        return 'default'; 
      case 'Basic':
        return 'secondary';
      case 'Free':
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Admin Dashboard" />
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-full mt-1" /></CardContent></Card>
            ))}
          </div>
          <Card><CardHeader><CardTitle><Skeleton className="h-6 w-1/3" /></CardTitle></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Admin Dashboard" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Signup Statistics</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {signupStats.map(stat => (
              <Card key={stat.period}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.period}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.count}</div>
                  <p className="text-xs text-muted-foreground">new users</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>User List</CardTitle>
              <CardDescription>{"Overview of all registered users."}</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Signup Date</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Reminder</TableHead> 
                      <TableHead>Reminder Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{format(new Date(user.signupDate), 'PP')}</TableCell>
                        <TableCell>
                          <Badge variant={getPlanTypeVariant(user.planType)}>{user.planType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'default' : 'destructive'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">N/A</TableCell>
                        <TableCell className="text-xs text-muted-foreground">N/A</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(user.id, user.isActive)}
                            disabled={updatingUserId === user.id}
                          >
                            {user.isActive ? 
                              <><UserX className="mr-2 h-3.5 w-3.5" /> Deactivate</> : 
                              <><UserCheck className="mr-2 h-3.5 w-3.5" /> Activate</>
                            }
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                 <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">No users found in the mock data.</p>
                 </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
