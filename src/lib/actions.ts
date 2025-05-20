
'use server';

import { revalidatePath } from 'next/cache';
import * as Data from './data';
import type { Customer, Invoice, InvoiceItem } from '@/types';
import type { CustomerFormData, InvoiceFormData, TermsFormData } from './schemas';
import { format } from 'date-fns';
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
    if (updated) revalidatePath('/customers');
    if (updated) revalidatePath(`/customers/${id}/edit`);
    return updated;
  } else {
    const newCustomer = await Data.createCustomer(data);
    revalidatePath('/customers');
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
    items: data.items, // items here are Omit<InvoiceItem, 'id' | 'amount'>[]
  };

  if (id) {
    const existingInvoice = await Data.getInvoiceById(id);
    if (!existingInvoice) return null;

    // Merge existing T&C if not provided in form (e.g. if form doesn't have T&C field but T&C page does)
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
    revalidatePath('/invoices');
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

// Helper to escape CSV fields
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
  
  let csvContent = headers.map(escapeCsvField).join(',') + '\n';

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
    csvContent += row.map(escapeCsvField).join(',') + '\n';
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
