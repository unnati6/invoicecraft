
'use server';

import { revalidatePath } from 'next/cache';
import {
  getCustomers as getCustomersData,
  getCustomerById as getCustomerByIdData,
  createCustomer as createCustomerData,
  updateCustomer as updateCustomerData,
  deleteCustomer as deleteCustomerData,
  getInvoices as getInvoicesData,
  getInvoiceById as getInvoiceByIdData,
  createInvoice as createInvoiceDataLayer,
  updateInvoice as updateInvoiceDataLayer,
  deleteInvoice as deleteInvoiceData,
  getNextInvoiceNumber as getNextInvoiceNumberData,
  getOrderForms as getOrderFormsData,
  getOrderFormByIdData as getOrderFormByIdData,
  createOrderFormDataLayer as createOrderFormDataLayer,
  updateOrderFormDataLayer as updateOrderFormDataLayer,
  deleteOrderForm as deleteOrderFormData,
  getNextOrderFormNumber as getNextOrderFormNumberData,
  getTermsTemplates as getTermsTemplatesData,
  getTermsTemplateById as getTermsTemplateByIdData,
  createTermsTemplate as createTermsTemplateDataLayer,
  updateTermsTemplate as updateTermsTemplateDataLayer,
  deleteTermsTemplate as deleteTermsTemplateData,
  getMsaTemplates as getMsaTemplatesData,
  getMsaTemplateById as getMsaTemplateByIdData,
  createMsaTemplate as createMsaTemplateDataLayer,
  updateMsaTemplate as updateMsaTemplateDataLayer,
  deleteMsaTemplate as deleteMsaTemplateData,
  getCoverPageTemplates as getCoverPageTemplatesData,
  getCoverPageTemplateById as getCoverPageTemplateByIdData,
  createCoverPageTemplate as createCoverPageTemplateDataLayer,
  updateCoverPageTemplate as updateCoverPageTemplateDataLayer,
  deleteCoverPageTemplate as deleteCoverPageTemplateData,
  getRepositoryItems as getRepositoryItemsData,
  getRepositoryItemById as getRepositoryItemByIdData,
  createRepositoryItem as createRepositoryItemDataLayer,
  updateRepositoryItem as updateRepositoryItemDataLayer,
  deleteRepositoryItem as deleteRepositoryItemData,
  upsertRepositoryItemFromOrderForm as upsertRepositoryItemFromOrderFormData,
  getPurchaseOrders as getPurchaseOrdersData,
  getPurchaseOrderById as getPurchaseOrderByIdData,
  createPurchaseOrderDataLayer,
  updatePurchaseOrderDataLayer, 
  deletePurchaseOrderData as deletePurchaseOrderDataLayer,
  deletePurchaseOrdersByOrderFormIdData,
  getNextPoNumberData,
   getUsers as getUsersData,
  updateUser as updateUserData,
} from './data';
import type { Customer, Invoice, InvoiceItem, OrderForm, OrderFormItem, TermsTemplate, MsaTemplate, CoverPageTemplate, RepositoryItem, PurchaseOrder, User } from '@/types';
import type { CustomerFormData, InvoiceFormData, TermsFormData, OrderFormFormData, TermsTemplateFormData, MsaTemplateFormData, CoverPageTemplateFormData, BrandingSettingsFormData, RepositoryItemFormData } from './schemas';
import { format, addDays } from 'date-fns';
import { Buffer } from 'buffer';

// Customer Actions
export async function getAllCustomers(): Promise<Customer[]> {
  return getCustomersData();
}

export async function fetchCustomerById(id: string): Promise<Customer | undefined> {
  return getCustomerByIdData(id);
}

export async function saveCustomer(data: CustomerFormData, id?: string): Promise<Customer | null> {
  if (id) {
    const updatedCustomer = await updateCustomerData(id, data);
    if (updatedCustomer) {
      revalidatePath('/customers');
      revalidatePath(`/customers/${id}/edit`);
      revalidatePath('/(app)/dashboard', 'page');
    }
    return updatedCustomer;
  } else {
    const newCustomer = await createCustomerData(data);
    if (newCustomer) {
      revalidatePath('/customers');
      revalidatePath('/(app)/dashboard', 'page');
    }
    return newCustomer;
  }
}

export async function removeCustomer(id: string): Promise<boolean> {
  const success = await deleteCustomerData(id);
  if (success) {
    revalidatePath('/customers');
    revalidatePath('/(app)/dashboard', 'page');
  }
  return success;
}

