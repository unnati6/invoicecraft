
'use client';

import * as _React from 'react';
import type { Quote, Customer } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { getCurrencySymbol } from '@/lib/currency-utils';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

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

interface QuotePreviewContentProps {
  document: Quote;
  customer?: Customer;
}

function replacePlaceholders(
  content: string | undefined,
  doc: Quote,
  customer?: Customer
): string {
  if (!content) return '';
  let processedContent = content;

  const currencySymbol = getCurrencySymbol(customer?.currency || doc.currencyCode);

  const placeholders: Record<string, () => string | undefined> = {
    '{{customerName}}': () => customer?.name,
    '{{customerEmail}}': () => customer?.email,
    '{{customerPhone}}': () => customer?.phone,
    '{{customerBillingAddress.street}}': () => customer?.billingAddress?.street,
    '{{customerBillingAddress.city}}': () => customer?.billingAddress?.city,
    '{{customerBillingAddress.state}}': () => customer?.billingAddress?.state,
    '{{customerBillingAddress.zip}}': () => customer?.billingAddress?.zip,
    '{{customerBillingAddress.country}}': () => customer?.billingAddress?.country,
    '{{customerShippingAddress.street}}': () => customer?.shippingAddress?.street,
    '{{customerShippingAddress.city}}': () => customer?.shippingAddress?.city,
    '{{customerShippingAddress.state}}': () => customer?.shippingAddress?.state,
    '{{customerShippingAddress.zip}}': () => customer?.shippingAddress?.zip,
    '{{customerShippingAddress.country}}': () => customer?.shippingAddress?.country,
    '{{documentNumber}}': () => doc.quoteNumber,
    '{{issueDate}}': () => format(new Date(doc.issueDate), 'PPP'),
    '{{expiryDate}}': () => format(new Date(doc.expiryDate), 'PPP'),
    '{{totalAmount}}': () => `${currencySymbol}${doc.total.toFixed(2)}`,
  };

  for (const placeholder in placeholders) {
    const tag = placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); 
    const value = placeholders[placeholder]();
    processedContent = processedContent.replace(new RegExp(tag, 'g'), value || '');
  }
  
  const signaturePanelHtml = `
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
      <h4 style="margin-bottom: 15px; font-size: 1.1em;">Signatures</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
        <tr>
          <td style="width: 50%; padding: 10px 5px; vertical-align: bottom;">
            <div style="border-bottom: 1px solid #333; height: 40px; margin-bottom: 5px;"></div>
            <p style="margin: 0;">Authorized Signature (Your Company)</p>
          </td>
          <td style="width: 50%; padding: 10px 5px; vertical-align: bottom;">
            <div style="border-bottom: 1px solid #333; height: 40px; margin-bottom: 5px;"></div>
            <p style="margin: 0;">Client Signature</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 5px;">
            <p style="margin: 0;">Printed Name: _________________________</p>
          </td>
          <td style="padding: 5px;">
            <p style="margin: 0;">Printed Name: _________________________</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 5px;">
            <p style="margin: 0;">Date: _________________________</p>
          </td>
          <td style="padding: 5px;">
            <p style="margin: 0;">Date: _________________________</p>
          </td>
        </tr>
      </table>
    </div>
  `;
  processedContent = processedContent.replace(/{{signaturePanel}}/g, signaturePanelHtml);

  return processedContent;
}


