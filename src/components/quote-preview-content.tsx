
'use client';

import * as _React from 'react';
import type { Quote, Customer, AdditionalChargeItem } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';

const LOGO_STORAGE_KEY = 'branding_company_logo_data_url';
const SIGNATURE_STORAGE_KEY = 'branding_company_signature_data_url';

interface QuotePreviewContentProps {
  document: Quote; 
  customer?: Customer;
}

export function QuotePreviewContent({ document: quote, customer }: QuotePreviewContentProps) {
  const [companyLogoUrl, setCompanyLogoUrl] = _React.useState<string | null>(null);
  const [companySignatureUrl, setCompanySignatureUrl] = _React.useState<string | null>(null);

  _React.useEffect(() => {
    const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
    if (storedLogo) {
      setCompanyLogoUrl(storedLogo);
    }
    const storedSignature = localStorage.getItem(SIGNATURE_STORAGE_KEY);
    if (storedSignature) {
      setCompanySignatureUrl(storedSignature);
    }
  }, []);

   const customerToDisplay = customer || { 
    name: quote.customerName || 'N/A', 
    email: 'N/A', 
    billingAddress: undefined,
    shippingAddress: undefined,
    currency: 'USD'
  };

  if (customer) {
    customerToDisplay.name = customer.name;
    customerToDisplay.email = customer.email;
    customerToDisplay.currency = customer.currency || 'USD';
    customerToDisplay.billingAddress = customer.billingAddress;
    customerToDisplay.shippingAddress = customer.shippingAddress;
  }

  const yourCompany = {
    logoUrl: companyLogoUrl,
    name: 'Your Awesome Company LLC',
    addressLine1: '456 Innovation Drive',
    addressLine2: 'Suite 100, Tech City, TX 75001',
    email: 'sales@yourcompany.com',
    phone: '(555) 123-7890'
  };
  
  const partnerLogoUrl = 'https://placehold.co/150x50.png'; 
  const totalAdditionalChargesValue = quote.additionalCharges?.reduce((sum, charge) => sum + charge.calculatedAmount, 0) || 0;

  const hasShippingAddress = customerToDisplay.shippingAddress && 
                             (customerToDisplay.shippingAddress.street || 
                              customerToDisplay.shippingAddress.city);

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
          <h1 className="text-3xl font-bold text-primary">QUOTE</h1>
          <p className="text-muted-foreground">Quote #: {quote.quoteNumber}</p>
        </div>
      </div>

      {/* Bill To, Ship To and Dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-1">
          <h3 className="font-semibold mb-1 text-muted-foreground">QUOTE FOR:</h3>
          <p className="font-medium">{customerToDisplay.name}</p>
          {customerToDisplay.billingAddress && (
            <>
              <p className="text-sm">{customerToDisplay.billingAddress.street}</p>
              <p className="text-sm">{customerToDisplay.billingAddress.city}, {customerToDisplay.billingAddress.state} {customerToDisplay.billingAddress.zip}</p>
              <p className="text-sm">{customerToDisplay.billingAddress.country}</p>
            </>
          )}
          <p className="text-sm">{customerToDisplay.email}</p>
        </div>
        
        {hasShippingAddress && (
            <div className="md:col-span-1">
                <h3 className="font-semibold mb-1 text-muted-foreground">SHIP TO:</h3>
                <p className="font-medium">{customerToDisplay.name}</p>
                 {customerToDisplay.shippingAddress && (
                    <>
                        <p className="text-sm">{customerToDisplay.shippingAddress.street}</p>
                        <p className="text-sm">{customerToDisplay.shippingAddress.city}, {customerToDisplay.shippingAddress.state} {customerToDisplay.shippingAddress.zip}</p>
                        <p className="text-sm">{customerToDisplay.shippingAddress.country}</p>
                    </>
                )}
            </div>
        )}

        <div className={`text-left ${hasShippingAddress ? 'md:text-right md:col-span-1' : 'md:text-right md:col-start-3 md:col-span-1'}`}>
          <p><span className="font-semibold text-muted-foreground">Issue Date:</span> {format(new Date(quote.issueDate), 'PPP')}</p>
          <p><span className="font-semibold text-muted-foreground">Expiry Date:</span> {format(new Date(quote.expiryDate), 'PPP')}</p>
           <p className="mt-2"><span className="font-semibold text-muted-foreground">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${quote.status === 'Accepted' ? 'bg-primary/10 text-primary' : quote.status === 'Declined' || quote.status === 'Expired' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground'}`}>{quote.status}</span></p>
           {customerToDisplay.currency && <p><span className="font-semibold text-muted-foreground">Currency:</span> {customerToDisplay.currency}</p>}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-4">
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
            {quote.items.map((item) => (
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

      {/* Additional Charges Table */}
      {quote.additionalCharges && quote.additionalCharges.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold mb-2 text-muted-foreground text-sm">Additional Charges:</h3>
          <table className="w-full border-collapse">
            <tbody>
              {quote.additionalCharges.map((charge) => (
                <tr key={charge.id} className="border-b border-border">
                  <td className="p-2 border border-border">
                    {charge.description}
                    {charge.valueType === 'percentage' && ` (${charge.value}%)`}
                  </td>
                  <td className="p-2 text-right border border-border">${charge.calculatedAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
            <span className="text-muted-foreground">Subtotal (Items):</span>
            <span>${quote.subtotal.toFixed(2)}</span>
          </div>
          {totalAdditionalChargesValue > 0 && (
             <div className="flex justify-between">
                <span className="text-muted-foreground">Total Additional Charges:</span>
                <span>${totalAdditionalChargesValue.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax ({quote.taxRate}%):</span>
            <span>${quote.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 mt-2">
            <span className="font-bold text-lg">Total:</span>
            <span className="font-bold text-lg">${quote.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      {quote.termsAndConditions && (
        <div className="mb-8">
          <h3 className="font-semibold mb-2 text-muted-foreground">Terms & Conditions:</h3>
          <p className="text-sm whitespace-pre-wrap">{quote.termsAndConditions}</p>
        </div>
      )}

      {/* Signature Section */}
      <div className="mt-12 pt-8 border-t">
        <div className="grid grid-cols-2 gap-8">
            <div>
                <p className="font-semibold mb-1">Prepared By (Your Company):</p>
                 {companySignatureUrl ? (
                  <div className="relative h-20 mb-2">
                    <Image
                      src={companySignatureUrl}
                      alt="Company Signature"
                      fill={true}
                      style={{ objectFit: 'contain' }}
                      className="border-b border-gray-400"
                    />
                  </div>
                ) : (
                  <div className="h-16 border-b border-gray-400 mb-2"></div>
                )}
                <p className="text-xs text-muted-foreground">{yourCompany.name}</p>
            </div>
            <div>
                <p className="font-semibold mb-1">Client Acknowledgement (Optional):</p>
                 <div className="h-16 border-b border-gray-400 mb-2"></div>
                <p className="text-xs text-muted-foreground">{customerToDisplay.name}</p>
            </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-sm text-muted-foreground mt-12">
        <p>Thank you for considering our services! Questions? Contact {yourCompany.email}</p>
      </div>
    </div>
  );
}

QuotePreviewContent.displayName = "QuotePreviewContent";
