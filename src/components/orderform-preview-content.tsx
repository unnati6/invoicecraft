'use client';

import * as _React from 'react';
import type { OrderForm, Customer, CoverPageTemplate } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { getCurrencySymbol } from '@/lib/currency-utils';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { CoverPageContent } from '@/components/cover-page-content';

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

interface OrderFormPreviewContentProps {
  document: OrderForm;
  customer?: Customer;
  coverPageTemplate?: CoverPageTemplate; // Passed from dialog
}

function replacePlaceholders(
  content: string | undefined,
  doc: OrderForm,
  customer?: Customer
): string | undefined {
  if (!content?.trim()) return undefined;
  let processedContent = content;

  const currencySymbol = getCurrencySymbol(customer?.currency || doc.currencyCode);

  const paymentTermsDisplay = (doc.paymentTerms === 'Custom' && doc.customPaymentTerms?.trim())
    ? doc.customPaymentTerms
    : (doc.paymentTerms === 'Custom' ? 'Custom (Details in document)' : doc.paymentTerms);

  const commitmentPeriodDisplay = (doc.commitmentPeriod === 'Custom' && doc.customCommitmentPeriod?.trim())
    ? doc.customCommitmentPeriod
    : (doc.commitmentPeriod === 'Custom' ? 'Custom (Details in document)' : doc.commitmentPeriod);

  const paymentFrequencyDisplay = (doc.paymentFrequency === 'Custom' && doc.customPaymentFrequency?.trim())
    ? doc.customPaymentFrequency
    : (doc.paymentFrequency === 'Custom' ? 'Custom (Details in document)' : doc.paymentFrequency);


  const placeholders: Record<string, () => string | undefined | null> = {
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
    '{{documentNumber}}': () => doc.orderFormNumber,
    '{{issueDate}}': () => doc.issueDate ? format(new Date(doc.issueDate), 'PPP') : '',
    '{{validUntilDate}}': () => doc.validUntilDate ? format(new Date(doc.validUntilDate), 'PPP') : '',
    '{{totalAmount}}': () => `${currencySymbol}${(doc.total || 0).toFixed(2)}`,
    '{{paymentTerms}}': () => paymentTermsDisplay,
    '{{commitmentPeriod}}': () => commitmentPeriodDisplay,
    '{{paymentFrequency}}': () => paymentFrequencyDisplay,
    '{{serviceStartDate}}': () => doc.serviceStartDate ? format(new Date(doc.serviceStartDate), 'PPP') : '',
    '{{serviceEndDate}}': () => doc.serviceEndDate ? format(new Date(doc.serviceEndDate), 'PPP') : '',
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
  if (!processedContent?.trim()) return undefined;
  return processedContent;
}


export function OrderFormPreviewContent({ document: orderForm, customer, coverPageTemplate }: OrderFormPreviewContentProps) {
  // CORRECTED: Log objects directly. If you need a deep clone for logging to avoid mutation
  // you can use structuredClone() or JSON.parse(JSON.stringify()) with checks.
  // But for simple logging, direct object is fine.
  console.log("[OrderFormPreviewContent] Received document:", orderForm);
  console.log("[OrderFormPreviewContent] Received customer:", customer);
  console.log("[OrderFormPreviewContent] Received coverPageTemplate:", coverPageTemplate);

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
        if (storedLogo) setCompanyLogoUrl(storedLogo);
        else setCompanyLogoUrl('/images/revynox_logo_black.png');

        const storedSignature = localStorage.getItem(SIGNATURE_STORAGE_KEY);
        if (storedSignature) setCompanySignatureUrl(storedSignature);

        const name = localStorage.getItem(COMPANY_INFO_KEYS.NAME) || yourCompany.name;
        const street = localStorage.getItem(COMPANY_INFO_KEYS.ADDRESS_STREET) || '';
        const city = localStorage.getItem(COMPANY_INFO_KEYS.ADDRESS_CITY) || '';
        const stateVal = localStorage.getItem(COMPANY_INFO_KEYS.ADDRESS_STATE) || '';
        const zip = localStorage.getItem(COMPANY_INFO_KEYS.ADDRESS_ZIP) || '';
        const country = localStorage.getItem(COMPANY_INFO_KEYS.ADDRESS_COUNTRY) || '';
        const phone = localStorage.getItem(COMPANY_INFO_KEYS.PHONE) || yourCompany.phone;
        const email = localStorage.getItem(COMPANY_INFO_KEYS.EMAIL) || yourCompany.email;

        let addressLine1 = street;
        let addressLine2 = `${city}${city && (stateVal || zip || country) ? ', ' : ''}${stateVal} ${zip}${zip && country ? ', ' : ''}${country}`.trim();
        if (!addressLine1 && addressLine2) {
          addressLine1 = addressLine2;
          addressLine2 = '';
        }

        setYourCompany({
            name,
            addressLine1: addressLine1 || 'Your Address Line 1',
            addressLine2: addressLine2.length > 0 ? addressLine2 : '',
            phone,
            email,
        });
    }
  }, [yourCompany.name, yourCompany.email, yourCompany.phone]); // Removed orderForm.msaContent as it's not directly used here

    const customerToDisplay: Partial<Customer> & { name: string; email: string; currency: string } = {
    name: orderForm.customerName || customer?.name || 'N/A',
    email: customer?.email || 'N/A',
    billingAddress: customer?.billingAddress || undefined,
    shippingAddress: customer?.shippingAddress || undefined,
    currency: customer?.currency || orderForm.currencyCode || 'USD'
  };

  const currencySymbol = getCurrencySymbol(customerToDisplay.currency);
  const partnerLogoUrl = 'https://placehold.co/150x50.png';
  const totalAdditionalChargesValue = orderForm.additionalCharges?.reduce((sum, charge) => sum + (charge.calculatedAmount ?? 0), 0) || 0;
  const hasShippingAddress = customerToDisplay.shippingAddress &&
                             (customerToDisplay.shippingAddress.street ||
                              customerToDisplay.shippingAddress.city);

  const processedMsaContent = orderForm.msaContent ? replacePlaceholders(orderForm.msaContent, orderForm, customer) : undefined;
  const processedTermsAndConditions = orderForm.termsAndConditions ? replacePlaceholders(orderForm.termsAndConditions, orderForm, customer) : undefined;

  const paymentTermsText = (orderForm.paymentTerms === 'Custom')
    ? (orderForm.customPaymentTerms?.trim() ? orderForm.customPaymentTerms : 'Custom (Not specified)')
    : orderForm.paymentTerms;

  const commitmentPeriodText = (orderForm.commitmentPeriod === 'Custom')
    ? (orderForm.customCommitmentPeriod?.trim() ? orderForm.customCommitmentPeriod : 'Custom (Not specified)')
    : orderForm.commitmentPeriod;

  const paymentFrequencyText = (orderForm.paymentFrequency === 'Custom')
    ? (orderForm.customPaymentFrequency?.trim() ? orderForm.customPaymentFrequency : 'Custom (Not specified)')
    : orderForm.paymentFrequency;

  return (
    <div className="p-6 bg-card text-foreground font-sans text-sm">
      {coverPageTemplate && orderForm?.msaContent && (
        <>
          <CoverPageContent document={orderForm} customer={customer} template={coverPageTemplate} />
          <hr className="my-6 border-border" />
        </>
      )}
      {processedMsaContent && (
        <>
          <div className="mb-4 prose prose-sm max-w-none break-words">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{processedMsaContent}</ReactMarkdown>
          </div>
          <hr className="my-6 border-border" />
        </>
      )}

      <div className="flex justify-between items-start mb-10">
        <div className="w-1/2">
          {companyLogoUrl ? (
            <Image src={companyLogoUrl} alt={`${yourCompany.name} Logo`} width={180} height={54} className="mb-3" style={{ objectFit: 'contain', maxHeight: '54px' }} data-ai-hint="company logo"/>
          ) : ( <div className="mb-3 w-[180px] h-[54px] bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">Your Logo</div> )}
          <h2 className="text-xl font-semibold text-primary">{yourCompany.name}</h2>
          <p className="text-xs text-muted-foreground">{yourCompany.addressLine1}</p>
          {yourCompany.addressLine2 && <p className="text-xs text-muted-foreground">{yourCompany.addressLine2}</p>}
          <p className="text-xs text-muted-foreground">Email: {yourCompany.email}</p>
          <p className="text-xs text-muted-foreground">Phone: {yourCompany.phone}</p>
        </div>
        <div className="text-right w-1/2">
          <h1 className="text-3xl font-bold text-primary">ORDER FORM</h1>
          <p className="text-muted-foreground">Order Form #: {orderForm.orderFormNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-1">
          <h3 className="font-semibold mb-1 text-muted-foreground">ORDER FORM FOR:</h3>
          <p className="font-medium">{customerToDisplay.name}</p>
          {customerToDisplay.billingAddress && (<>
              <p className="text-sm">{customerToDisplay.billingAddress.street}</p>
              <p className="text-sm">{customerToDisplay.billingAddress.city}, {customerToDisplay.billingAddress.state} {customerToDisplay.billingAddress.zip}</p>
              <p className="text-sm">{customerToDisplay.billingAddress.country}</p>
          </>)}
          <p className="text-sm">{customerToDisplay.email}</p>
        </div>

        {hasShippingAddress && (
            <div className="md:col-span-1">
                <h3 className="font-semibold mb-1 text-muted-foreground">SHIP TO:</h3>
                <p className="font-medium">{customerToDisplay.name}</p>
                 {customerToDisplay.shippingAddress && (<>
                        <p className="text-sm">{customerToDisplay.shippingAddress.street}</p>
                        <p className="text-sm">{customerToDisplay.shippingAddress.city}, {customerToDisplay.shippingAddress.state} {customerToDisplay.shippingAddress.zip}</p>
                        <p className="text-sm">{customerToDisplay.shippingAddress.country}</p>
                    </>)}
            </div>
        )}

        <div className={`text-left ${hasShippingAddress ? 'md:text-right md:col-span-1' : 'md:text-right md:col-start-3 md:col-span-1'}`}>
          <p><span className="font-semibold text-muted-foreground">Issue Date:</span> {orderForm.issueDate ? format(new Date(orderForm.issueDate), 'PPP') : 'N/A'}</p>
          <p><span className="font-semibold text-muted-foreground">Valid Until:</span> {orderForm.validUntilDate ? format(new Date(orderForm.validUntilDate), 'PPP') : 'N/A'}</p>
           <p className="mt-2"><span className="font-semibold text-muted-foreground">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${orderForm.status === 'Accepted' ? 'bg-primary/10 text-primary' : orderForm.status === 'Declined' || orderForm.status === 'Expired' ? 'bg-destructive/10 text-destructive-foreground' : 'bg-secondary text-secondary-foreground'}`}>{orderForm.status}</span></p>
           {customerToDisplay.currency && <p><span className="font-semibold text-muted-foreground">Currency:</span> {customerToDisplay.currency}</p>}
        </div>
      </div>

      { (paymentTermsText || commitmentPeriodText || paymentFrequencyText || orderForm.serviceStartDate || orderForm.serviceEndDate) && (
        <div className="mb-6 p-4 border rounded-md bg-muted/30">
          <h3 className="font-semibold mb-2 text-muted-foreground">Service &amp; Payment Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {paymentTermsText && paymentTermsText !== "N/A" && <p><span className="font-medium">Payment Terms:</span> {paymentTermsText}</p>}
            {commitmentPeriodText && commitmentPeriodText !== "N/A" && <p><span className="font-medium">Commitment Period:</span> {commitmentPeriodText}</p>}
            {paymentFrequencyText && paymentFrequencyText !== "N/A" && <p><span className="font-medium">Payment Frequency:</span> {paymentFrequencyText}</p>}
            {orderForm.serviceStartDate && <p><span className="font-medium">Service Start:</span> {format(new Date(orderForm.serviceStartDate), 'PPP')}</p>}
            {orderForm.serviceEndDate && <p><span className="font-medium">Service End:</span> {format(new Date(orderForm.serviceEndDate), 'PPP')}</p>}
          </div>
        </div>
      )}

      {/* Order Form Items */}
      {orderForm.items && orderForm.items.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold mb-2 text-muted-foreground">Items & Services</h3>
          <table className="w-full border border-border">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground">
                <th className="p-2 text-left border border-border">Description</th>
                <th className="p-2 text-right border border-border">Quantity</th>
                <th className="p-2 text-right border border-border">Rate ({currencySymbol})</th>
                <th className="p-2 text-right border border-border">Amount ({currencySymbol})</th>
              </tr>
            </thead>
            <tbody>
              {orderForm.items.map((item) => (
                <tr key={item.id} className="border-b border-border">
                  <td className="p-2 border border-border">{item.description}</td>
                  <td className="p-2 text-right border border-border">{item.quantity}</td>
                  <td className="p-2 text-right border border-border">{item.rate.toFixed(2)}</td>
                  <td className="p-2 text-right border border-border">{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Additional Charges */}
      {orderForm.additionalCharges && orderForm.additionalCharges.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold mb-2 text-muted-foreground">Additional Charges</h3>
          <table className="w-full border-collapse">
            <tbody>
              {orderForm.additionalCharges.map((charge) => (
                <tr key={charge.id} className="border-b border-border">
                  <td className="p-2 border border-border">
                    {charge.description}
                    {charge.valueType === 'percentage' && ` (${charge.value}%)`}
                  </td>
                  <td className="p-2 text-right border border-border">{currencySymbol}{(charge.calculatedAmount ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {/* Totals Section */}
      <div className="flex justify-end mb-8">
        <div className="w-full md:w-1/3 border border-border p-4">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Subtotal:</span>
            <span>{currencySymbol}{(orderForm.subtotal || 0).toFixed(2)}</span>
          </div>
          {orderForm.discountType && orderForm.discountValue !== undefined && (
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Discount ({orderForm.discountType === 'percentage' ? `${orderForm.discountValue}%` : currencySymbol}):</span>
              <span>-{currencySymbol}{(orderForm.discountAmount || 0).toFixed(2)}</span>
            </div>
          )}
          {totalAdditionalChargesValue > 0 && (
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Additional Charges:</span>
              <span>{currencySymbol}{(totalAdditionalChargesValue).toFixed(2)}</span>
            </div>
          )}
          {orderForm.taxRate !== undefined && orderForm.taxRate > 0 && (
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Tax ({orderForm.taxRate}%):</span>
              <span>{currencySymbol}{(orderForm.taxAmount || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-2 border-border">
            <span>Total:</span>
            <span>{currencySymbol}{(orderForm.total || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Instructions / Notes */}
      {/* {orderForm.notes && (
        <div className="mb-8">
          <h3 className="font-semibold mb-2 text-muted-foreground">Notes:</h3>
          <p className="text-sm whitespace-pre-wrap">{orderForm.notes}</p>
        </div>
      )} */}

      {/* Terms and Conditions */}
      {processedTermsAndConditions && (
        <div className="mb-8">
          <h3 className="font-semibold mb-2 text-muted-foreground">Terms & Conditions:</h3>
          <div className="prose prose-sm max-w-none break-words">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{processedTermsAndConditions}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Final Signatures */}
      <div className="mt-12 pt-6 border-t border-border">
        <div className="flex justify-between items-end text-sm">
          <div className="w-1/2 pr-4">
            <p className="font-semibold text-muted-foreground">For {yourCompany.name}:</p>
            {companySignatureUrl ? (
              <Image src={companySignatureUrl} alt="Company Signature" width={200} height={80} className="mt-4 mb-2" style={{ objectFit: 'contain', maxHeight: '80px' }} data-ai-hint="company signature"/>
            ) : (
              <div className="mt-4 mb-2 w-[200px] h-[80px] bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">Signature Area</div>
            )}
            <p className="border-t border-border pt-2">Authorized Signature</p>
          </div>
          <div className="w-1/2 pl-4 text-right">
            <p className="font-semibold text-muted-foreground">For Customer:</p>
            <div className="mt-4 mb-2 w-full h-[80px] bg-muted rounded inline-flex items-center justify-center text-muted-foreground text-xs">Customer Signature Area</div>
            <p className="border-t border-border pt-2">Client Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}