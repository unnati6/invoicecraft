
'use client';

import * as _React from 'react'; // Corrected import
import type { Invoice, Customer } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';

const LOGO_STORAGE_KEY = 'branding_company_logo_data_url';


interface InvoicePreviewContentProps {
  document: Invoice; 
  customer?: Customer;
}

export function InvoicePreviewContent({ document: invoice, customer }: InvoicePreviewContentProps) {
  const [companyLogoUrl, setCompanyLogoUrl] = _React.useState<string | null>(null);

   _React.useEffect(() => {
    const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
    if (storedLogo) {
      setCompanyLogoUrl(storedLogo);
    } else {
      // Keep this consistent or remove if branding page sets a default
      // setCompanyLogoUrl('https://placehold.co/200x60.png'); 
    }
  }, []);


  const customerToDisplay = customer || { 
    name: invoice.customerName || 'N/A', 
    email: 'N/A', 
    address: undefined 
  };

  if (customer) {
    customerToDisplay.name = customer.name;
    customerToDisplay.email = customer.email;
  }

  const yourCompany = {
    logoUrl: companyLogoUrl, 
    name: 'Your Awesome Company LLC',
    addressLine1: '456 Innovation Drive',
    addressLine2: 'Suite 100, Tech City, TX 75001',
    email: 'billing@yourcompany.com',
    phone: '(555) 123-4567'
  };
  
  const partnerLogoUrl = 'https://placehold.co/150x50.png'; 

  // No longer showing a loading state here, will rely on useEffect to update the logo
  // The branding page should ideally handle the initial placeholder if nothing is in localStorage

  return (
    <div className="p-6 bg-card text-foreground font-sans text-sm">
      {/* Header with Your Company Logo & Details */}
      <div className="flex justify-between items-start mb-10">
        <div className="w-1/2">
          {yourCompany.logoUrl ? (
            <Image 
              src={yourCompany.logoUrl} 
              alt={`${yourCompany.name} Logo`}
              width={180} 
              height={54} 
              className="mb-3"
              style={{ objectFit: 'contain', maxHeight: '54px' }}
              data-ai-hint="company logo"
            />
          ) : (
             <div className="mb-3 w-[180px] h-[54px] bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                Your Logo
             </div>
          )}
          <h2 className="text-xl font-semibold text-primary">{yourCompany.name}</h2>
          <p className="text-xs text-muted-foreground">{yourCompany.addressLine1}</p>
          <p className="text-xs text-muted-foreground">{yourCompany.addressLine2}</p>
          <p className="text-xs text-muted-foreground">Email: {yourCompany.email}</p>
          <p className="text-xs text-muted-foreground">Phone: {yourCompany.phone}</p>
        </div>
        <div className="text-right w-1/2">
          <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
          <p className="text-muted-foreground">Invoice #: {invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* Bill To and Dates */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-1 text-muted-foreground">BILL TO:</h3>
          <p className="font-medium">{customerToDisplay.name}</p>
          {customerToDisplay.address && (
            <>
              <p className="text-sm">{customerToDisplay.address.street}</p>
              <p className="text-sm">{customerToDisplay.address.city}, {customerToDisplay.address.state} {customerToDisplay.address.zip}</p>
              <p className="text-sm">{customerToDisplay.address.country}</p>
            </>
          )}
          <p className="text-sm">{customerToDisplay.email}</p>
        </div>
        <div className="text-left md:text-right">
          <p><span className="font-semibold text-muted-foreground">Issue Date:</span> {format(new Date(invoice.issueDate), 'PPP')}</p>
          <p><span className="font-semibold text-muted-foreground">Due Date:</span> {format(new Date(invoice.dueDate), 'PPP')}</p>
          <p className="mt-2"><span className="font-semibold text-muted-foreground">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'Paid' ? 'bg-primary/10 text-primary' : invoice.status === 'Overdue' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground'}`}>{invoice.status}</span></p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left font-semibold border border-border">Description</th>
              <th className="p-2 text-right font-semibold border border-border">Quantity</th>
              <th className="p-2 text-right font-semibold border border-border">Rate</th>
              <th className="p-2 text-right font-semibold border border-border">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-border">
                <td className="p-2 border border-border">{item.description}</td>
                <td className="p-2 text-right border border-border">{item.quantity.toFixed(2)}</td>
                <td className="p-2 text-right border border-border">${item.rate.toFixed(2)}</td>
                <td className="p-2 text-right border border-border">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Partner Logo Section */}
      {partnerLogoUrl && (
        <div className="mb-8 mt-4 py-4 border-t border-b border-dashed">
            <p className="text-xs text-muted-foreground mb-2 text-center">In partnership with:</p>
            <div className="flex justify-center">
                <Image 
                    src={partnerLogoUrl} 
                    alt="Partner Logo" 
                    width={150} 
                    height={50} 
                    style={{ objectFit: 'contain', maxHeight: '50px' }}
                    data-ai-hint="partner logo"
                />
            </div>
        </div>
      )}

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          {/* TODO: Add display for additionalCharges here */}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax ({invoice.taxRate}%):</span>
            <span>${invoice.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 mt-2">
            <span className="font-bold text-lg">Total:</span>
            <span className="font-bold text-lg">${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      {invoice.termsAndConditions && (
        <div className="mb-8">
          <h3 className="font-semibold mb-2 text-muted-foreground">Terms & Conditions:</h3>
          <p className="text-sm whitespace-pre-wrap">{invoice.termsAndConditions}</p>
        </div>
      )}
      
      {/* Signature Section */}
      <div className="mt-12 pt-8 border-t">
        <div className="grid grid-cols-2 gap-8">
            <div>
                <p className="font-semibold mb-1">Authorized Signature (Your Company):</p>
                <div className="h-16 border-b border-gray-400 mb-2"></div>
                <p className="text-xs text-muted-foreground">{yourCompany.name}</p>
            </div>
            <div>
                <p className="font-semibold mb-1">Client Signature:</p>
                 <div className="h-16 border-b border-gray-400 mb-2"></div>
                <p className="text-xs text-muted-foreground">{customerToDisplay.name}</p>
            </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-sm text-muted-foreground mt-12">
        <p>Thank you for your business! Questions? Contact {yourCompany.email}</p>
      </div>
    </div>
  );
}

InvoicePreviewContent.displayName = "InvoicePreviewContent";
