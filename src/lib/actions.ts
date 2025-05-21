
'use server';

import { revalidatePath } from 'next/cache';
import * as Data from './data';
import type { Customer, Invoice, InvoiceItem, Quote, QuoteItem } from '@/types';
import type { CustomerFormData, InvoiceFormData, TermsFormData, QuoteFormData } from './schemas';
import { format, addDays } from 'date-fns';
import { Buffer } from 'buffer'; // Needed for Base64 encoding

// Customer Actions
export async function getAllCustomers(): Promise<Customer[]> {
  return Data.getCustomers();
}

export async function fetchCustomerById(id: string): Promise<Customer | undefined> {
  return Data.getCustomerById(id);
}

export async function saveCustomer(data: CustomerFormData, id?: string): Promise<Customer | null> {
  if (id) {
    const updated = await Data.updateCustomer(id, data);
    if (updated) {
      revalidatePath('/customers');
      revalidatePath(`/customers/${id}/edit`);
    }
    return updated;
  } else {
    const newCustomer = await Data.createCustomer(data);
    if (newCustomer) {
      revalidatePath('/customers');
    }
    return newCustomer;
  }
}

export async function removeCustomer(id: string): Promise<boolean> {
  const success = await Data.deleteCustomer(id);
  if (success) revalidatePath('/customers');
  return success;
}

// Invoice Actions
export async function getAllInvoices(): Promise<Invoice[]> {
  return Data.getInvoices();
}

export async function fetchInvoiceById(id: string): Promise<Invoice | undefined> {
  return Data.getInvoiceById(id);
}

export async function saveInvoice(data: InvoiceFormData, id?: string): Promise<Invoice | null> {
  const invoiceDataCore = {
    customerId: data.customerId,
    invoiceNumber: data.invoiceNumber,
    issueDate: data.issueDate,
    dueDate: data.dueDate,
    taxRate: data.taxRate || 0,
    termsAndConditions: data.termsAndConditions,
    status: data.status,
    items: data.items, 
  };

  if (id) { 
    const existingInvoice = await Data.getInvoiceById(id);
    if (!existingInvoice) return null;

    const finalData = {
      ...invoiceDataCore,
      termsAndConditions: data.termsAndConditions !== undefined ? data.termsAndConditions : existingInvoice.termsAndConditions,
    };

    const updated = await Data.updateInvoice(id, finalData);
    if (updated) {
      revalidatePath('/invoices'); 
      revalidatePath(`/invoices/${id}`); 
      revalidatePath(`/invoices/${id}/terms`); 
    }
    return updated;
  } else { 
    const newInvoice = await Data.createInvoice(invoiceDataCore);
    if (newInvoice) {
      revalidatePath('/invoices'); 
      revalidatePath(`/invoices/${newInvoice.id}`); 
    }
    return newInvoice;
  }
}

export async function removeInvoice(id: string): Promise<boolean> {
  const success = await Data.deleteInvoice(id);
  if (success) revalidatePath('/invoices');
  return success;
}

export async function saveInvoiceTerms(id: string, data: TermsFormData): Promise<Invoice | null> {
  const invoice = await Data.getInvoiceById(id);
  if (!invoice) return null;
  
  const updated = await Data.updateInvoice(id, { termsAndConditions: data.termsAndConditions });

  if (updated) {
    revalidatePath(`/invoices/${id}`);
    revalidatePath(`/invoices/${id}/terms`);
  }
  return updated;
}

export async function fetchNextInvoiceNumber(): Promise<string> {
    return Data.getNextInvoiceNumber();
}

// Quote Actions
export async function getAllQuotes(): Promise<Quote[]> {
  return Data.getQuotes();
}

export async function fetchQuoteById(id: string): Promise<Quote | undefined> {
  return Data.getQuoteById(id);
}

export async function saveQuote(data: QuoteFormData, id?: string): Promise<Quote | null> {
  const quoteDataCore = {
    customerId: data.customerId,
    quoteNumber: data.quoteNumber,
    issueDate: data.issueDate,
    expiryDate: data.expiryDate,
    taxRate: data.taxRate || 0,
    termsAndConditions: data.termsAndConditions,
    status: data.status,
    items: data.items,
  };

  if (id) { 
    const existingQuote = await Data.getQuoteById(id);
    if (!existingQuote) return null;

    const finalData = {
      ...quoteDataCore,
      termsAndConditions: data.termsAndConditions !== undefined ? data.termsAndConditions : existingQuote.termsAndConditions,
    };

    const updated = await Data.updateQuote(id, finalData);
    if (updated) {
      revalidatePath('/quotes'); 
      revalidatePath(`/quotes/${id}`); 
      revalidatePath(`/quotes/${id}/terms`); 
    }
    return updated;
  } else { 
    const newQuote = await Data.createQuote(quoteDataCore);
    if(newQuote) {
      revalidatePath('/quotes'); 
      revalidatePath(`/quotes/${newQuote.id}`); 
    }
    return newQuote;
  }
}

export async function removeQuote(id: string): Promise<boolean> {
  const success = await Data.deleteQuote(id);
  if (success) revalidatePath('/quotes');
  return success;
}

export async function saveQuoteTerms(id: string, data: TermsFormData): Promise<Quote | null> {
  const quote = await Data.getQuoteById(id);
  if (!quote) return null;
  
  const updated = await Data.updateQuote(id, { termsAndConditions: data.termsAndConditions });

  if (updated) {
    revalidatePath(`/quotes/${id}`);
    revalidatePath(`/quotes/${id}/terms`);
  }
  return updated;
}

