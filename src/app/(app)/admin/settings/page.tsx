
'use client';

import * as React from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/rich-text-editor';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { smtpSettingsSchema, type SmtpSettingsFormData, emailTemplateSchema, type EmailTemplateFormData } from '@/lib/schemas';
import { Mail, Save, Settings, Send } from 'lucide-react';

const SMTP_SETTINGS_KEY = 'admin_smtp_settings';
const EMAIL_TEMPLATE_KEY = 'admin_email_template';

export default function AdminSettingsPage() {
  const { toast } = useToast();

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
  }, [smtpForm, emailTemplateForm]);

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

  return (
    <>
      <AppHeader title="Admin Email Settings" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
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
      </main>
    </>
  );
}

AdminSettingsPage.displayName = "AdminSettingsPage";
