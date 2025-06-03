
'use client';

import * as React from 'react';
import Image from 'next/image';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Save, Trash2, Edit3, Image as ImageIconLucide, Building, Settings, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignaturePad } from '@/components/signature-pad';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { brandingSettingsSchema, type BrandingSettingsFormData } from '@/lib/schemas';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { getBrandingSettings, saveBrandingSettings } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function BrandingPage() {
  const { toast } = useToast();
  const [activeSignatureTab, setActiveSignatureTab] = React.useState<'upload' | 'draw'>('upload');
  const [isLoading, setIsLoading] = React.useState(true);

  const form = useForm<BrandingSettingsFormData>({
    resolver: zodResolver(brandingSettingsSchema),
    defaultValues: {
      invoicePrefix: "INV-",
      orderFormPrefix: "OF-",
      name: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      phone: "",
      email: "",
      logoUrl: null,
      signatureUrl: null,
    },
  });

  React.useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const settings = await getBrandingSettings();
        if (settings) {
          form.reset({
            ...settings,
            logoUrl: settings.logoUrl || null, // Ensure null if empty string from data
            signatureUrl: settings.signatureUrl || null, // Ensure null if empty string from data
          });
        }
      } catch (error) {
        console.error("Failed to load branding settings:", error);
        toast({ title: "Error", description: "Could not load branding settings. Using defaults.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [form, toast]);

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Logo image must be smaller than 1MB.', variant: 'destructive' });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
        toast({ title: 'Invalid file type', description: 'Logo must be JPG, PNG, or SVG.', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('logoUrl', reader.result as string, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue('logoUrl', null, { shouldDirty: true });
    }
  };

  const handleSignatureFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Signature image must be smaller than 1MB.', variant: 'destructive' });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
        toast({ title: 'Invalid file type', description: 'Signature must be JPG, PNG, or SVG.', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('signatureUrl', reader.result as string, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    } else {
       form.setValue('signatureUrl', null, { shouldDirty: true });
    }
  };

  const handleDrawnSignatureConfirm = (dataUrl: string) => {
    form.setValue('signatureUrl', dataUrl, { shouldDirty: true });
    toast({ title: 'Signature Drawn', description: 'Click "Save All Branding Settings" to apply.' });
  };

  const handleRemoveAsset = (type: 'logoUrl' | 'signatureUrl') => {
    form.setValue(type, null, { shouldDirty: true });
    const fileInputId = type === 'logoUrl' ? 'logo-upload' : 'signature-upload';
    const fileInput = document.getElementById(fileInputId) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    toast({ title: 'Success', description: `${type === 'logoUrl' ? 'Logo' : 'Signature'} will be removed upon saving.` });
  };

  const handleFormSubmit = async (data: BrandingSettingsFormData) => {
    try {
      await saveBrandingSettings({
        ...data,
        logoUrl: data.logoUrl || null, // Ensure empty strings become null
        signatureUrl: data.signatureUrl || null,
      });
      toast({ title: 'Success', description: 'Branding settings saved.' });
      form.reset(data); // Mark form as not dirty
    } catch (error) {
      console.error("Failed to save branding settings:", error);
      toast({ title: 'Error', description: 'Could not save branding settings.', variant: 'destructive' });
    }
  };

  const watchLogoUrl = form.watch('logoUrl');
  const watchSignatureUrl = form.watch('signatureUrl');

  if (isLoading) {
    return (
      <>
        <AppHeader title="Branding & Numbering Settings" />
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <Skeleton className="h-[300px] w-full max-w-3xl mx-auto" />
          <Skeleton className="h-[200px] w-full max-w-3xl mx-auto" />
          <Skeleton className="h-[350px] w-full max-w-3xl mx-auto" />
          <Skeleton className="h-[400px] w-full max-w-3xl mx-auto" />
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Branding & Numbering Settings" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center"><Building className="mr-2 h-5 w-5" /> Company Information</CardTitle>
                <CardDescription>This information will appear on your documents.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Company Name *</FormLabel><FormControl><Input placeholder="Your Company LLC" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="contact@yourcompany.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </div>
                <FormField control={form.control} name="street" render={({ field }) => (
                  <FormItem><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Anytown" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="state" render={({ field }) => (
                    <FormItem><FormLabel>State / Province</FormLabel><FormControl><Input placeholder="CA" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="zip" render={({ field }) => (
                    <FormItem><FormLabel>ZIP / Postal Code</FormLabel><FormControl><Input placeholder="90210" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="country" render={({ field }) => (
                    <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="USA" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="(555) 123-4567" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </div>
              </CardContent>
            </Card>

            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5" /> Document Numbering</CardTitle>
                <CardDescription>Set prefixes for your Invoices and Order Forms.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="invoicePrefix" render={({ field }) => (
                  <FormItem><FormLabel>Invoice Prefix</FormLabel><FormControl><Input placeholder="INV-" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="orderFormPrefix" render={({ field }) => (
                  <FormItem><FormLabel>Order Form Prefix</FormLabel><FormControl><Input placeholder="OF-" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </CardContent>
            </Card>

            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center"><ImageIconLucide className="mr-2 h-5 w-5" /> Company Logo</CardTitle>
                <CardDescription>Upload your company logo (max 1MB). This will be stored as a Data URL.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField control={form.control} name="logoUrl" render={({ field }) => ( // field is not directly used for input, but needed for form state
                  <FormItem>
                    <FormLabel htmlFor="logo-upload">Upload Logo File</FormLabel>
                    <div className="flex items-center gap-4">
                      <Input id="logo-upload" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoFileChange} className="flex-1"/>
                      <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('logo-upload')?.click()}><UploadCloud className="h-5 w-5" /><span className="sr-only">Upload Logo</span></Button>
                    </div>
                    <FormDescription>Enter a URL or upload a file. Uploaded files are converted to Data URLs.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}/>
                {watchLogoUrl && (<div className="space-y-2"><Label>Logo Preview</Label><div className="border rounded-md p-4 flex justify-center items-center bg-muted/30 min-h-[150px]"><Image src={watchLogoUrl} alt="Logo Preview" width={200} height={80} style={{ objectFit: 'contain', maxHeight: '80px' }} data-ai-hint="company logo"/></div></div>)}
              </CardContent>
              <CardFooter>
                {watchLogoUrl && (<Button type="button" variant="outline" onClick={() => handleRemoveAsset('logoUrl')} className="mr-auto"><Trash2 className="mr-2 h-4 w-4" /> Clear Logo</Button>)}
              </CardFooter>
            </Card>

            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center"><Edit3 className="mr-2 h-5 w-5" /> Company Signature</CardTitle>
                <CardDescription>Upload or draw your company signature (max 1MB for upload). Stored as Data URL.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={activeSignatureTab} onValueChange={(value) => setActiveSignatureTab(value as 'upload' | 'draw')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload"><ImageIconLucide className="mr-2 h-4 w-4" /> Upload Image</TabsTrigger>
                    <TabsTrigger value="draw"><Edit3 className="mr-2 h-4 w-4" /> Draw Signature</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="pt-4">
                     <FormField control={form.control} name="signatureUrl" render={({ field }) => ( // field not directly used for input
                      <FormItem>
                        <FormLabel htmlFor="signature-upload">Upload Signature File</FormLabel>
                        <div className="flex items-center gap-4">
                          <Input id="signature-upload" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleSignatureFileChange} className="flex-1"/>
                          <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('signature-upload')?.click()}><UploadCloud className="h-5 w-5" /><span className="sr-only">Upload Signature</span></Button>
                        </div>
                        <FormDescription>Enter a URL or upload a file. Uploaded files are converted to Data URLs.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </TabsContent>
                  <TabsContent value="draw" className="pt-4 flex flex-col items-center">
                    <SignaturePad onConfirm={handleDrawnSignatureConfirm} />
                  </TabsContent>
                </Tabs>
                {watchSignatureUrl && (<div className="space-y-2 pt-4"><Label>Signature Preview</Label><div className="border rounded-md p-4 flex justify-center items-center bg-muted/30 min-h-[100px]"><Image src={watchSignatureUrl} alt="Signature Preview" width={250} height={100} style={{ objectFit: 'contain', maxHeight: '100px' }}/></div></div>)}
              </CardContent>
               <CardFooter>
                {watchSignatureUrl && (<Button type="button" variant="outline" onClick={() => handleRemoveAsset('signatureUrl')} className="mr-auto"><Trash2 className="mr-2 h-4 w-4" /> Clear Signature</Button>)}
              </CardFooter>
            </Card>

            <div className="max-w-3xl mx-auto flex justify-end pt-4">
              <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty} size="lg">
                <Save className="mr-2 h-5 w-5" /> 
                {form.formState.isSubmitting ? 'Saving Settings...' : 'Save All Branding Settings'}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </>
  );
}