// Invoice Actions
export async function getAllInvoices(): Promise<Invoice[]> {
  return getInvoicesData();
}

export async function fetchInvoiceById(id: string): Promise<Invoice | undefined> {
  return getInvoiceByIdData(id);
}

export async function saveInvoice(data: InvoiceFormData, id?: string): Promise<Invoice | null> {
  const customer = await fetchCustomerById(data.customerId);
  const currencyCode = customer?.currency || 'USD';

  const invoiceDataCore = {
    ...data,
    customerName: customer?.name || 'Unknown Customer',
    currencyCode: currencyCode,
    linkedMsaTemplateId: data.linkedMsaTemplateId === "_no_msa_template_" ? undefined : data.linkedMsaTemplateId,
    msaContent: data.msaContent,
    msaCoverPageTemplateId: data.msaCoverPageTemplateId,
    customPaymentTerms: data.customPaymentTerms,
    customCommitmentPeriod: data.customCommitmentPeriod,
    paymentFrequency: data.paymentFrequency,
    customPaymentFrequency: data.customPaymentFrequency,
  };
  
  console.log("[Action: saveInvoice] Data before saving:", invoiceDataCore);

  let savedInvoice: Invoice | null = null;
  if (id) {
    const existingInvoice = await getInvoiceByIdData(id);
    if (!existingInvoice) return null;

    const finalData = {
      ...invoiceDataCore,
      termsAndConditions: data.termsAndConditions !== undefined ? data.termsAndConditions : existingInvoice.termsAndConditions,
    };
    savedInvoice = await updateInvoiceDataLayer(id, finalData);
  } else {
    savedInvoice = await createInvoiceDataLayer(invoiceDataCore);
  }

  if (savedInvoice && customer) {
    for (const item of savedInvoice.items) {
        await upsertRepositoryItemFromOrderFormData(
            {
                description: item.description,
                rate: item.rate,
                // procurementPrice & vendorName are not on InvoiceItem, pass undefined
            },
            savedInvoice.customerId,
            customer.name,
            savedInvoice.currencyCode || 'USD'
        );
    }
    revalidatePath('/invoices');
    revalidatePath(`/invoices/${savedInvoice.id}`);
    revalidatePath(`/invoices/${savedInvoice.id}/terms`);
    revalidatePath('/(app)/dashboard', 'page');
    revalidatePath(`/customers/${savedInvoice.customerId}/edit`);
    revalidatePath('/item-repository');
  }
  return savedInvoice;
}

export async function removeInvoice(id: string): Promise<boolean> {
  const success = await deleteInvoiceData(id);
  if (success) {
    revalidatePath('/invoices');
    revalidatePath('/(app)/dashboard', 'page');
  }
  return success;
}

export async function saveInvoiceTerms(id: string, data: TermsFormData): Promise<Invoice | null> {
  const invoice = await getInvoiceByIdData(id);
  if (!invoice) return null;
  const updated = await updateInvoiceDataLayer(id, { termsAndConditions: data.termsAndConditions });
  if (updated) {
    revalidatePath(`/invoices/${id}`);
    revalidatePath(`/invoices/${id}/terms`);
  }
  return updated;
}

export async function fetchNextInvoiceNumber(): Promise<string> {
    return getNextInvoiceNumberData();
}

export async function markInvoiceAsPaid(invoiceId: string): Promise<Invoice | null> {
  const invoice = await getInvoiceByIdData(invoiceId);
  if (!invoice) return null;
  const updatedInvoice = await updateInvoiceDataLayer(invoiceId, { status: 'Paid' });
  if (updatedInvoice) {
    revalidatePath('/invoices');
    revalidatePath(`/invoices/${invoiceId}`);
    if (invoice.customerId) {
      revalidatePath(`/customers/${invoice.customerId}/edit`);
    }
    revalidatePath('/(app)/dashboard', 'page');
  }
  return updatedInvoice;
}

// OrderForm Actions
export async function getAllOrderForms(): Promise<OrderForm[]> {
  return getOrderFormsData();
}

export async function fetchOrderFormById(id: string): Promise<OrderForm | undefined> {
  return getOrderFormByIdData(id);
}

