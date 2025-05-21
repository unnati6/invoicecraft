
'use client';

import * as _React from 'react';
import type { Invoice, OrderForm, Customer } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';

const LOGO_STORAGE_KEY = 'branding_company_logo_data_url'; // Added
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
    '{{customerName}}': () => customer?.name || (doc as any).customerName, // Added fallback for customerName
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
  const [companyLogoUrl, setCompanyLogoUrl] = _React.useState<string | null>('/images/revynox_logo_black.png'); // Default to Revynox logo

  _React.useEffect(() => {
    const isClient = typeof window !== 'undefined';
    if (isClient) {
      const name = localStorage.getItem(COMPANY_INFO_KEYS.NAME);
      if (name) setYourCompanyName(name);

      const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY); // Load logo from localStorage
      if (storedLogo) {
        setCompanyLogoUrl(storedLogo);
      } else {
        setCompanyLogoUrl('/images/revynox_logo_black.png'); // Fallback if nothing in localStorage
      }
    }
  }, []);

  const title = "Master Service Agreement"; // Hardcoded title
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
            height: '100%', 
            minHeight: '1000px', 
            boxSizing: 'border-box',
            textAlign: 'center',
        }}
    >
      <div style={{ marginBottom: '3rem' }}>
        {companyLogoUrl && ( // Conditional rendering for logo
            <Image 
                src={companyLogoUrl} 
                alt={`${yourCompanyName} Logo`} 
                width={200} 
                height={60} 
                style={{ objectFit: 'contain', maxHeight: '60px' }}
            />
        )}
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

      <div style={{ marginTop: 'auto' }}> 
        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>Client:</p>
        <Image 
            src="https://placehold.co/150x50.png" 
            alt="Client Logo Placeholder" 
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
