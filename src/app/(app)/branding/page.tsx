
'use client';

import * as React from 'react';
import Image from 'next/image';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Save, Trash2 } from 'lucide-react';

const LOGO_STORAGE_KEY = 'branding_company_logo_data_url';
const SIGNATURE_STORAGE_KEY = 'branding_company_signature_data_url';

export default function BrandingPage() {
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [selectedLogoFile, setSelectedLogoFile] = React.useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = React.useState<string | null>(null);
  const [selectedSignatureFile, setSelectedSignatureFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
    if (storedLogo) {
      setLogoPreview(storedLogo);
    }
    const storedSignature = localStorage.getItem(SIGNATURE_STORAGE_KEY);
    if (storedSignature) {
      setSignaturePreview(storedSignature);
    }
  }, []);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'signature'
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // Max 1MB for logo/signature
        toast({
          title: 'File too large',
          description: `Please select an image smaller than 1MB for the ${type}.`,
          variant: 'destructive',
        });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: `Please select a JPG, PNG, or SVG image for the ${type}.`,
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') {
          setSelectedLogoFile(file);
          setLogoPreview(reader.result as string);
        } else {
          setSelectedSignatureFile(file);
          setSignaturePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      if (type === 'logo') {
        setSelectedLogoFile(null);
        const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
        setLogoPreview(storedLogo);
      } else {
        setSelectedSignatureFile(null);
        const storedSignature = localStorage.getItem(SIGNATURE_STORAGE_KEY);
        setSignaturePreview(storedSignature);
      }
    }
  };

  const handleSave = (type: 'logo' | 'signature') => {
    if (type === 'logo') {
      if (logoPreview && selectedLogoFile) {
        localStorage.setItem(LOGO_STORAGE_KEY, logoPreview);
        toast({ title: 'Success', description: 'Logo saved successfully.' });
        setSelectedLogoFile(null);
      } else if (!selectedLogoFile && logoPreview) {
        toast({ title: 'No changes', description: 'No new logo selected to save.' });
      } else if (!logoPreview) {
         toast({ title: 'No logo', description: 'Please select a logo to save.', variant: 'destructive'});
      }
    } else { // Signature
      if (signaturePreview && selectedSignatureFile) {
        localStorage.setItem(SIGNATURE_STORAGE_KEY, signaturePreview);
        toast({ title: 'Success', description: 'Signature saved successfully.' });
        setSelectedSignatureFile(null);
      } else if (!selectedSignatureFile && signaturePreview) {
        toast({ title: 'No changes', description: 'No new signature selected to save.' });
      } else if (!signaturePreview) {
         toast({ title: 'No signature', description: 'Please select a signature to save.', variant: 'destructive'});
      }
    }
  };

  const handleRemove = (type: 'logo' | 'signature') => {
    if (type === 'logo') {
      localStorage.removeItem(LOGO_STORAGE_KEY);
      setLogoPreview(null);
      setSelectedLogoFile(null);
      const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      toast({ title: 'Success', description: 'Logo removed.' });
    } else { // Signature
      localStorage.removeItem(SIGNATURE_STORAGE_KEY);
      setSignaturePreview(null);
      setSelectedSignatureFile(null);
      const fileInput = document.getElementById('signature-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      toast({ title: 'Success', description: 'Signature removed.' });
    }
  };

  return (
    <>
      <AppHeader title="Branding Settings" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Company Logo</CardTitle>
            <CardDescription>
              Upload your company logo. This will appear on invoices and quotes.
              Recommended format: PNG, JPG, SVG. Max size: 1MB.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="logo-upload">Upload Logo</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={(e) => handleFileChange(e, 'logo')}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('logo-upload')?.click()}>
                  <UploadCloud className="h-5 w-5" />
                  <span className="sr-only">Upload Logo</span>
                </Button>
              </div>
            </div>

            {logoPreview && (
              <div className="space-y-2">
                <Label>Logo Preview</Label>
                <div className="border rounded-md p-4 flex justify-center items-center bg-muted/30 min-h-[150px]">
                  <Image
                    src={logoPreview}
                    alt="Logo Preview"
                    width={200}
                    height={80}
                    style={{ objectFit: 'contain', maxHeight: '80px' }}
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end gap-2">
            {logoPreview && localStorage.getItem(LOGO_STORAGE_KEY) && (
                 <Button type="button" variant="destructive" onClick={() => handleRemove('logo')} disabled={!localStorage.getItem(LOGO_STORAGE_KEY)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Remove Logo
                 </Button>
            )}
            <Button type="button" onClick={() => handleSave('logo')} disabled={!selectedLogoFile && !!localStorage.getItem(LOGO_STORAGE_KEY)}>
              <Save className="mr-2 h-4 w-4" /> Save Logo
            </Button>
          </CardFooter>
        </Card>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Company Signature</CardTitle>
            <CardDescription>
              Upload an image of your company signature. This can appear on quotes and invoices.
              Recommended format: PNG with transparent background. Max size: 1MB.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="signature-upload">Upload Signature</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="signature-upload"
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={(e) => handleFileChange(e, 'signature')}
                  className="flex-1"
                />
                 <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('signature-upload')?.click()}>
                  <UploadCloud className="h-5 w-5" />
                  <span className="sr-only">Upload Signature</span>
                </Button>
              </div>
            </div>

            {signaturePreview && (
              <div className="space-y-2">
                <Label>Signature Preview</Label>
                <div className="border rounded-md p-4 flex justify-center items-center bg-muted/30 min-h-[100px]">
                  <Image
                    src={signaturePreview}
                    alt="Signature Preview"
                    width={250}
                    height={100}
                    style={{ objectFit: 'contain', maxHeight: '100px' }}
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end gap-2">
             {signaturePreview && localStorage.getItem(SIGNATURE_STORAGE_KEY) && (
                 <Button type="button" variant="destructive" onClick={() => handleRemove('signature')} disabled={!localStorage.getItem(SIGNATURE_STORAGE_KEY)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Remove Signature
                 </Button>
            )}
            <Button type="button" onClick={() => handleSave('signature')} disabled={!selectedSignatureFile && !!localStorage.getItem(SIGNATURE_STORAGE_KEY)}>
              <Save className="mr-2 h-4 w-4" /> Save Signature
            </Button>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}
