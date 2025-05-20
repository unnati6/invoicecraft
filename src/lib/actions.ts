'use server';

import { revalidatePath } from 'next/cache';
import * as Data from './data';
import type { Customer, Invoice, InvoiceItem } from '@/types';
import type { CustomerFormData, InvoiceFormData, TermsFormData } from './schemas';

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

  const updatedInvoiceData = {
    ...invoice, // Spread existing invoice data
    termsAndConditions: data.termsAndConditions, // Update T&C
  };
  
  // The updateInvoice function in data.ts needs to handle partial updates correctly.
  // Let's ensure it can update just T&C.
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

// Placeholder for PDF/Excel generation
export async function downloadInvoiceAsPDF(invoiceId: string): Promise<{ success: boolean; message: string; fileName?: string }> {
  // In a real app, this would generate a PDF and return a URL or file stream
  console.log(`Placeholder: Generate PDF for invoice ${invoiceId}`);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate generation
  return { success: true, message: "PDF generation initiated (mock).", fileName: `Invoice_${invoiceId}.pdf` };
}

export async function downloadInvoiceAsExcel(invoiceId: string): Promise<{ success: boolean; message: string; fileName?: string }> {
  // In a real app, this would generate an Excel file
  console.log(`Placeholder: Generate Excel for invoice ${invoiceId}`);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate generation
  return { success: true, message: "Excel generation initiated (mock).", fileName: `Invoice_${invoiceId}.xlsx` };
}
