// OrderFormPreviewContent.tsx
'use client';

import * as _React from 'react';
import type { OrderForm, Customer, CoverPageTemplate } from '@/types'; // BrandingSettings is imported via types.ts
import { BrandingSettingsFormData as BrandingSettings } from '@/lib/schemas'; // Import the specific type from your schema
import { format } from 'date-fns';
import Image from 'next/image';
import { getCurrencySymbol } from '@/lib/currency-utils';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { CoverPageContent } from '@/components/cover-page-content';

interface OrderFormPreviewContentProps {
  document: OrderForm;
  customer?: Customer;
  coverPageTemplate?: CoverPageTemplate;
  companyBranding: BrandingSettings; // Using the BrandingSettingsFormData type from schema
}

// Helper function (assuming it's defined elsewhere or in this file)
const replacePlaceholders = (content: string, orderForm: OrderForm, customer?: Customer): string => {
  let replacedContent = content;
  // Basic placeholder replacement examples
  replacedContent = replacedContent.replace(/{{orderForm.orderFormNumber}}/g, orderForm.orderFormNumber || 'N/A');
  replacedContent = replacedContent.replace(/{{customer.name}}/g, customer?.name || orderForm.customerName || 'N/A');
  replacedContent = replacedContent.replace(/{{orderForm.issueDate}}/g, orderForm.issueDate ? format(new Date(orderForm.issueDate), 'PPP') : 'N/A');
  // Add more placeholders as needed
  return replacedContent;
};


export function OrderFormPreviewContent({ document: orderForm, customer, coverPageTemplate, companyBranding }: OrderFormPreviewContentProps) {
  console.log("[OrderFormPreviewContent] Received document:", orderForm);
  console.log("[OrderFormPreviewContent] Received customer:", customer);
  console.log("[OrderFormPreviewContent] Received coverPageTemplate:", coverPageTemplate);
  console.log("[OrderFormPreviewContent] Received companyBranding:", companyBranding); // Log the new prop

  const customerToDisplay: Partial<Customer> & { name: string; email: string; currency: string } = {
    name: orderForm.customerName || customer?.name || 'N/A',
    email: customer?.email || 'N/A',
    company: customer?.company || undefined,
    billingAddress: customer?.billingAddress || undefined,
    shippingAddress: customer?.shippingAddress || undefined,
    currency: customer?.currency || orderForm.currencyCode || 'USD'
  };

  const currencySymbol = getCurrencySymbol(customerToDisplay.currency);
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
          {/* Corrected: Use companyBranding.logoUrl directly */}
          {companyBranding.logoUrl ? (
            <Image src={companyBranding.logoUrl} alt={`${companyBranding.name} Logo`} width={180} height={54} className="mb-3" style={{ objectFit: 'contain', maxHeight: '54px' }} data-ai-hint="company logo"/>
          ) : ( <div className="mb-3 w-[180px] h-[54px] bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">Your Logo</div> )}
          {/* Corrected: Use companyBranding.name */}
          <h2 className="text-xl font-semibold text-primary">{companyBranding.name}</h2>
          {/* Corrected: Use companyBranding.street */}
          <p className="text-xs text-muted-foreground">{companyBranding.street}</p>
          {/* Corrected: Use city, state, zip directly */}
          {(companyBranding.city || companyBranding.state || companyBranding.zip) && (
            <p className="text-xs text-muted-foreground">
              {companyBranding.city}{companyBranding.city && companyBranding.state ? ', ' : ''}
              {companyBranding.state}{companyBranding.state && companyBranding.zip ? ' ' : ''}
              {companyBranding.zip}
            </p>
          )}
          {/* Corrected: Use companyBranding.country */}
          {companyBranding.country && <p className="text-xs text-muted-foreground">{companyBranding.country}</p>}
          {/* Corrected: Use companyBranding.email */}
          <p className="text-xs text-muted-foreground">Email: {companyBranding.email}</p>
          {/* Corrected: Use companyBranding.phone */}
          <p className="text-xs text-muted-foreground">Phone: {companyBranding.phone}</p>
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
                  {/* Added nullish coalescing operator (?? 0) to handle undefined/null rates */}
                  <td className="p-2 text-right border border-border">{(item.rate ?? 0).toFixed(2)}</td>
                  <td className="p-2 text-right border border-border">{(item.amount ?? 0).toFixed(2)}</td>
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
            <p className="font-semibold text-muted-foreground">For {companyBranding.name}:</p>
            {/* Corrected: Use companyBranding.signatureUrl directly */}
            {companyBranding.signatureUrl ? (
              <Image src={companyBranding.signatureUrl} alt="Company Signature" width={200} height={80} className="mt-4 mb-2" style={{ objectFit: 'contain', maxHeight: '80px' }} data-ai-hint="company signature"/>
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