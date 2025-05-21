
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

export default function BrandingPage() {
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
    if (storedLogo) {
      setLogoPreview(storedLogo);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 2MB.',
          variant: 'destructive',
        });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'].includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a JPG, PNG, GIF, or SVG image.',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      // If no file is selected, revert to stored logo if it exists, otherwise clear preview
      const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
      setLogoPreview(storedLogo); 
    }
  };

  const handleSaveLogo = () => {
    if (logoPreview && selectedFile) { // Only save if a new file was selected and preview exists
      localStorage.setItem(LOGO_STORAGE_KEY, logoPreview);
      toast({ title: 'Success', description: 'Logo saved successfully.' });
      setSelectedFile(null); // Reset selected file state after saving
    } else if (!selectedFile && logoPreview) {
      // This case means logoPreview is from localStorage, no new file selected
      toast({ title: 'No changes', description: 'No new logo selected to save.' });
    } else if (!logoPreview) {
       toast({ title: 'No logo', description: 'Please select a logo to save.', variant: 'destructive'});
    }
  };

  const handleRemoveLogo = () => {
    localStorage.removeItem(LOGO_STORAGE_KEY);
    setLogoPreview(null);
    setSelectedFile(null);
    // Also clear the file input visually
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    toast({ title: 'Success', description: 'Logo removed.' });
  };

  return (
    <>
      <AppHeader title="Branding Settings" />
      <main className="flex-1 p-4 md:p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Company Logo</CardTitle>
            <CardDescription>
              Upload your company logo. This will appear on invoices and quotes.
              Recommended format: PNG, JPG, SVG. Max size: 2MB.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="logo-upload">Upload Logo</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/png, image/jpeg, image/gif, image/svg+xml"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('logo-upload')?.click()}>
                  <UploadCloud className="h-5 w-5" />
                  <span className="sr-only">Upload</span>
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
            {logoPreview && localStorage.getItem(LOGO_STORAGE_KEY) && ( // Show remove only if a logo is currently stored
                 <Button type="button" variant="destructive" onClick={handleRemoveLogo} disabled={!localStorage.getItem(LOGO_STORAGE_KEY)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Remove Logo
                 </Button>
            )}
            <Button type="button" onClick={handleSaveLogo} disabled={!selectedFile && !!localStorage.getItem(LOGO_STORAGE_KEY)}>
              <Save className="mr-2 h-4 w-4" /> Save Logo
            </Button>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}