export async function saveOrderForm(data: OrderFormFormData, id?: string): Promise<OrderForm | null> {
  const customer = await fetchCustomerById(data.customerId);
  const currencyCode = customer?.currency || 'USD';

  const orderFormDataCore = {
    ...data,
    customerName: customer?.name || 'Unknown Customer',
    currencyCode: currencyCode,
    linkedMsaTemplateId: data.linkedMsaTemplateId === "_no_msa_template_" ? undefined : data.linkedMsaTemplateId,
    msaContent: data.msaContent,
    msaCoverPageTemplateId: data.msaCoverPageTemplateId,
    customPaymentTerms: data.customPaymentTerms,
    customCommitmentPeriod: data.customCommitmentPeriod,
    paymentFrequency: data.paymentFrequency,
    customPaymentFrequency: data.customPaymentFrequency,
  };

  console.log("[Action: saveOrderForm] Data before saving:", orderFormDataCore);

  let savedOrderForm: OrderForm | null = null;
  if (id) {
    const existingOrderForm = await getOrderFormByIdData(id);
    if (!existingOrderForm) return null;
    const finalData = {
      ...orderFormDataCore,
      termsAndConditions: data.termsAndConditions !== undefined ? data.termsAndConditions : existingOrderForm.termsAndConditions,
    };
    savedOrderForm = await updateOrderFormDataLayer(id, finalData);
  } else {
    savedOrderForm = await createOrderFormDataLayer(orderFormDataCore);
  }
  
  if (savedOrderForm && customer) {
    await deletePurchaseOrdersByOrderFormIdData(savedOrderForm.id);
    for (const item of savedOrderForm.items) {
          await upsertRepositoryItemFromOrderFormData(
            {
                description: item.description,
                rate: item.rate,
                procurementPrice: item.procurementPrice,
                vendorName: item.vendorName,
            },
            savedOrderForm.customerId,
            customer.name,
            savedOrderForm.currencyCode || 'USD'
        );

        // // PO Generation Logic
        // const itemsByVendor = savedOrderForm.items.reduce((acc, currentItem) => {
        //   if (currentItem.vendorName && currentItem.procurementPrice !== undefined && currentItem.procurementPrice >= 0) {
        //     if (!acc[currentItem.vendorName]) {
        //       acc[currentItem.vendorName] = [];
        //     }
        //     acc[currentItem.vendorName].push(currentItem);
        //   }
        //   return acc;
        // }, {} as Record<string, OrderFormItem[]>);

        // for (const vendorName in itemsByVendor) {
        //   const poItems = itemsByVendor[vendorName].map(ofi => ({
        //     description: ofi.description,
        //     quantity: ofi.quantity,
        //     procurementPrice: ofi.procurementPrice!, // Non-null assertion as it's checked
        //   }));
        //   if (poItems.length > 0) {
        //     const poNumber = await getNextPoNumberData();
        //     await createPurchaseOrderDataLayer({
        //       poNumber,
        //       vendorName,
        //       orderFormId: savedOrderForm.id,
        //       orderFormNumber: savedOrderForm.orderFormNumber,
        //       issueDate: new Date(),
        //       items: poItems,
        //       status: 'Draft'
        //     });
        //   }
        // }
    }
    revalidatePath('/orderforms');
    revalidatePath(`/orderforms/${savedOrderForm.id}`);
    revalidatePath(`/orderforms/${savedOrderForm.id}`);
    revalidatePath('/item-repository');
    revalidatePath('/purchase-orders');
  }
  return savedOrderForm;
}


export async function removeOrderForm(id: string): Promise<boolean> {
  const success = await deleteOrderFormData(id);
  if (success) {
    await deletePurchaseOrdersByOrderFormIdData(id);
    revalidatePath('/orderforms');
    revalidatePath('/purchase-orders');
  }
  return success;
}

export async function saveOrderFormTerms(id: string, data: TermsFormData): Promise<OrderForm | null> {
  const orderForm = await getOrderFormByIdData(id);
  if (!orderForm) return null;
  const updated = await updateOrderFormDataLayer(id, { termsAndConditions: data.termsAndConditions });
  if (updated) {
    revalidatePath(`/orderforms/${id}`);
    revalidatePath(`/orderforms/${id}/terms`);
  }
  return updated;
}

export async function fetchNextOrderFormNumber(): Promise<string> {
    return getNextOrderFormNumberData();
}