export async function fetchNextQuoteNumber(): Promise<string> {
    return Data.getNextQuoteNumber();
}

export async function convertQuoteToInvoice(quoteId: string): Promise<Invoice | null> {
  const quote = await Data.getQuoteById(quoteId);
  if (!quote) {
    console.error('Quote not found for conversion:', quoteId);
    return null;
  }

  const nextInvoiceNumber = await Data.getNextInvoiceNumber();
  
  const newInvoiceData = {
    customerId: quote.customerId,
    invoiceNumber: nextInvoiceNumber,
    issueDate: new Date(),
    dueDate: addDays(new Date(), 30), 
    items: quote.items.map(item => ({ 
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
    })),
    taxRate: quote.taxRate,
    termsAndConditions: quote.termsAndConditions,
    status: 'Draft' as Invoice['status'],
  };

  const newInvoice = await Data.createInvoice(newInvoiceData);

  if (newInvoice) {
    // Update quote status to 'Accepted' (or 'Converted') after successful invoice creation
    await Data.updateQuote(quoteId, { status: 'Accepted' });
    revalidatePath('/invoices'); 
    revalidatePath(`/invoices/${newInvoice.id}`); 
    revalidatePath('/quotes');
    revalidatePath(`/quotes/${quoteId}`); 
  } else {
    console.error('Failed to create invoice from quote:', quoteId);
  }
  
  return newInvoice;
}

export async function convertMultipleQuotesToInvoices(quoteIds: string[]): Promise<{ successCount: number; errorCount: number; newInvoiceIds: string[] }> {
  let successCount = 0;
  let errorCount = 0;
  const newInvoiceIds: string[] = [];

  for (const quoteId of quoteIds) {
    const newInvoice = await convertQuoteToInvoice(quoteId);
    if (newInvoice) {
      successCount++;
      newInvoiceIds.push(newInvoice.id);
    } else {
      errorCount++;
    }
  }
  // Revalidate paths once after all conversions
  if (successCount > 0) {
    revalidatePath('/invoices');
    revalidatePath('/quotes');
  }
  return { successCount, errorCount, newInvoiceIds };
}


const escapeCsvField = (field: string | number | undefined | null): string => {
  if (field === undefined || field === null) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export async function downloadInvoiceAsExcel(invoiceId: string): Promise<{ success: boolean; message: string; fileName?: string; fileData?: string; mimeType?: string; }> {
  const invoice = await fetchInvoiceById(invoiceId);
  if (!invoice) {
    return { success: false, message: 'Invoice not found.' };
  }

  const headers = [
    'Invoice Number', 'Customer Name', 'Issue Date', 'Due Date', 'Status',
    'Item Description', 'Item Quantity', 'Item Rate', 'Item Amount',
    'Invoice Subtotal', 'Invoice Tax Rate (%)', 'Invoice Tax Amount', 'Invoice Total'
  ];
  
  let csvContent = headers.map(escapeCsvField).join(',') + '\\n';

  invoice.items.forEach(item => {
    const row = [
      invoice.invoiceNumber,
      invoice.customerName,
      format(new Date(invoice.issueDate), 'yyyy-MM-dd'),
      format(new Date(invoice.dueDate), 'yyyy-MM-dd'),
      invoice.status,
      item.description,
      item.quantity,
      item.rate,
      item.amount,
      invoice.subtotal,
      invoice.taxRate,
      invoice.taxAmount,
      invoice.total
    ];
    csvContent += row.map(escapeCsvField).join(',') + '\\n';
  });
  
  const fileData = Buffer.from(csvContent).toString('base64');
  return { 
    success: true, 
    message: "CSV file generated.",
    fileName: `Invoice_${invoice.invoiceNumber}.csv`,
    fileData: fileData,
    mimeType: 'text/csv'
  };
}

export async function downloadQuoteAsExcel(quoteId: string): Promise<{ success: boolean; message: string; fileName?: string; fileData?: string; mimeType?: string; }> {
  const quote = await fetchQuoteById(quoteId);
  if (!quote) {
    return { success: false, message: 'Quote not found.' };
  }

  const headers = [
    'Quote Number', 'Customer Name', 'Issue Date', 'Expiry Date', 'Status',
    'Item Description', 'Item Quantity', 'Item Rate', 'Item Amount',
    'Quote Subtotal', 'Quote Tax Rate (%)', 'Quote Tax Amount', 'Quote Total'
  ];
  
  let csvContent = headers.map(escapeCsvField).join(',') + '\\n';

  quote.items.forEach(item => {
    const row = [
      quote.quoteNumber,
      quote.customerName,
      format(new Date(quote.issueDate), 'yyyy-MM-dd'),
      format(new Date(quote.expiryDate), 'yyyy-MM-dd'),
      quote.status,
      item.description,
      item.quantity,
      item.rate,
      item.amount,
      quote.subtotal,
      quote.taxRate,
      quote.taxAmount,
      quote.total
    ];
    csvContent += row.map(escapeCsvField).join(',') + '\\n';
  });
  
  const fileData = Buffer.from(csvContent).toString('base64');
  return { 
    success: true, 
    message: "CSV file generated.",
    fileName: `Quote_${quote.quoteNumber}.csv`,
    fileData: fileData,
    mimeType: 'text/csv'
  };
}

