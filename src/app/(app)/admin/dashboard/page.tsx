
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
import { Users, UserCheck, UserX, Mail, Save, Settings, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/rich-text-editor';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { smtpSettingsSchema, type SmtpSettingsFormData, emailTemplateSchema, type EmailTemplateFormData } from '@/lib/schemas';

interface SignupStat {
  period: string;
  count: number;
}

const SMTP_SETTINGS_KEY = 'admin_smtp_settings';
const EMAIL_TEMPLATE_KEY = 'admin_email_template';

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [signupStats, setSignupStats] = React.useState<SignupStat[]>([]);
  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(null);

  const smtpForm = useForm<SmtpSettingsFormData>({
    resolver: zodResolver(smtpSettingsSchema),
    defaultValues: {
      host: '',
      port: 587,
      username: '',
      password: '',
      encryption: 'TLS',
    },
  });

  const emailTemplateForm = useForm<EmailTemplateFormData>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      subject: 'Payment Reminder for Invoice {{invoiceNumber}}',
      body: '<p>Dear {{userName}},</p><p>This is a friendly reminder that your payment for invoice #{{invoiceNumber}} amounting to {{currencySymbol}}{{pendingAmount}} is due on {{dueDate}}.</p><p>Thank you,<br/>Your Company</p>',
    },
  });

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const userData = await getAllUsers();
        setUsers(userData);
        calculateSignupStats(userData);

        // Load saved SMTP settings from localStorage
        const savedSmtpSettings = localStorage.getItem(SMTP_SETTINGS_KEY);
        if (savedSmtpSettings) {
          smtpForm.reset(JSON.parse(savedSmtpSettings));
        }

        // Load saved Email template from localStorage
        const savedEmailTemplate = localStorage.getItem(EMAIL_TEMPLATE_KEY);
        if (savedEmailTemplate) {
          emailTemplateForm.reset(JSON.parse(savedEmailTemplate));
        }

      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch user data.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast, smtpForm, emailTemplateForm]);

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

  const handleSaveSmtpSettings = (data: SmtpSettingsFormData) => {
    localStorage.setItem(SMTP_SETTINGS_KEY, JSON.stringify(data));
    toast({ title: 'SMTP Settings Saved', description: 'Your SMTP configuration has been saved to localStorage.' });
    smtpForm.reset(data); // Mark form as not dirty
  };

  const handleSaveEmailTemplate = (data: EmailTemplateFormData) => {
    localStorage.setItem(EMAIL_TEMPLATE_KEY, JSON.stringify(data));
    toast({ title: 'Email Template Saved', description: 'Your email reminder template has been saved to localStorage.' });
    emailTemplateForm.reset(data); // Mark form as not dirty
  };
  
  const handleSendReminders = () => {
      toast({
        title: 'Simulating Reminders',
        description: 'In a real app, this would trigger sending emails to users with pending payments.',
        variant: 'warning'
      });
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
          {/* Skeletons for stats, email config, user list */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-full mt-1" /></CardContent></Card>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card><CardHeader><CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-28" /></CardFooter></Card>
            <Card><CardHeader><CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-28" /></CardFooter></Card>
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

        <div className="grid gap-6 md:grid-cols-2">
           <Card>
            <Form {...smtpForm}>
              <form onSubmit={smtpForm.handleSubmit(handleSaveSmtpSettings)}>
                <CardHeader>
                  <CardTitle className="flex items-center"><Settings className="mr-2 h-5 w-5" /> SMTP Configuration</CardTitle>
                  <CardDescription>{"Configure your email server settings for sending reminders. Settings saved to browser storage."}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={smtpForm.control} name="host" render={({ field }) => (
                    <FormItem><FormLabel>SMTP Host</FormLabel><FormControl><Input placeholder="smtp.example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={smtpForm.control} name="port" render={({ field }) => (
                        <FormItem><FormLabel>Port</FormLabel><FormControl><Input type="number" placeholder="587" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={smtpForm.control} name="encryption" render={({ field }) => (
                        <FormItem><FormLabel>Encryption</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select encryption" /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="None">None</SelectItem><SelectItem value="SSL">SSL</SelectItem><SelectItem value="TLS">TLS</SelectItem></SelectContent>
                        </Select><FormMessage /></FormItem>
                    )}/>
                  </div>
                  <FormField control={smtpForm.control} name="username" render={({ field }) => (
                    <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="your-email@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={smtpForm.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={!smtpForm.formState.isDirty && smtpForm.formState.isSubmitSuccessful}><Save className="mr-2 h-4 w-4"/> Save SMTP Settings</Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
          
          <Card>
            <Form {...emailTemplateForm}>
              <form onSubmit={emailTemplateForm.handleSubmit(handleSaveEmailTemplate)}>
                <CardHeader>
                  <CardTitle className="flex items-center"><Mail className="mr-2 h-5 w-5"/> Configure Reminder Email</CardTitle>
                  <CardDescription>{"Set the subject and body for payment reminder emails. Template saved to browser storage. Use placeholders like '{{userName}}', '{{invoiceNumber}}', '{{pendingAmount}}', '{{dueDate}}', '{{currencySymbol}}'."}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={emailTemplateForm.control} name="subject" render={({ field }) => (
                    <FormItem><FormLabel>Email Subject</FormLabel><FormControl><Input placeholder="Payment Reminder for Invoice {{invoiceNumber}}" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={emailTemplateForm.control} name="body" render={({ field }) => (
                    <FormItem><FormLabel>Email Body</FormLabel><FormControl><RichTextEditor value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button type="submit" disabled={!emailTemplateForm.formState.isDirty && emailTemplateForm.formState.isSubmitSuccessful}><Save className="mr-2 h-4 w-4"/> Save Template</Button>
                  <Button type="button" variant="outline" onClick={handleSendReminders}><Send className="mr-2 h-4 w-4"/> Send Test/Simulate Reminders</Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>User List</CardTitle>
              <CardDescription>{"Overview of all registered users. Reminder status is a placeholder."}</CardDescription>
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
                      <TableHead>Last Reminder</TableHead> {/* Placeholder */}
                      <TableHead>Reminder Status</TableHead> {/* Placeholder */}
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
                        <TableCell className="text-xs text-muted-foreground">N/A</TableCell> {/* Placeholder */}
                        <TableCell className="text-xs text-muted-foreground">N/A</TableCell> {/* Placeholder */}
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