export async function convertOrderFormToInvoice(orderFormId: string): Promise<Invoice | null> {
  const orderForm = await getOrderFormByIdData(orderFormId);
  if (!orderForm) {
    console.error('OrderForm not found for conversion:', orderFormId);
    return null;
  }

  const nextInvoiceNumber = await getNextInvoiceNumberData();

  const newInvoiceData: Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'customerName' | 'additionalCharges' | 'currencyCode' | 'discountAmount'> & { items: Omit<InvoiceItem, 'id' | 'amount'>[], additionalCharges?: any[] } = {
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
    discountEnabled: orderForm.discountEnabled,
    discountDescription: orderForm.discountDescription,
    discountType: orderForm.discountType,
    discountValue: orderForm.discountValue,
    linkedMsaTemplateId: orderForm.linkedMsaTemplateId,
    msaContent: orderForm.msaContent,
    msaCoverPageTemplateId: orderForm.msaCoverPageTemplateId,
    termsAndConditions: orderForm.termsAndConditions,
    status: 'Draft' as Invoice['status'],
    paymentTerms: orderForm.paymentTerms,
    customPaymentTerms: orderForm.customPaymentTerms,
    commitmentPeriod: orderForm.commitmentPeriod,
    customCommitmentPeriod: orderForm.customCommitmentPeriod,
    paymentFrequency: orderForm.paymentFrequency,
    customPaymentFrequency: orderForm.customPaymentFrequency,
    serviceStartDate: orderForm.serviceStartDate,
    serviceEndDate: orderForm.serviceEndDate,
  };

  const newInvoice = await createInvoiceDataLayer(newInvoiceData);

  if (newInvoice) {
    await updateOrderFormDataLayer(orderFormId, { status: 'Accepted' });
    revalidatePath('/invoices');
    revalidatePath(`/invoices/${newInvoice.id}`);
    revalidatePath('/orderforms');
    revalidatePath(`/orderforms/${orderFormId}`);
    revalidatePath('/(app)/dashboard', 'page');
    if (newInvoice.customerId) {
      revalidatePath(`/customers/${newInvoice.customerId}/edit`);
    }
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
    'Payment Terms', 'Custom Payment Terms', 'Commitment Period', 'Custom Commitment Period',
    'Payment Frequency', 'Custom Payment Frequency', 'Service Start Date', 'Service End Date',
    'Item Description', 'Item Quantity', 'Item Rate', 'Item Amount',
    'Discount Enabled', 'Discount Description', 'Discount Type', 'Discount Value', 'Calculated Discount Amount',
    'Additional Charge Description', 'Additional Charge Type', 'Additional Charge Value', 'Additional Charge Calculated Amount',
    'Invoice Subtotal (Items)', 'Invoice Tax Rate (%)', 'Invoice Tax Amount', 'Invoice Total'
  ];
  let csvContent = headers.map(escapeCsvField).join(',') + '\n';
  const baseInvoiceRow = [
      invoice.invoiceNumber, invoice.customerName, format(new Date(invoice.issueDate), 'yyyy-MM-dd'),
      format(new Date(invoice.dueDate), 'yyyy-MM-dd'), invoice.status,
      invoice.paymentTerms, invoice.customPaymentTerms, invoice.commitmentPeriod, invoice.customCommitmentPeriod,
      invoice.paymentFrequency, invoice.customPaymentFrequency, invoice.serviceStartDate ? format(new Date(invoice.serviceStartDate), 'yyyy-MM-dd') : '',
      invoice.serviceEndDate ? format(new Date(invoice.serviceEndDate), 'yyyy-MM-dd') : '',
  ];
  invoice.items.forEach(item => {
    const itemRow = [
      ...baseInvoiceRow, item.description, item.quantity, item.rate, item.amount,
      invoice.discountEnabled, invoice.discountDescription, invoice.discountType, invoice.discountValue, invoice.discountAmount,
      '', '', '', '', invoice.subtotal, invoice.taxRate, invoice.taxAmount, invoice.total
    ];
    csvContent += itemRow.map(escapeCsvField).join(',') + '\n';
  });
  if (invoice.additionalCharges && invoice.additionalCharges.length > 0) {
    invoice.additionalCharges.forEach(charge => {
      const chargeRow = [
        ...baseInvoiceRow, '', '', '', '',
        invoice.discountEnabled, invoice.discountDescription, invoice.discountType, invoice.discountValue, invoice.discountAmount,
        charge.description, charge.valueType, charge.value, charge.calculatedAmount,
        invoice.subtotal, invoice.taxRate, invoice.taxAmount, invoice.total
      ];
      csvContent += chargeRow.map(escapeCsvField).join(',') + '\n';
    });
  } else if (invoice.items.length === 0) { 
      const emptyRow = [
        ...baseInvoiceRow, '', '', '', '',
        invoice.discountEnabled, invoice.discountDescription, invoice.discountType, invoice.discountValue, invoice.discountAmount,
        '', '', '', '', invoice.subtotal, invoice.taxRate, invoice.taxAmount, invoice.total
      ];
    csvContent += emptyRow.map(escapeCsvField).join(',') + '\n';
  }
  const fileData = Buffer.from(csvContent).toString('base64');
  return {
    success: true, message: "CSV file generated.", fileName: `Invoice_${invoice.invoiceNumber}.csv`,
    fileData: fileData, mimeType: 'text/csv'
  };
}

