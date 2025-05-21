
'use server';

import { revalidatePath } from 'next/cache';
import * as Data from './data';
import type { Customer, Invoice, InvoiceItem, OrderForm, OrderFormItem, TermsTemplate, MsaTemplate, CoverPageTemplate } from '@/types';
import type { CustomerFormData, InvoiceFormData, TermsFormData, OrderFormFormData, TermsTemplateFormData, MsaTemplateFormData, CoverPageTemplateFormData } from './schemas';
import { format, addDays } from 'date-fns';
import { Buffer } from 'buffer'; 

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
      revalidatePath('/(app)/dashboard', 'page'); 
    }
    return updated;
  } else {
    const newCustomer = await Data.createCustomer(data);
    if (newCustomer) {
      revalidatePath('/customers');
      revalidatePath('/(app)/dashboard', 'page'); 
    }
    return newCustomer;
  }
}

export async function removeCustomer(id: string): Promise<boolean> {
  const success = await Data.deleteCustomer(id);
  if (success) {
    revalidatePath('/customers');
    revalidatePath('/(app)/dashboard', 'page'); 
  }
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
    linkedMsaTemplateId: data.linkedMsaTemplateId,
    msaContent: data.msaContent,
    msaCoverPageTemplateId: data.msaCoverPageTemplateId,
    termsAndConditions: data.termsAndConditions,
    status: data.status,
    items: data.items,
    additionalCharges: data.additionalCharges,
    paymentTerms: data.paymentTerms,
    commitmentPeriod: data.commitmentPeriod,
    serviceStartDate: data.serviceStartDate,
    serviceEndDate: data.serviceEndDate,
  };

  if (id) { 
    const existingInvoice = await Data.getInvoiceById(id);
    if (!existingInvoice) return null;

    const finalData = {
      ...invoiceDataCore,
      termsAndConditions: data.termsAndConditions !== undefined ? data.termsAndConditions : existingInvoice.termsAndConditions,
      msaContent: data.msaContent !== undefined ? data.msaContent : existingInvoice.msaContent,
      msaCoverPageTemplateId: data.msaCoverPageTemplateId !== undefined ? data.msaCoverPageTemplateId : existingInvoice.msaCoverPageTemplateId,
      linkedMsaTemplateId: data.linkedMsaTemplateId !== undefined ? data.linkedMsaTemplateId : existingInvoice.linkedMsaTemplateId,
    };

    const updated = await Data.updateInvoice(id, finalData);
    if (updated) {
      revalidatePath('/invoices'); 
      revalidatePath(`/invoices/${id}`); 
      revalidatePath(`/invoices/${id}/terms`);
      revalidatePath('/(app)/dashboard', 'page'); 
    }
    return updated;
  } else { 
    const newInvoice = await Data.createInvoice(invoiceDataCore);
    if (newInvoice) {
      revalidatePath('/invoices'); 
      revalidatePath(`/invoices/${newInvoice.id}`); 
      revalidatePath('/(app)/dashboard', 'page');
    }
    return newInvoice;
  }
}

