
'use client';

import * as React from 'react';
import Image from 'next/image';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Save, Trash2, Edit3, Image as ImageIconLucide, Building, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignaturePad } from '@/components/signature-pad';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { brandingSettingsSchema, type BrandingSettingsFormData } from '@/lib/schemas';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';


const LOGO_STORAGE_KEY = 'branding_company_logo_data_url';
const SIGNATURE_STORAGE_KEY = 'branding_company_signature_data_url';

const COMPANY_INFO_KEYS = {
  NAME: 'branding_company_name',
  ADDRESS_STREET: 'branding_company_address_street',
  ADDRESS_CITY: 'branding_company_address_city',
  ADDRESS_STATE: 'branding_company_address_state',
  ADDRESS_ZIP: 'branding_company_address_zip',
  ADDRESS_COUNTRY: 'branding_company_address_country',
  PHONE: 'branding_company_phone',
  EMAIL: 'branding_company_email',
};

const PREFIX_STORAGE_KEYS = {
  INVOICE: 'branding_invoice_prefix',
  ORDER_FORM: 'branding_orderform_prefix',
};

interface CompanyInfoState {
  name: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  addressCountry: string;
  phone: string;
  email: string;
}

export default function BrandingPage() {
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [selectedLogoFile, setSelectedLogoFile] = React.useState<File | null>(null);
  
  const [signaturePreview, setSignaturePreview] = React.useState<string | null>(null);
  const [selectedSignatureFile, setSelectedSignatureFile] = React.useState<File | null>(null);
  const [drawnSignatureDataUrl, setDrawnSignatureDataUrl] = React.useState<string | null>(null);
  const [activeSignatureTab, setActiveSignatureTab] = React.useState<'upload' | 'draw'>('upload');

  const [companyInfo, setCompanyInfo] = React.useState<CompanyInfoState>({
    name: '', addressStreet: '', addressCity: '', addressState: '',
    addressZip: '', addressCountry: '', phone: '', email: '',
  });
  const [initialCompanyInfoLoaded, setInitialCompanyInfoLoaded] = React.useState(false);
  const [hasStoredCompanyInfo, setHasStoredCompanyInfo] = React.useState(false);
  const [initialLogoFromStorage, setInitialLogoFromStorage] = React.useState<string | null>(null);
  const [initialSignatureFromStorage, setInitialSignatureFromStorage] = React.useState<string | null>(null);
  
  const prefixForm = useForm<BrandingSettingsFormData>({
    resolver: zodResolver(brandingSettingsSchema),
    defaultValues: {
      invoicePrefix: "INV-",
      orderFormPrefix: "OF-",
    },
  });
  const [initialPrefixesLoaded, setInitialPrefixesLoaded] = React.useState(false);


  React.useEffect(() => {
    const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
    if (storedLogo) { setLogoPreview(storedLogo); setInitialLogoFromStorage(storedLogo); }
    const storedSignature = localStorage.getItem(SIGNATURE_STORAGE_KEY);
    if (storedSignature) { setSignaturePreview(storedSignature); setInitialSignatureFromStorage(storedSignature); }

    const loadedCompanyInfo: Partial<CompanyInfoState> = {};
    let anyCompanyInfoFound = false;
    Object.entries(COMPANY_INFO_KEYS).forEach(([key, storageKey]) => {
      const item = localStorage.getItem(storageKey);
      if (item) {
        (loadedCompanyInfo as any)[key.toLowerCase().replace(/_([a-z])/g, g => g[1].toUpperCase())] = item;
        anyCompanyInfoFound = true;
      }
    });
    setCompanyInfo(prev => ({...prev, ...loadedCompanyInfo}));
    setHasStoredCompanyInfo(anyCompanyInfoFound);
    setInitialCompanyInfoLoaded(true);

    const storedInvoicePrefix = localStorage.getItem(PREFIX_STORAGE_KEYS.INVOICE);
    const storedOrderFormPrefix = localStorage.getItem(PREFIX_STORAGE_KEYS.ORDER_FORM);
    if (storedInvoicePrefix) prefixForm.setValue('invoicePrefix', storedInvoicePrefix);
    if (storedOrderFormPrefix) prefixForm.setValue('orderFormPrefix', storedOrderFormPrefix);
    setInitialPrefixesLoaded(true);

  }, [prefixForm]);

  const handleCompanyInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCompanyInfo = () => {
    Object.entries(companyInfo).forEach(([key, value]) => {
        const storageKey = COMPANY_INFO_KEYS[key.replace(/([A-Z])/g, '_$1').toUpperCase() as keyof typeof COMPANY_INFO_KEYS];
        if (storageKey) localStorage.setItem(storageKey, value);
    });
    const anyInfoStillStored = Object.values(COMPANY_INFO_KEYS).some(key => !!localStorage.getItem(key));
    setHasStoredCompanyInfo(anyInfoStillStored);
    toast({ title: 'Success', description: 'Company information saved.' });
  };

  const handleRemoveCompanyInfo = () => {
    Object.values(COMPANY_INFO_KEYS).forEach(storageKey => localStorage.removeItem(storageKey));
    setCompanyInfo({ name: '', addressStreet: '', addressCity: '', addressState: '', addressZip: '', addressCountry: '', phone: '', email: '' });
    setHasStoredCompanyInfo(false);
    toast({ title: 'Success', description: 'Company information removed.' });
  };

  const handlePrefixSubmit = (data: BrandingSettingsFormData) => {
    localStorage.setItem(PREFIX_STORAGE_KEYS.INVOICE, data.invoicePrefix || "INV-");
    localStorage.setItem(PREFIX_STORAGE_KEYS.ORDER_FORM, data.orderFormPrefix || "OF-");
    toast({ title: 'Success', description: 'Numbering prefixes saved.' });
    prefixForm.reset(data); // To mark form as not dirty
  };


  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { 
        toast({ title: 'File too large', description: `Please select an image smaller than 1MB.`, variant: 'destructive' });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
        toast({ title: 'Invalid file type', description: `Please select a JPG, PNG, or SVG image.`, variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => { setSelectedLogoFile(file); setLogoPreview(reader.result as string); };
      reader.readAsDataURL(file);
    } else { setSelectedLogoFile(null); setLogoPreview(initialLogoFromStorage); }
  };
  
  const handleSignatureFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast({ title: 'File too large', description: `Signature image must be smaller than 1MB.`, variant: 'destructive'});
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
        toast({ title: 'Invalid file type', description: `Signature must be JPG, PNG, or SVG.`, variant: 'destructive'});
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => { setSelectedSignatureFile(file); setDrawnSignatureDataUrl(null); setSignaturePreview(reader.result as string); };
      reader.readAsDataURL(file);
    } else { setSelectedSignatureFile(null); if (!drawnSignatureDataUrl) setSignaturePreview(initialSignatureFromStorage); }
  };
  
  const handleDrawnSignatureConfirm = (dataUrl: string) => {
    setDrawnSignatureDataUrl(dataUrl); setSelectedSignatureFile(null); setSignaturePreview(dataUrl);
    toast({ title: 'Signature Drawn', description: 'Click "Save Signature" to apply.' });
  };

  const handleSaveAsset = (type: 'logo' | 'signature') => {
    if (type === 'logo') {
      if (logoPreview && (selectedLogoFile || logoPreview !== initialLogoFromStorage)) {
        localStorage.setItem(LOGO_STORAGE_KEY, logoPreview); setInitialLogoFromStorage(logoPreview);
        toast({ title: 'Success', description: 'Logo saved.' }); setSelectedLogoFile(null);
      } else if (!logoPreview) toast({ title: 'No logo', description: 'Please select a logo.', variant: 'destructive'});
      else toast({ title: 'No changes', description: 'No new logo selected.' });
    } else { 
      if (signaturePreview && (selectedSignatureFile || drawnSignatureDataUrl || signaturePreview !== initialSignatureFromStorage)) {
        localStorage.setItem(SIGNATURE_STORAGE_KEY, signaturePreview); setInitialSignatureFromStorage(signaturePreview);
        toast({ title: 'Success', description: 'Signature saved.' }); setSelectedSignatureFile(null); setDrawnSignatureDataUrl(null); 
      } else if (!signaturePreview) toast({ title: 'No signature', description: 'Please provide a signature.', variant: 'destructive'});
      else toast({ title: 'No changes', description: 'No new signature provided.' });
    }
  };

  const handleRemoveAsset = (type: 'logo' | 'signature') => {
    if (type === 'logo') {
      localStorage.removeItem(LOGO_STORAGE_KEY); setLogoPreview(null); setInitialLogoFromStorage(null); setSelectedLogoFile(null);
      const fileInput = document.getElementById('logo-upload') as HTMLInputElement; if (fileInput) fileInput.value = '';
      toast({ title: 'Success', description: 'Logo removed.' });
    } else { 
      localStorage.removeItem(SIGNATURE_STORAGE_KEY); setSignaturePreview(null); setInitialSignatureFromStorage(null); setSelectedSignatureFile(null); setDrawnSignatureDataUrl(null);
      const fileInput = document.getElementById('signature-upload') as HTMLInputElement; if (fileInput) fileInput.value = '';
      toast({ title: 'Success', description: 'Signature removed.' });
    }
  };
  
  const isLogoSaveButtonDisabled = React.useMemo(() => {
    if (!initialCompanyInfoLoaded) return true;
    if (selectedLogoFile) return false;
    if (!logoPreview) return true;
    return logoPreview === initialLogoFromStorage;
  }, [selectedLogoFile, logoPreview, initialLogoFromStorage, initialCompanyInfoLoaded]);

  const isSignatureSaveButtonDisabled = React.useMemo(() => {
    if (!initialCompanyInfoLoaded) return true;
    if (activeSignatureTab === 'upload') {
      if (selectedSignatureFile) return false;
      if (!signaturePreview) return true;
      return signaturePreview === initialSignatureFromStorage;
    }
    if (activeSignatureTab === 'draw') {
      if (drawnSignatureDataUrl && drawnSignatureDataUrl !== signaturePreview) return false;
      if(drawnSignatureDataUrl && signaturePreview === drawnSignatureDataUrl) return false;
      if (!signaturePreview && !drawnSignatureDataUrl) return true;
      return !drawnSignatureDataUrl && signaturePreview === initialSignatureFromStorage;
    }
    return true;
  }, [activeSignatureTab, selectedSignatureFile, drawnSignatureDataUrl, signaturePreview, initialSignatureFromStorage, initialCompanyInfoLoaded]);

  const companyInfoChanged = React.useCallback(() => {
    if (!initialCompanyInfoLoaded) return false;
    let changed = false;
    Object.entries(COMPANY_INFO_KEYS).forEach(([key, storageKey]) => {
        const currentVal = companyInfo[key.toLowerCase().replace(/_([a-z])/g, g => g[1].toUpperCase()) as keyof CompanyInfoState];
        const storedVal = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
        if (currentVal !== (storedVal || '')) changed = true;
    });
    return changed;
  }, [companyInfo, initialCompanyInfoLoaded]);

  return (
    <>
      <AppHeader title="Branding & Numbering Settings" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center"><Building className="mr-2 h-5 w-5" /> Company Information</CardTitle>
                <CardDescription>This information will appear on your documents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1"><Label htmlFor="name">Company Name</Label><Input id="name" name="name" value={companyInfo.name} onChange={handleCompanyInfoChange} placeholder="Your Company LLC" /></div>
                    <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={companyInfo.email} onChange={handleCompanyInfoChange} placeholder="contact@yourcompany.com" /></div>
                </div>
                <div className="space-y-1"><Label htmlFor="addressStreet">Street Address</Label><Input id="addressStreet" name="addressStreet" value={companyInfo.addressStreet} onChange={handleCompanyInfoChange} placeholder="123 Main St" /></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1"><Label htmlFor="addressCity">City</Label><Input id="addressCity" name="addressCity" value={companyInfo.addressCity} onChange={handleCompanyInfoChange} placeholder="Anytown" /></div>
                    <div className="space-y-1"><Label htmlFor="addressState">State / Province</Label><Input id="addressState" name="addressState" value={companyInfo.addressState} onChange={handleCompanyInfoChange} placeholder="CA" /></div>
                    <div className="space-y-1"><Label htmlFor="addressZip">ZIP / Postal Code</Label><Input id="addressZip" name="addressZip" value={companyInfo.addressZip} onChange={handleCompanyInfoChange} placeholder="90210" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1"><Label htmlFor="addressCountry">Country</Label><Input id="addressCountry" name="addressCountry" value={companyInfo.addressCountry} onChange={handleCompanyInfoChange} placeholder="USA" /></div>
                    <div className="space-y-1"><Label htmlFor="phone">Phone Number</Label><Input id="phone" name="phone" type="tel" value={companyInfo.phone} onChange={handleCompanyInfoChange} placeholder="(555) 123-4567" /></div>
                </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
                <Button type="button" variant="destructive" onClick={handleRemoveCompanyInfo} disabled={!initialCompanyInfoLoaded || !hasStoredCompanyInfo}><Trash2 className="mr-2 h-4 w-4" /> Remove Info</Button>
                <Button type="button" onClick={handleSaveCompanyInfo} disabled={!initialCompanyInfoLoaded || !companyInfoChanged()}><Save className="mr-2 h-4 w-4" /> Save Company Info</Button>
            </CardFooter>
        </Card>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center"><Settings className="mr-2 h-5 w-5" /> Document Numbering</CardTitle>
            <CardDescription>Set prefixes for your Invoices and Order Forms. <span className="text-xs block text-muted-foreground/80 mt-1">Note: This is a UI placeholder for prefix configuration. Actual prefix usage in number generation requires backend integration.</span></CardDescription>
          </CardHeader>
          <Form {...prefixForm}>
            <form onSubmit={prefixForm.handleSubmit(handlePrefixSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={prefixForm.control}
                  name="invoicePrefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Prefix</FormLabel>
                      <FormControl><Input placeholder="INV-" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={prefixForm.control}
                  name="orderFormPrefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Form Prefix</FormLabel>
                      <FormControl><Input placeholder="OF-" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="justify-end">
                <Button type="submit" disabled={!initialPrefixesLoaded || !prefixForm.formState.isDirty}><Save className="mr-2 h-4 w-4" /> Save Prefixes</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center"><ImageIconLucide className="mr-2 h-5 w-5" /> Company Logo</CardTitle>
            <CardDescription>Upload your company logo. Max size: 1MB.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="logo-upload">Upload Logo</Label>
              <div className="flex items-center gap-4">
                <Input id="logo-upload" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoFileChange} className="flex-1"/>
                <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('logo-upload')?.click()}><UploadCloud className="h-5 w-5" /><span className="sr-only">Upload Logo</span></Button>
              </div>
            </div>
            {logoPreview && (<div className="space-y-2"><Label>Logo Preview</Label><div className="border rounded-md p-4 flex justify-center items-center bg-muted/30 min-h-[150px]"><Image src={logoPreview} alt="Logo Preview" width={200} height={80} style={{ objectFit: 'contain', maxHeight: '80px' }}/></div></div>)}
          </CardContent>
          <CardFooter className="justify-end gap-2">
            {initialLogoFromStorage && (<Button type="button" variant="destructive" onClick={() => handleRemoveAsset('logo')} disabled={!initialCompanyInfoLoaded || !initialLogoFromStorage}><Trash2 className="mr-2 h-4 w-4" /> Remove Logo</Button>)}
            <Button type="button" onClick={() => handleSaveAsset('logo')} disabled={isLogoSaveButtonDisabled}><Save className="mr-2 h-4 w-4" /> Save Logo</Button>
          </CardFooter>
        </Card>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center"><Edit3 className="mr-2 h-5 w-5" /> Company Signature</CardTitle>
            <CardDescription>Upload or draw your company signature. Max size for upload: 1MB.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeSignatureTab} onValueChange={(value) => setActiveSignatureTab(value as 'upload' | 'draw')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload"><ImageIconLucide className="mr-2 h-4 w-4" /> Upload Image</TabsTrigger>
                <TabsTrigger value="draw"><Edit3 className="mr-2 h-4 w-4" /> Draw Signature</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="pt-4">
                <div className="space-y-2">
                  <Label htmlFor="signature-upload">Upload Signature Image</Label>
                  <div className="flex items-center gap-4">
                    <Input id="signature-upload" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleSignatureFileChange} className="flex-1"/>
                     <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('signature-upload')?.click()}><UploadCloud className="h-5 w-5" /><span className="sr-only">Upload Signature</span></Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="draw" className="pt-4 flex flex-col items-center"><SignaturePad onConfirm={handleDrawnSignatureConfirm} /></TabsContent>
            </Tabs>
            {signaturePreview && (<div className="space-y-2 pt-4"><Label>Signature Preview</Label><div className="border rounded-md p-4 flex justify-center items-center bg-muted/30 min-h-[100px]"><Image src={signaturePreview} alt="Signature Preview" width={250} height={100} style={{ objectFit: 'contain', maxHeight: '100px' }}/></div></div>)}
          </CardContent>
          <CardFooter className="justify-end gap-2">
             {initialSignatureFromStorage && (<Button type="button" variant="destructive" onClick={() => handleRemoveAsset('signature')} disabled={!initialCompanyInfoLoaded || !initialSignatureFromStorage}><Trash2 className="mr-2 h-4 w-4" /> Remove Signature</Button>)}
            <Button type="button" onClick={() => handleSaveAsset('signature')} disabled={isSignatureSaveButtonDisabled}><Save className="mr-2 h-4 w-4" /> Save Signature</Button>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}