export async function downloadOrderFormAsExcel(orderFormId: string): Promise<{ success: boolean; message: string; fileName?: string; fileData?: string; mimeType?: string; }> {
  const orderForm = await fetchOrderFormById(orderFormId);
  if (!orderForm) {
    return { success: false, message: 'Order Form not found.' };
  }
  const headers = [
    'OrderForm Number', 'Customer Name', 'Issue Date', 'Valid Until Date', 'Status',
    'Payment Terms', 'Custom Payment Terms', 'Commitment Period', 'Custom Commitment Period',
    'Payment Frequency', 'Custom Payment Frequency', 'Service Start Date', 'Service End Date',
    'Item Description', 'Item Quantity', 'Item Rate', 'Item Procurement Price', 'Item Vendor Name', 'Item Amount',
    'Discount Enabled', 'Discount Description', 'Discount Type', 'Discount Value', 'Calculated Discount Amount',
    'Additional Charge Description', 'Additional Charge Type', 'Additional Charge Value', 'Additional Charge Calculated Amount',
    'OrderForm Subtotal (Items)', 'OrderForm Tax Rate (%)', 'OrderForm Tax Amount', 'OrderForm Total'
  ];
  let csvContent = headers.map(escapeCsvField).join(',') + '\n';
  const baseOrderFormRow = [
      orderForm.orderFormNumber, orderForm.customerName, format(new Date(orderForm.issueDate), 'yyyy-MM-dd'),
      format(new Date(orderForm.validUntilDate), 'yyyy-MM-dd'), orderForm.status,
      orderForm.paymentTerms, orderForm.customPaymentTerms, orderForm.commitmentPeriod, orderForm.customCommitmentPeriod,
      orderForm.paymentFrequency, orderForm.customPaymentFrequency, orderForm.serviceStartDate ? format(new Date(orderForm.serviceStartDate), 'yyyy-MM-dd') : '',
      orderForm.serviceEndDate ? format(new Date(orderForm.serviceEndDate), 'yyyy-MM-dd') : '',
  ];
  orderForm.items.forEach(item => {
    const itemRow = [
      ...baseOrderFormRow, item.description, item.quantity, item.rate, item.procurementPrice, item.vendorName, item.amount,
      orderForm.discountEnabled, orderForm.discountDescription, orderForm.discountType, orderForm.discountValue, orderForm.discountAmount,
      '', '', '', '', orderForm.subtotal, orderForm.taxRate, orderForm.taxAmount, orderForm.total
    ];
    csvContent += itemRow.map(escapeCsvField).join(',') + '\n';
  });
  if (orderForm.additionalCharges && orderForm.additionalCharges.length > 0) {
    orderForm.additionalCharges.forEach(charge => {
      const chargeRow = [
        ...baseOrderFormRow, '', '', '', '', '', '',
        orderForm.discountEnabled, orderForm.discountDescription, orderForm.discountType, orderForm.discountValue, orderForm.discountAmount,
        charge.description, charge.valueType, charge.value, charge.calculatedAmount,
        orderForm.subtotal, orderForm.taxRate, orderForm.taxAmount, orderForm.total
      ];
      csvContent += chargeRow.map(escapeCsvField).join(',') + '\n';
    });
  } else if (orderForm.items.length === 0) { 
      const emptyRow = [
        ...baseOrderFormRow, '', '', '', '', '', '',
        orderForm.discountEnabled, orderForm.discountDescription, orderForm.discountType, orderForm.discountValue, orderForm.discountAmount,
        '', '', '', '', orderForm.subtotal, orderForm.taxRate, orderForm.taxAmount, orderForm.total
      ];
    csvContent += emptyRow.map(escapeCsvField).join(',') + '\n';
  }
  const fileData = Buffer.from(csvContent).toString('base64');
  return {
    success: true, message: "CSV file generated.", fileName: `OrderForm_${orderForm.orderFormNumber}.csv`,
    fileData: fileData, mimeType: 'text/csv'
  };
}