export function QuotePreviewContent({ document: quote, customer }: QuotePreviewContentProps) {
  const [companyLogoUrl, setCompanyLogoUrl] = _React.useState<string | null>(null);
  const [companySignatureUrl, setCompanySignatureUrl] = _React.useState<string | null>(null);
  const [yourCompany, setYourCompany] = _React.useState({
    name: 'Your Awesome Company LLC',
    addressLine1: '456 Innovation Drive',
    addressLine2: 'Suite 100, Tech City, TX 75001',
    email: 'sales@yourcompany.com',
    phone: '(555) 123-7890'
  });


  _React.useEffect(() => {
    const isClient = typeof window !== 'undefined';
    if (isClient) {
        const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
        if (storedLogo) {
        setCompanyLogoUrl(storedLogo);
        }
        const storedSignature = localStorage.getItem(SIGNATURE_STORAGE_KEY);
        if (storedSignature) {
        setCompanySignatureUrl(storedSignature);
        }
        
        const name = localStorage.getItem(COMPANY_INFO_KEYS.NAME) || yourCompany.name;
        const street = localStorage.getItem(COMPANY_INFO_KEYS.ADDRESS_STREET) || '';
        const city = localStorage.getItem(COMPANY_INFO_KEYS.ADDRESS_CITY) || '';
        const state = localStorage.getItem(COMPANY_INFO_KEYS.ADDRESS_STATE) || '';
        const zip = localStorage.getItem(COMPANY_INFO_KEYS.ADDRESS_ZIP) || '';
        const country = localStorage.getItem(COMPANY_INFO_KEYS.ADDRESS_COUNTRY) || '';
        const phone = localStorage.getItem(COMPANY_INFO_KEYS.PHONE) || yourCompany.phone;
        const email = localStorage.getItem(COMPANY_INFO_KEYS.EMAIL) || yourCompany.email;

        let addressLine1 = street;
        let addressLine2 = `${city}${city && (state || zip || country) ? ', ' : ''}${state} ${zip}${zip && country ? ', ' : ''}${country}`.trim();
        if (!addressLine1 && addressLine2) {
          addressLine1 = addressLine2;
          addressLine2 = '';
        }

        setYourCompany({
            name,
            addressLine1: addressLine1 || 'Your Address Line 1',
            addressLine2: addressLine2.length > 0 ? addressLine2 : 'City, State, Zip, Country',
            phone,
            email,
        });
    }
  }, [yourCompany.name, yourCompany.phone, yourCompany.email]);

   const customerToDisplay: Partial<Customer> & { name: string; email: string; currency: string } = {
    name: quote.customerName || customer?.name || 'N/A',
    email: customer?.email || 'N/A',
    billingAddress: customer?.billingAddress || undefined,
    shippingAddress: customer?.shippingAddress || undefined,
    currency: customer?.currency || quote.currencyCode || 'USD'
  };

  const currencySymbol = getCurrencySymbol(customerToDisplay.currency);
  const partnerLogoUrl = 'https://placehold.co/150x50.png';
  const totalAdditionalChargesValue = quote.additionalCharges?.reduce((sum, charge) => sum + charge.calculatedAmount, 0) || 0;
  const hasShippingAddress = customerToDisplay.shippingAddress &&
                             (customerToDisplay.shippingAddress.street ||
                              customerToDisplay.shippingAddress.city);
  
  const processedTermsAndConditions = replacePlaceholders(quote.termsAndConditions, quote, customer);

  return (
    <div className="p-6 bg-card text-foreground font-sans text-sm">
      <div className="flex justify-between items-start mb-10">
        <div className="w-1/2">
          {companyLogoUrl ? (
            <Image
              src={companyLogoUrl}
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
                <td className="p-2 text-right border border-border">{currencySymbol}{item.rate.toFixed(2)}</td>
                <td className="p-2 text-right border border-border">{currencySymbol}{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {quote.additionalCharges && quote.additionalCharges.length > 0 && (
        <div className="mb-8">
          <table className="w-full border-collapse">
            <tbody>
              {quote.additionalCharges.map((charge) => (
                <tr key={charge.id} className="border-b border-border">
                  <td className="p-2 border border-border">
                    {charge.description}
                    {charge.valueType === 'percentage' && ` (${charge.value}%)`}
                  </td>
                  <td className="p-2 text-right border border-border">{currencySymbol}{charge.calculatedAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {partnerLogoUrl && (
        <div className="mb-8 mt-4 py-4 border-t border-b border-dashed">
            <div className="flex justify-start">
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

      <div className="flex justify-end mb-8">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal (Items):</span>
            <span>{currencySymbol}{quote.subtotal.toFixed(2)}</span>
          </div>
          {totalAdditionalChargesValue > 0 && (
             <div className="flex justify-between">
                <span className="text-muted-foreground">Total Additional Charges:</span>
                <span>{currencySymbol}{totalAdditionalChargesValue.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax ({quote.taxRate}%):</span>
            <span>{currencySymbol}{quote.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 mt-2">
            <span className="font-bold text-lg">Total:</span>
            <span className="font-bold text-lg">{currencySymbol}{quote.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {processedTermsAndConditions && (
        <div className="mb-8 prose prose-sm max-w-none">
          <h3 className="font-semibold mb-2 text-muted-foreground">Terms & Conditions:</h3>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {processedTermsAndConditions}
          </ReactMarkdown>
        </div>
      )}

      <div className="mt-12 pt-8 border-t">
        <div className="grid grid-cols-2 gap-8">
            <div>
                <p className="font-semibold mb-1">Prepared By ({yourCompany.name}):</p>
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

      <div className="text-center text-sm text-muted-foreground mt-12">
        <p>Thank you for considering our services! Questions? Contact {yourCompany.email}</p>
      </div>
    </div>
  );
}

QuotePreviewContent.displayName = "QuotePreviewContent";