export async function removeInvoice(id: string): Promise<boolean> {
  const success = await Data.deleteInvoice(id);
  if (success) {
    revalidatePath('/invoices');
    revalidatePath('/(app)/dashboard', 'page');
  }
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

// OrderForm Actions
export async function getAllOrderForms(): Promise<OrderForm[]> {
  return Data.getOrderForms();
}

export async function fetchOrderFormById(id: string): Promise<OrderForm | undefined> {
  return Data.getOrderFormById(id);
}

export async function saveOrderForm(data: OrderFormFormData, id?: string): Promise<OrderForm | null> {
  const orderFormDataCore = {
    customerId: data.customerId,
    orderFormNumber: data.orderFormNumber,
    issueDate: data.issueDate,
    validUntilDate: data.validUntilDate,
    taxRate: data.taxRate || 0,
    linkedMsaTemplateId: data.linkedMsaTemplateId,
    msaContent: data.msaContent,
    msaCoverPageTemplateId: data.msaCoverPageTemplateId,
    termsAndConditions: data.termsAndConditions,
    status: data.status,
    items: data.items,
    additionalCharges: data.additionalCharges,
    paymentTerms: data.paymentTerms,
    commitmentPeriod: data.commitmentPeriod,
    serviceStartDate: data.serviceStartDate,
    serviceEndDate: data.serviceEndDate,
  };

  if (id) { 
    const existingOrderForm = await Data.getOrderFormById(id);
    if (!existingOrderForm) return null;

    const finalData = {
      ...orderFormDataCore,
      termsAndConditions: data.termsAndConditions !== undefined ? data.termsAndConditions : existingOrderForm.termsAndConditions,
      msaContent: data.msaContent !== undefined ? data.msaContent : existingOrderForm.msaContent,
      msaCoverPageTemplateId: data.msaCoverPageTemplateId !== undefined ? data.msaCoverPageTemplateId : existingOrderForm.msaCoverPageTemplateId,
      linkedMsaTemplateId: data.linkedMsaTemplateId !== undefined ? data.linkedMsaTemplateId : existingOrderForm.linkedMsaTemplateId,
    };

    const updated = await Data.updateOrderForm(id, finalData);
    if (updated) {
      revalidatePath('/orderforms'); 
      revalidatePath(`/orderforms/${id}`); 
      revalidatePath(`/orderforms/${id}/terms`); 
    }
    return updated;
  } else { 
    const newOrderForm = await Data.createOrderForm(orderFormDataCore);
    if(newOrderForm) {
      revalidatePath('/orderforms'); 
      revalidatePath(`/orderforms/${newOrderForm.id}`); 
    }
    return newOrderForm;
  }
}

export async function removeOrderForm(id: string): Promise<boolean> {
  const success = await Data.deleteOrderForm(id);
  if (success) revalidatePath('/orderforms');
  return success;
}

export async function saveOrderFormTerms(id: string, data: TermsFormData): Promise<OrderForm | null> {
  const orderForm = await Data.getOrderFormById(id);
  if (!orderForm) return null;
  
  const updated = await Data.updateOrderForm(id, { termsAndConditions: data.termsAndConditions });

  if (updated) {
    revalidatePath(`/orderforms/${id}`);
    revalidatePath(`/orderforms/${id}/terms`);
  }
  return updated;
}

export async function fetchNextOrderFormNumber(): Promise<string> {
    return Data.getNextOrderFormNumber();
}

export async function convertOrderFormToInvoice(orderFormId: string): Promise<Invoice | null> {
  const orderForm = await Data.getOrderFormById(orderFormId);
  if (!orderForm) {
    console.error('OrderForm not found for conversion:', orderFormId);
    return null;
  }

  const nextInvoiceNumber = await Data.getNextInvoiceNumber();
  
  const newInvoiceData: Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'customerName' | 'additionalCharges' | 'currencyCode'> & { items: Omit<InvoiceItem, 'id' | 'amount'>[], additionalCharges?: any[] } = {
    customerId: orderForm.customerId,
    invoiceNumber: nextInvoiceNumber,
    issueDate: new Date(),
    dueDate: addDays(new Date(), 30), 
    items: orderForm.items.map(item => ({ 
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
    })),
    additionalCharges: orderForm.additionalCharges ? orderForm.additionalCharges.map(ac => ({
      description: ac.description,
      valueType: ac.valueType,
      value: ac.value,
    })) : [],
    taxRate: orderForm.taxRate,
    linkedMsaTemplateId: orderForm.linkedMsaTemplateId,
    msaContent: orderForm.msaContent,
    msaCoverPageTemplateId: orderForm.msaCoverPageTemplateId,
    termsAndConditions: orderForm.termsAndConditions,
    status: 'Draft' as Invoice['status'],
    paymentTerms: orderForm.paymentTerms,
    commitmentPeriod: orderForm.commitmentPeriod,
    serviceStartDate: orderForm.serviceStartDate,
    serviceEndDate: orderForm.serviceEndDate,
  };

  const newInvoice = await Data.createInvoice(newInvoiceData);

  if (newInvoice) {
    await Data.updateOrderForm(orderFormId, { status: 'Accepted' });
    revalidatePath('/invoices'); 
    revalidatePath(`/invoices/${newInvoice.id}`); 
    revalidatePath('/orderforms');
    revalidatePath(`/orderforms/${orderFormId}`); 
    revalidatePath('/(app)/dashboard', 'page');
  } else {
    console.error('Failed to create invoice from order form:', orderFormId);
  }
  
  return newInvoice;
}

export async function convertMultipleOrderFormsToInvoices(orderFormIds: string[]): Promise<{ successCount: number; errorCount: number; newInvoiceIds: string[] }> {
  let successCount = 0;
  let errorCount = 0;
  const newInvoiceIds: string[] = [];

  for (const orderFormId of orderFormIds) {
    const newInvoice = await convertOrderFormToInvoice(orderFormId);
    if (newInvoice) {
      successCount++;
      newInvoiceIds.push(newInvoice.id);
    } else {
      errorCount++;
    }
  }
  if (successCount > 0) {
    revalidatePath('/invoices');
    revalidatePath('/orderforms');
    revalidatePath('/(app)/dashboard', 'page');
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
    'Payment Terms', 'Commitment Period', 'Service Start Date', 'Service End Date',
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
      invoice.paymentTerms,
      invoice.commitmentPeriod,
      invoice.serviceStartDate ? format(new Date(invoice.serviceStartDate), 'yyyy-MM-dd') : '',
      invoice.serviceEndDate ? format(new Date(invoice.serviceEndDate), 'yyyy-MM-dd') : '',
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

export async function downloadOrderFormAsExcel(orderFormId: string): Promise<{ success: boolean; message: string; fileName?: string; fileData?: string; mimeType?: string; }> {
  const orderForm = await fetchOrderFormById(orderFormId);
  if (!orderForm) {
    return { success: false, message: 'Order Form not found.' };
  }

  const headers = [
    'OrderForm Number', 'Customer Name', 'Issue Date', 'Valid Until Date', 'Status',
    'Payment Terms', 'Commitment Period', 'Service Start Date', 'Service End Date',
    'Item Description', 'Item Quantity', 'Item Rate', 'Item Amount',
    'OrderForm Subtotal', 'OrderForm Tax Rate (%)', 'OrderForm Tax Amount', 'OrderForm Total'
  ];
  
  let csvContent = headers.map(escapeCsvField).join(',') + '\\n';

  orderForm.items.forEach(item => {
    const row = [
      orderForm.orderFormNumber,
      orderForm.customerName,
      format(new Date(orderForm.issueDate), 'yyyy-MM-dd'),
      format(new Date(orderForm.validUntilDate), 'yyyy-MM-dd'),
      orderForm.status,
      orderForm.paymentTerms,
      orderForm.commitmentPeriod,
      orderForm.serviceStartDate ? format(new Date(orderForm.serviceStartDate), 'yyyy-MM-dd') : '',
      orderForm.serviceEndDate ? format(new Date(orderForm.serviceEndDate), 'yyyy-MM-dd') : '',
      item.description,
      item.quantity,
      item.rate,
      item.amount,
      orderForm.subtotal,
      orderForm.taxRate,
      orderForm.taxAmount,
      orderForm.total
    ];
    csvContent += row.map(escapeCsvField).join(',') + '\\n';
  });
  
  const fileData = Buffer.from(csvContent).toString('base64');
  return { 
    success: true, 
    message: "CSV file generated.",
    fileName: `OrderForm_${orderForm.orderFormNumber}.csv`,
    fileData: fileData,
    mimeType: 'text/csv'
  };
}

// TermsTemplate Actions
export async function getAllTermsTemplates(): Promise<TermsTemplate[]> {
  return Data.getTermsTemplates();
}

export async function fetchTermsTemplateById(id: string): Promise<TermsTemplate | undefined> {
  return Data.getTermsTemplateById(id);
}

export async function saveTermsTemplate(data: TermsTemplateFormData, id?: string): Promise<TermsTemplate | null> {
  if (id) {
    const updated = await Data.updateTermsTemplate(id, data);
    if (updated) {
      revalidatePath('/templates/terms');
      revalidatePath(`/templates/terms/${id}/edit`);
    }
    return updated;
  } else {
    const newTemplate = await Data.createTermsTemplate(data);
    if (newTemplate) {
      revalidatePath('/templates/terms');
    }
    return newTemplate;
  }
}

export async function removeTermsTemplate(id: string): Promise<boolean> {
  const success = await Data.deleteTermsTemplate(id);
  if (success) {
    revalidatePath('/templates/terms');
  }
  return success;
}

// MSA Template Actions
export async function getAllMsaTemplates(): Promise<MsaTemplate[]> {
  return Data.getMsaTemplates();
}

export async function fetchMsaTemplateById(id: string): Promise<MsaTemplate | undefined> {
  return Data.getMsaTemplateById(id);
}

export async function saveMsaTemplate(data: MsaTemplateFormData, id?: string): Promise<MsaTemplate | null> {
  if (id) {
    const updated = await Data.updateMsaTemplate(id, data);
    if (updated) {
      revalidatePath('/templates/msa');
      revalidatePath(`/templates/msa/${id}/edit`);
    }
    return updated;
  } else {
    const newTemplate = await Data.createMsaTemplate(data);
    if (newTemplate) {
      revalidatePath('/templates/msa');
    }
    return newTemplate;
  }
}

export async function removeMsaTemplate(id: string): Promise<boolean> {
  const success = await Data.deleteMsaTemplate(id);
  if (success) {
    revalidatePath('/templates/msa');
  }
  return success;
}

// Cover Page Template Actions
export async function getAllCoverPageTemplates(): Promise<CoverPageTemplate[]> {
  return Data.getCoverPageTemplates();
}

export async function fetchCoverPageTemplateById(id: string): Promise<CoverPageTemplate | undefined> {
  return Data.getCoverPageTemplateById(id);
}

export async function saveCoverPageTemplate(data: CoverPageTemplateFormData, id?: string): Promise<CoverPageTemplate | null> {
  if (id) {
    const updated = await Data.updateCoverPageTemplate(id, data);
    if (updated) {
      revalidatePath('/templates/coverpages');
      revalidatePath(`/templates/coverpages/${id}/edit`);
    }
    return updated;
  } else {
    const newTemplate = await Data.createCoverPageTemplate(data);
    if (newTemplate) {
      revalidatePath('/templates/coverpages');
    }
    return newTemplate;
  }
}

export async function removeCoverPageTemplate(id: string): Promise<boolean> {
  const success = await Data.deleteCoverPageTemplate(id);
  if (success) {
    revalidatePath('/templates/coverpages');
  }
  return success;
}