// TermsTemplate Actions
export async function getAllTermsTemplates(): Promise<TermsTemplate[]> {
  return getTermsTemplatesData();
}

export async function fetchTermsTemplateById(id: string): Promise<TermsTemplate | undefined> {
  return getTermsTemplateByIdData(id);
}

export async function saveTermsTemplate(data: TermsTemplateFormData, id?: string): Promise<TermsTemplate | null> {
  if (id) {
    const updated = await updateTermsTemplateDataLayer(id, data);
    if (updated) {
      revalidatePath('/templates/terms');
      revalidatePath(`/templates/terms/${id}/edit`);
    }
    return updated;
  } else {
    const newTemplate = await createTermsTemplateDataLayer(data);
    if (newTemplate) {
      revalidatePath('/templates/terms');
    }
    return newTemplate;
  }
}

export async function removeTermsTemplate(id: string): Promise<boolean> {
  const success = await deleteTermsTemplateData(id);
  if (success) {
    revalidatePath('/templates/terms');
  }
  return success;
}

// MSA Template Actions
export async function getAllMsaTemplates(): Promise<MsaTemplate[]> {
  return getMsaTemplatesData();
}

export async function fetchMsaTemplateById(id: string): Promise<MsaTemplate | undefined> {
  return getMsaTemplateByIdData(id);
}

export async function saveMsaTemplate(data: MsaTemplateFormData, id?: string): Promise<MsaTemplate | null> {
  const payload: Partial<Omit<MsaTemplate, 'id' | 'createdAt'>> = {
    name: data.name,
    content: data.content,
    coverPageTemplateId: data.coverPageTemplateId === "_no_cover_page_" ? undefined : data.coverPageTemplateId,
  };
  if (id) {
    const updated = await updateMsaTemplateDataLayer(id, payload);
    if (updated) {
      revalidatePath('/templates/msa');
      revalidatePath(`/templates/msa/${id}/edit`);
    }
    return updated;
  } else {
    const newTemplate = await createMsaTemplateDataLayer(payload);
    if (newTemplate) {
      revalidatePath('/templates/msa');
    }
    return newTemplate;
  }
}

export async function removeMsaTemplate(id: string): Promise<boolean> {
  const success = await deleteMsaTemplateData(id);
  if (success) {
    revalidatePath('/templates/msa');
  }
  return success;
}

export async function linkCoverPageToMsa(msaTemplateId: string, coverPageTemplateId: string | null): Promise<MsaTemplate | null> {
  const msaTemplate = await getMsaTemplateByIdData(msaTemplateId);
  if (!msaTemplate) return null;
  const updatedMsaTemplate = await updateMsaTemplateDataLayer(msaTemplateId, { coverPageTemplateId: coverPageTemplateId === null ? undefined : coverPageTemplateId });
  if (updatedMsaTemplate) {
    revalidatePath('/templates/msa');
  }
  return updatedMsaTemplate;
}

// Cover Page Template Actions
export async function getAllCoverPageTemplates(): Promise<CoverPageTemplate[]> {
  return getCoverPageTemplatesData();
}

export async function fetchCoverPageTemplateById(id: string): Promise<CoverPageTemplate | undefined> {
  return getCoverPageTemplateByIdData(id);
}

export async function saveCoverPageTemplate(data: CoverPageTemplateFormData, id?: string): Promise<CoverPageTemplate | null> {
  if (id) {
    const updated = await updateCoverPageTemplateDataLayer(id, data);
    if (updated) {
      revalidatePath('/templates/coverpages');
      revalidatePath(`/templates/coverpages/${id}/edit`);
    }
    return updated;
  } else {
    const newTemplate = await createCoverPageTemplateDataLayer(data);
    if (newTemplate) {
      revalidatePath('/templates/coverpages');
    }
    return newTemplate;
  }
}

export async function removeCoverPageTemplate(id: string): Promise<boolean> {
  const success = await deleteCoverPageTemplateData(id);
  if (success) {
    revalidatePath('/templates/coverpages');
  }
  return success;
}

