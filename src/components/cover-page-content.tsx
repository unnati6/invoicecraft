
'use client';

import * as _React from 'react';
import type { Invoice, OrderForm, Customer } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';

const COMPANY_INFO_KEYS = {
  NAME: 'branding_company_name',
};

interface CoverPageContentProps {
  document: Invoice | OrderForm;
  customer?: Customer;
}

function replacePlaceholders(
  content: string | undefined,
  doc: Invoice | OrderForm,
  customer?: Customer
): string {
  if (!content) return '';
  let processedContent = content;
  const placeholders: Record<string, () => string | undefined> = {
    '{{customerName}}': () => customer?.name,
    '{{issueDate}}': () => format(new Date(doc.issueDate), 'PPP'),
  };

  for (const placeholder in placeholders) {
    const tag = placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const value = placeholders[placeholder]();
    processedContent = processedContent.replace(new RegExp(tag, 'g'), value || '');
  }
  return processedContent;
}

export function CoverPageContent({ document: doc, customer }: CoverPageContentProps) {
  const [yourCompanyName, setYourCompanyName] = _React.useState('Your Awesome Company LLC');

  _React.useEffect(() => {
    const isClient = typeof window !== 'undefined';
    if (isClient) {
      const name = localStorage.getItem(COMPANY_INFO_KEYS.NAME);
      if (name) setYourCompanyName(name);
    }
  }, []);

  const title = "Master Service Agreement";
  const preparedFor = customer?.name || (doc as any).customerName || 'Valued Client';
  const dateString = format(new Date(doc.issueDate), 'PPP');

  return (
    <div 
        className="p-10 bg-card text-foreground font-sans text-sm"
        style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%', // For html2canvas, ensure it captures the intended page size
            minHeight: '1000px', // A4-like height for consistent PDF page
            boxSizing: 'border-box',
            textAlign: 'center',
        }}
    >
      <div style={{ marginBottom: '3rem' }}>
        <Image 
            src="/images/revynox_logo_black.png" 
            alt={`${yourCompanyName} Logo`} 
            width={200} 
            height={60} 
            style={{ objectFit: 'contain' }} 
        />
      </div>

      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'hsl(var(--primary))', marginBottom: '1.5rem' }}>
        {title}
      </h1>

      <div style={{ marginBottom: '3rem', fontSize: '1.1rem' }}>
        <p style={{ marginBottom: '0.5rem' }}>Prepared for:</p>
        <p style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>{replacePlaceholders('{{customerName}}', doc, customer)}</p>
      </div>
      
      <div style={{ marginBottom: '4rem', fontSize: '1.1rem' }}>
        <p>Date: {replacePlaceholders('{{issueDate}}', doc, customer)}</p>
      </div>

      <div style={{ marginTop: 'auto' }}> {/* Pushes client logo to bottom if space allows */}
        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>Client:</p>
        <Image 
            src="https://placehold.co/150x50.png" 
            alt="Client Logo" 
            width={150} 
            height={50} 
            style={{ objectFit: 'contain' }} 
            data-ai-hint="client logo" 
        />
      </div>
    </div>
  );
}

CoverPageContent.displayName = "CoverPageContent";