// Branding/Settings Actions
export async function saveBrandingSettings(data: BrandingSettingsFormData): Promise<boolean> {
  console.log("Branding settings to save (server action):", data);
  revalidatePath('/(app)/branding', 'page');
  return true;
}

// Repository Item Actions
export async function getAllRepositoryItems(): Promise<RepositoryItem[]> {
  return getRepositoryItemsData();
}

export async function fetchRepositoryItemById(id: string): Promise<RepositoryItem | undefined> {
  return getRepositoryItemByIdData(id);
}

export async function saveRepositoryItem(data: RepositoryItemFormData, id?: string): Promise<RepositoryItem | null> {
  if (id) {
    const updated = await updateRepositoryItemDataLayer(id, data);
    
    if (updated) {
      revalidatePath('/item-repository');
      revalidatePath(`/item-repository/${id}/edit`);
    }
    return updated;
  } else {
    const newItem = await createRepositoryItemDataLayer(data);
    if (newItem) revalidatePath('/item-repository');
    return newItem;
  }
}

export async function removeRepositoryItem(id: string): Promise<boolean> {
  const success = await deleteRepositoryItemData(id);
  if (success) {
    revalidatePath('/item-repository');
  }
  return success;
}

// Purchase Order Actions

// Purchase Order Actions
export async function getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
  return getPurchaseOrdersData();
}

export async function fetchPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined> {
  return getPurchaseOrderByIdData(id); 
}

export async function fetchNextPoNumberData(): Promise<string> {
  return getNextPoNumberData();
}

export async function savePurchaseOrder(data: PurchaseOrderFormData, id?: string): Promise<PurchaseOrder | null> {
  let savedPO: PurchaseOrder | null = null;

  const poDataForLayer = {
    poNumber: data.poNumber,
    vendorName: data.vendorName,
    issueDate: data.issueDate,
    items: data.items.map(item => ({ 
      description: item.description,
      quantity: item.quantity,
      procurementPrice: item.procurementPrice,
    })),
    status: data.status,
    currencyCode: data.currencyCode || 'USD',
    orderFormId: data.orderFormId, 
    orderFormNumber: data.orderFormNumber, 
  };

  if (id) {
    savedPO = await updatePurchaseOrderDataLayer(id, poDataForLayer);
  } else {
    const nextPoNumber = await getNextPoNumberData();
    savedPO = await createPurchaseOrderDataLayer({
      ...poDataForLayer,
      poNumber: nextPoNumber, 
    });
  }

  if (savedPO) {
    revalidatePath('/purchase-orders');
    if (id) {
      revalidatePath(`/purchase-orders/${id}`);
    } else if (savedPO.id) {
       revalidatePath(`/purchase-orders/${savedPO.id}`);
    }
  }
  return savedPO;
}


export async function removePurchaseOrder(id: string): Promise<boolean> {
  const success = await deletePurchaseOrderDataLayer(id);
  if (success) {
    revalidatePath('/purchase-orders');
  }
  return success;
}


// User Actions (for Admin)
export async function getAllUsers(): Promise<User[]> {
  return getUsersData();
}

export async function toggleUserActiveStatus(userId: string, isActive: boolean): Promise<User | null> {
  const updatedUser = await updateUserData(userId, { isActive });
  if (updatedUser) {
    revalidatePath('/admin/dashboard');
  }
  return updatedUser;
}

// ---
// The following are no longer used directly by pages but kept for potential internal use or future refactoring:
// export async function createNewCustomer(data: CustomerFormData): Promise<Customer | null> {
//   console.log("[Action: createNewCustomer] Received Form Data:", data);
//   const newCustomer = await createCustomerData(data);
//   if (newCustomer) {
//     revalidatePath('/customers');
//     revalidatePath('/(app)/dashboard', 'page');
//   }
//   return newCustomer;
// }

// export async function updateExistingCustomer(id: string, data: CustomerFormData): Promise<Customer | null> {
//   console.log("[Action: updateExistingCustomer] Received Form Data for ID:", id, data);
//   const updatedCustomer = await updateCustomerData(id, data);
//   if (updatedCustomer) {
//     revalidatePath('/customers');
//     revalidatePath(`/customers/${id}/edit`);
//     revalidatePath('/(app)/dashboard', 'page');
//   }
//   return updatedCustomer;
// }
