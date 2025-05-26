
'use server';

import { revalidatePath } from 'next/cache';
import { 
  getCustomers, 
  getCustomerById, 
  // createCustomer is now in customer-actions.ts
  // updateCustomer is now in customer-actions.ts
  deleteCustomer,
  getInvoices,
  getInvoiceById,
  createInvoice as createInvoiceData,
  updateInvoice as updateInvoiceData,
  deleteInvoice,
  getNextInvoiceNumber as getNextInvoiceNumberData,
  getOrderForms,
  getOrderFormById,
  createOrderForm as createOrderFormData,
  updateOrderForm as updateOrderFormData,
  deleteOrderForm,
  getNextOrderFormNumber as getNextOrderFormNumberData,
  getTermsTemplates,
  getTermsTemplateById,
  createTermsTemplate as createTermsTemplateData,
  updateTermsTemplate as updateTermsTemplateData,
  deleteTermsTemplate,
  getMsaTemplates,
  getMsaTemplateById,
  createMsaTemplate as createMsaTemplateData,
  updateMsaTemplate as updateMsaTemplateData,
  deleteMsaTemplate,
  getCoverPageTemplates,
  getCoverPageTemplateById,
  createCoverPageTemplate as createCoverPageTemplateData,
  updateCoverPageTemplate as updateCoverPageTemplateData,
  deleteCoverPageTemplate,
  getRepositoryItems,
  getRepositoryItemById as getRepositoryItemByIdData,
  createRepositoryItem as createRepositoryItemData,
  updateRepositoryItem as updateRepositoryItemData,
  deleteRepositoryItem,
  upsertRepositoryItemFromOrderForm as upsertRepositoryItemFromOrderFormData,
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder as createPurchaseOrderData,
  updatePurchaseOrder as updatePurchaseOrderData,
  deletePurchaseOrder,
  deletePurchaseOrdersByOrderFormId as deletePurchaseOrdersByOrderFormIdData,
  getNextPoNumber as getNextPoNumberData,
  getUsers,
  updateUser as updateUserData,
} from './data';
import type { Customer, Invoice, InvoiceItem, OrderForm, OrderFormItem, TermsTemplate, MsaTemplate, CoverPageTemplate, RepositoryItem, PurchaseOrder, User } from '@/types';
import type { CustomerFormData, InvoiceFormData, TermsFormData, OrderFormFormData, TermsTemplateFormData, MsaTemplateFormData, CoverPageTemplateFormData, BrandingSettingsFormData, RepositoryItemFormData } from './schemas';
import { format, addDays } from 'date-fns';
import { Buffer } from 'buffer';

// Customer Actions
export async function getAllCustomers(): Promise<Customer[]> {
  return getCustomers();
}

export async function fetchCustomerById(id: string): Promise<Customer | undefined> {
  return getCustomerById(id);
}

// saveCustomer is removed as createNewCustomer and updateExistingCustomer are now separate in customer-actions.ts

export async function removeCustomer(id: string): Promise<boolean> {
  const success = await deleteCustomer(id);
  if (success) {
    revalidatePath('/customers');
    revalidatePath('/(app)/dashboard', 'page');
  }
  return success;
}

// Invoice Actions
export async function getAllInvoices(): Promise<Invoice[]> {
  return getInvoices();
}

export async function fetchInvoiceById(id: string): Promise<Invoice | undefined> {
  return getInvoiceById(id);
}

export async function saveInvoice(data: InvoiceFormData, id?: string): Promise<Invoice | null> {
  const customer = await fetchCustomerById(data.customerId);
  const currencyCode = customer?.currency || 'USD';

  const invoiceDataCore = {
    ...data, // Spread form data first
    customerName: customer?.name || 'Unknown Customer',
    currencyCode: currencyCode,
    linkedMsaTemplateId: data.linkedMsaTemplateId === "_no_msa_template_" ? undefined : data.linkedMsaTemplateId,
    // Ensure custom text fields are passed
    customPaymentTerms: data.customPaymentTerms,
    customCommitmentPeriod: data.customCommitmentPeriod,
    paymentFrequency: data.paymentFrequency,
    customPaymentFrequency: data.customPaymentFrequency,
  };
   console.log("[Action: saveInvoice] invoiceDataCore:", JSON.parse(JSON.stringify(invoiceDataCore)));


  if (id) {
    const existingInvoice = await getInvoiceById(id);
    if (!existingInvoice) return null;

    const finalData = {
      ...invoiceDataCore,
      termsAndConditions: data.termsAndConditions !== undefined ? data.termsAndConditions : existingInvoice.termsAndConditions,
      msaContent: data.msaContent !== undefined ? data.msaContent : existingInvoice.msaContent,
      msaCoverPageTemplateId: data.msaCoverPageTemplateId !== undefined ? data.msaCoverPageTemplateId : existingInvoice.msaCoverPageTemplateId,
      linkedMsaTemplateId: data.linkedMsaTemplateId === "_no_msa_template_" ? undefined : (data.linkedMsaTemplateId !== undefined ? data.linkedMsaTemplateId : existingInvoice.linkedMsaTemplateId),
    };
     console.log("[Action: saveInvoice - Update] finalData for update:", JSON.parse(JSON.stringify(finalData)));

    const updated = await updateInvoiceData(id, finalData);
    if (updated) {
      if (updated.items && updated.customerId && customer) {
        for (const item of updated.items) {
          await upsertRepositoryItemFromOrderFormData(item, updated.customerId, customer.name, updated.currencyCode || 'USD');
        }
      }
      revalidatePath('/invoices');
      revalidatePath(`/invoices/${updated.id}`);
      revalidatePath(`/invoices/${updated.id}/terms`);
      revalidatePath('/item-repository');
      revalidatePath('/(app)/dashboard', 'page');
      revalidatePath(`/customers/${updated.customerId}/edit`);
    }
    return updated;
  } else {
    const newInvoice = await createInvoiceData(invoiceDataCore);
    if (newInvoice) {
       if (newInvoice.items && newInvoice.customerId && customer) {
        for (const item of newInvoice.items) {
          await upsertRepositoryItemFromOrderFormData(item, newInvoice.customerId, customer.name, newInvoice.currencyCode || 'USD');
        }
      }
      revalidatePath('/invoices');
      revalidatePath(`/invoices/${newInvoice.id}`);
      revalidatePath('/item-repository');
      revalidatePath('/(app)/dashboard', 'page');
      revalidatePath(`/customers/${newInvoice.customerId}/edit`);
    }
    return newInvoice;
  }
}

export async function removeInvoice(id: string): Promise<boolean> {
  const success = await deleteInvoice(id);
  if (success) {
    revalidatePath('/invoices');
    revalidatePath('/(app)/dashboard', 'page');
  }
  return success;
}

export async function saveInvoiceTerms(id: string, data: TermsFormData): Promise<Invoice | null> {
  const invoice = await getInvoiceById(id);
  if (!invoice) return null;

  const updated = await updateInvoiceData(id, { termsAndConditions: data.termsAndConditions });

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
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) return null;

  const updatedInvoice = await updateInvoiceData(invoiceId, { status: 'Paid' });

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
  return getOrderForms();
}

export async function fetchOrderFormById(id: string): Promise<OrderForm | undefined> {
  return getOrderFormById(id);
}

export async function saveOrderForm(data: OrderFormFormData, id?: string): Promise<OrderForm | null> {
  const customer = await fetchCustomerById(data.customerId);
  const currencyCode = customer?.currency || 'USD';

  const orderFormDataCore = {
    ...data, // Spread form data first
    customerName: customer?.name || 'Unknown Customer',
    currencyCode: currencyCode,
    linkedMsaTemplateId: data.linkedMsaTemplateId === "_no_msa_template_" ? undefined : data.linkedMsaTemplateId,
    // Ensure custom text fields are passed
    customPaymentTerms: data.customPaymentTerms,
    customCommitmentPeriod: data.customCommitmentPeriod,
    paymentFrequency: data.paymentFrequency,
    customPaymentFrequency: data.customPaymentFrequency,
  };
  // console.log("[Action: saveOrderForm] orderFormDataCore:", JSON.parse(JSON.stringify(orderFormDataCore)));


  if (id) {
    const existingOrderForm = await getOrderFormById(id);
    if (!existingOrderForm) return null;

    const finalData = {
      ...orderFormDataCore,
      termsAndConditions: data.termsAndConditions !== undefined ? data.termsAndConditions : existingOrderForm.termsAndConditions,
      msaContent: data.msaContent !== undefined ? data.msaContent : existingOrderForm.msaContent,
      msaCoverPageTemplateId: data.msaCoverPageTemplateId !== undefined ? data.msaCoverPageTemplateId : existingOrderForm.msaCoverPageTemplateId,
      linkedMsaTemplateId: data.linkedMsaTemplateId === "_no_msa_template_" ? undefined : (data.linkedMsaTemplateId !== undefined ? data.linkedMsaTemplateId : existingOrderForm.linkedMsaTemplateId),
    };
    //  console.log("[Action: saveOrderForm - Update] finalData for update:", JSON.parse(JSON.stringify(finalData)));

    const updated = await updateOrderFormData(id, finalData);
    if (updated) {
      await deletePurchaseOrdersByOrderFormIdData(id);
      if (updated.items && updated.customerId && customer) {
        for (const item of updated.items) {
          await upsertRepositoryItemFromOrderFormData(item, updated.customerId, customer.name, updated.currencyCode || 'USD');
          if (item.vendorName && item.procurementPrice !== undefined && item.procurementPrice >= 0) {
            // Logic to group items by vendor and create/update POs will be complex here
            // For now, let's assume one PO per vendor, per Order Form save
          }
        }
        // Simplified PO creation: group items by vendor from the updated Order Form
        const itemsByVendor = updated.items.reduce((acc, item) => {
          if (item.vendorName && item.procurementPrice !== undefined && item.procurementPrice >= 0) {
            if (!acc[item.vendorName]) {
              acc[item.vendorName] = [];
            }
            acc[item.vendorName].push(item);
          }
          return acc;
        }, {} as Record<string, OrderFormItem[]>);

        for (const vendorName in itemsByVendor) {
          const poItems = itemsByVendor[vendorName].map(ofi => ({
            description: ofi.description,
            quantity: ofi.quantity,
            procurementPrice: ofi.procurementPrice!,
          }));
          if (poItems.length > 0) {
            const poNumber = await getNextPoNumberData();
            await createPurchaseOrderData({
              poNumber,
              vendorName,
              orderFormId: updated.id,
              orderFormNumber: updated.orderFormNumber,
              issueDate: new Date(),
              items: poItems,
              status: 'Draft'
            });
          }
        }
      }
      revalidatePath('/orderforms');
      revalidatePath(`/orderforms/${updated.id}`);
      revalidatePath(`/orderforms/${updated.id}/terms`);
      revalidatePath('/item-repository');
      revalidatePath('/purchase-orders');
    }
    return updated;
  } else {
    const newOrderForm = await createOrderFormData(orderFormDataCore);
    if(newOrderForm) {
      if (newOrderForm.items && newOrderForm.customerId && customer) {
        for (const item of newOrderForm.items) {
           await upsertRepositoryItemFromOrderFormData(item, newOrderForm.customerId, customer.name, newOrderForm.currencyCode || 'USD');
        }
         // PO Creation for new Order Form
        const itemsByVendor = newOrderForm.items.reduce((acc, item) => {
          if (item.vendorName && item.procurementPrice !== undefined && item.procurementPrice >= 0) {
            if (!acc[item.vendorName]) {
              acc[item.vendorName] = [];
            }
            acc[item.vendorName].push(item);
          }
          return acc;
        }, {} as Record<string, OrderFormItem[]>);

        for (const vendorName in itemsByVendor) {
          const poItems = itemsByVendor[vendorName].map(ofi => ({
            description: ofi.description,
            quantity: ofi.quantity,
            procurementPrice: ofi.procurementPrice!,
          }));
           if (poItems.length > 0) {
            const poNumber = await getNextPoNumberData();
            await createPurchaseOrderData({
              poNumber,
              vendorName,
              orderFormId: newOrderForm.id,
              orderFormNumber: newOrderForm.orderFormNumber,
              issueDate: new Date(),
              items: poItems,
              status: 'Draft'
            });
          }
        }
      }
      revalidatePath('/orderforms');
      revalidatePath(`/orderforms/${newOrderForm.id}`);
      revalidatePath('/item-repository');
      revalidatePath('/purchase-orders');
    }
    return newOrderForm;
  }
}

export async function removeOrderForm(id: string): Promise<boolean> {
  const success = await deleteOrderForm(id);
  if (success) {
    await deletePurchaseOrdersByOrderFormIdData(id);
    revalidatePath('/orderforms');
    revalidatePath('/purchase-orders');
  }
  return success;
}

export async function saveOrderFormTerms(id: string, data: TermsFormData): Promise<OrderForm | null> {
  const orderForm = await getOrderFormById(id);
  if (!orderForm) return null;

  const updated = await updateOrderFormData(id, { termsAndConditions: data.termsAndConditions });

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
  const orderForm = await getOrderFormById(orderFormId);
  if (!orderForm) {
    console.error('OrderForm not found for conversion:', orderFormId);
    return null;
  }

  const nextInvoiceNumber = await getNextInvoiceNumberData();
  const customer = await fetchCustomerById(orderForm.customerId);

  const newInvoiceData: Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'customerName' | 'additionalCharges' | 'currencyCode' | 'discountAmount'> & { items: Omit<InvoiceItem, 'id' | 'amount'>[], additionalCharges?: any[] } = {
    customerId: orderForm.customerId,
    invoiceNumber: nextInvoiceNumber,
    issueDate: new Date(),
    dueDate: addDays(new Date(), 30), // Default due date
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

  const newInvoice = await createInvoiceData(newInvoiceData);

  if (newInvoice) {
    await updateOrderFormData(orderFormId, { status: 'Accepted' });
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
    // Could also revalidate multiple customer edit pages if needed, but might be too broad
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

  // Base row for invoice details
  const baseInvoiceRow = [
      invoice.invoiceNumber,
      invoice.customerName,
      format(new Date(invoice.issueDate), 'yyyy-MM-dd'),
      format(new Date(invoice.dueDate), 'yyyy-MM-dd'),
      invoice.status,
      invoice.paymentTerms,
      invoice.customPaymentTerms,
      invoice.commitmentPeriod,
      invoice.customCommitmentPeriod,
      invoice.paymentFrequency,
      invoice.customPaymentFrequency,
      invoice.serviceStartDate ? format(new Date(invoice.serviceStartDate), 'yyyy-MM-dd') : '',
      invoice.serviceEndDate ? format(new Date(invoice.serviceEndDate), 'yyyy-MM-dd') : '',
  ];

  // Add rows for each item
  invoice.items.forEach(item => {
    const itemRow = [
      ...baseInvoiceRow,
      item.description,
      item.quantity,
      item.rate,
      item.amount,
      invoice.discountEnabled, invoice.discountDescription, invoice.discountType, invoice.discountValue, invoice.discountAmount, // Discount info per item row for simplicity in CSV structure
      '', '', '', '', // Placeholders for additional charges
      invoice.subtotal,
      invoice.taxRate,
      invoice.taxAmount,
      invoice.total
    ];
    csvContent += itemRow.map(escapeCsvField).join(',') + '\n';
  });

  // Add rows for each additional charge
  if (invoice.additionalCharges && invoice.additionalCharges.length > 0) {
    invoice.additionalCharges.forEach(charge => {
      const chargeRow = [
        ...baseInvoiceRow,
         '', '', '', '', // Placeholders for item details
        invoice.discountEnabled, invoice.discountDescription, invoice.discountType, invoice.discountValue, invoice.discountAmount,
        charge.description, charge.valueType, charge.value, charge.calculatedAmount,
        invoice.subtotal,
        invoice.taxRate,
        invoice.taxAmount,
        invoice.total
      ];
      csvContent += chargeRow.map(escapeCsvField).join(',') + '\n';
    });
  } else if (invoice.items.length === 0) { // If no items and no charges, add one row with invoice details
     const emptyRow = [
      ...baseInvoiceRow,
      '', '', '', '', // Placeholders for item details
      invoice.discountEnabled, invoice.discountDescription, invoice.discountType, invoice.discountValue, invoice.discountAmount,
      '', '', '', '', // Placeholders for additional charges
      invoice.subtotal,
      invoice.taxRate,
      invoice.taxAmount,
      invoice.total
    ];
    csvContent += emptyRow.map(escapeCsvField).join(',') + '\n';
  }


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
    'Payment Terms', 'Custom Payment Terms', 'Commitment Period', 'Custom Commitment Period',
    'Payment Frequency', 'Custom Payment Frequency', 'Service Start Date', 'Service End Date',
    'Item Description', 'Item Quantity', 'Item Rate', 'Item Procurement Price', 'Item Vendor Name', 'Item Amount',
    'Discount Enabled', 'Discount Description', 'Discount Type', 'Discount Value', 'Calculated Discount Amount',
    'Additional Charge Description', 'Additional Charge Type', 'Additional Charge Value', 'Additional Charge Calculated Amount',
    'OrderForm Subtotal (Items)', 'OrderForm Tax Rate (%)', 'OrderForm Tax Amount', 'OrderForm Total'
  ];

  let csvContent = headers.map(escapeCsvField).join(',') + '\n';

  const baseOrderFormRow = [
      orderForm.orderFormNumber,
      orderForm.customerName,
      format(new Date(orderForm.issueDate), 'yyyy-MM-dd'),
      format(new Date(orderForm.validUntilDate), 'yyyy-MM-dd'),
      orderForm.status,
      orderForm.paymentTerms,
      orderForm.customPaymentTerms,
      orderForm.commitmentPeriod,
      orderForm.customCommitmentPeriod,
      orderForm.paymentFrequency,
      orderForm.customPaymentFrequency,
      orderForm.serviceStartDate ? format(new Date(orderForm.serviceStartDate), 'yyyy-MM-dd') : '',
      orderForm.serviceEndDate ? format(new Date(orderForm.serviceEndDate), 'yyyy-MM-dd') : '',
  ];

  orderForm.items.forEach(item => {
    const itemRow = [
      ...baseOrderFormRow,
      item.description,
      item.quantity,
      item.rate,
      item.procurementPrice,
      item.vendorName,
      item.amount,
      orderForm.discountEnabled, orderForm.discountDescription, orderForm.discountType, orderForm.discountValue, orderForm.discountAmount,
      '', '', '', '', 
      orderForm.subtotal,
      orderForm.taxRate,
      orderForm.taxAmount,
      orderForm.total
    ];
    csvContent += itemRow.map(escapeCsvField).join(',') + '\n';
  });
  
  if (orderForm.additionalCharges && orderForm.additionalCharges.length > 0) {
    orderForm.additionalCharges.forEach(charge => {
      const chargeRow = [
        ...baseOrderFormRow,
        '', '', '', '', '', '', // Placeholders for item details
        orderForm.discountEnabled, orderForm.discountDescription, orderForm.discountType, orderForm.discountValue, orderForm.discountAmount,
        charge.description, charge.valueType, charge.value, charge.calculatedAmount,
        orderForm.subtotal,
        orderForm.taxRate,
        orderForm.taxAmount,
        orderForm.total
      ];
      csvContent += chargeRow.map(escapeCsvField).join(',') + '\n';
    });
  } else if (orderForm.items.length === 0) {
     const emptyRow = [
        ...baseOrderFormRow,
        '', '', '', '', '', '',
        orderForm.discountEnabled, orderForm.discountDescription, orderForm.discountType, orderForm.discountValue, orderForm.discountAmount,
        '', '', '', '', 
        orderForm.subtotal,
        orderForm.taxRate,
        orderForm.taxAmount,
        orderForm.total
    ];
    csvContent += emptyRow.map(escapeCsvField).join(',') + '\n';
  }


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
  return getTermsTemplates();
}

export async function fetchTermsTemplateById(id: string): Promise<TermsTemplate | undefined> {
  return getTermsTemplateById(id);
}

export async function saveTermsTemplate(data: TermsTemplateFormData, id?: string): Promise<TermsTemplate | null> {
  if (id) {
    const updated = await updateTermsTemplateData(id, data);
    if (updated) {
      revalidatePath('/templates/terms');
      revalidatePath(`/templates/terms/${id}/edit`);
    }
    return updated;
  } else {
    const newTemplate = await createTermsTemplateData(data);
    if (newTemplate) {
      revalidatePath('/templates/terms');
    }
    return newTemplate;
  }
}

export async function removeTermsTemplate(id: string): Promise<boolean> {
  const success = await deleteTermsTemplate(id);
  if (success) {
    revalidatePath('/templates/terms');
  }
  return success;
}

// MSA Template Actions
export async function getAllMsaTemplates(): Promise<MsaTemplate[]> {
  return getMsaTemplates();
}

export async function fetchMsaTemplateById(id: string): Promise<MsaTemplate | undefined> {
  return getMsaTemplateById(id);
}

export async function saveMsaTemplate(data: MsaTemplateFormData, id?: string): Promise<MsaTemplate | null> {
  const payload: Partial<Omit<MsaTemplate, 'id' | 'createdAt'>> = {
    name: data.name,
    content: data.content,
    coverPageTemplateId: data.coverPageTemplateId === "_no_cover_page_" ? undefined : data.coverPageTemplateId,
  };
  // console.log("[Action: saveMsaTemplate] Payload for save/update:", JSON.parse(JSON.stringify(payload)));


  if (id) {
    const updated = await updateMsaTemplateData(id, payload);
    if (updated) {
      revalidatePath('/templates/msa');
      revalidatePath(`/templates/msa/${id}/edit`);
    }
    return updated;
  } else {
    const newTemplate = await createMsaTemplateData(payload);
    if (newTemplate) {
      revalidatePath('/templates/msa');
    }
    return newTemplate;
  }
}

export async function removeMsaTemplate(id: string): Promise<boolean> {
  const success = await deleteMsaTemplate(id);
  if (success) {
    revalidatePath('/templates/msa');
  }
  return success;
}

export async function linkCoverPageToMsa(msaTemplateId: string, coverPageTemplateId: string | null): Promise<MsaTemplate | null> {
  const msaTemplate = await getMsaTemplateById(msaTemplateId);
  if (!msaTemplate) return null;

  const updatedMsaTemplate = await updateMsaTemplateData(msaTemplateId, { coverPageTemplateId: coverPageTemplateId === null ? undefined : coverPageTemplateId });
  if (updatedMsaTemplate) {
    revalidatePath('/templates/msa');
  }
  return updatedMsaTemplate;
}


// Cover Page Template Actions
export async function getAllCoverPageTemplates(): Promise<CoverPageTemplate[]> {
  return getCoverPageTemplates();
}

export async function fetchCoverPageTemplateById(id: string): Promise<CoverPageTemplate | undefined> {
  return getCoverPageTemplateById(id);
}

export async function saveCoverPageTemplate(data: CoverPageTemplateFormData, id?: string): Promise<CoverPageTemplate | null> {
  if (id) {
    const updated = await updateCoverPageTemplateData(id, data);
    if (updated) {
      revalidatePath('/templates/coverpages');
      revalidatePath(`/templates/coverpages/${id}/edit`);
    }
    return updated;
  } else {
    const newTemplate = await createCoverPageTemplateData(data);
    if (newTemplate) {
      revalidatePath('/templates/coverpages');
    }
    return newTemplate;
  }
}

export async function removeCoverPageTemplate(id: string): Promise<boolean> {
  const success = await deleteCoverPageTemplate(id);
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
  return getRepositoryItems();
}

export async function fetchRepositoryItemById(id: string): Promise<RepositoryItem | undefined> {
  return getRepositoryItemByIdData(id);
}

export async function saveRepositoryItem(data: RepositoryItemFormData, id?: string): Promise<RepositoryItem | null> {
  if (id) {
    const updated = await updateRepositoryItemData(id, data);
    if (updated) {
      revalidatePath('/item-repository');
      revalidatePath(`/item-repository/${id}/edit`);
    }
    return updated;
  } else {
    // Direct creation of repository items might need a separate form/flow
    // For now, upsert logic handles creation via order forms/invoices
    // const newItem = await createRepositoryItemData(data);
    // if (newItem) revalidatePath('/item-repository');
    // return newItem;
    console.warn("Direct creation of repository items via saveRepositoryItem without ID is not fully implemented. Items are typically created/updated via Order Forms or Invoices.");
    return null;
  }
}

export async function removeRepositoryItem(id: string): Promise<boolean> {
  const success = await deleteRepositoryItem(id);
  if (success) {
    revalidatePath('/item-repository');
  }
  return success;
}

// Purchase Order Actions
export async function getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
  return getPurchaseOrders();
}

export async function fetchPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined> {
  return getPurchaseOrderById(id);
}

// savePurchaseOrder would be for creating/editing POs directly, not currently implemented
// removePurchaseOrder is already there

// User Actions (for Admin)
export async function getAllUsers(): Promise<User[]> {
  return getUsers();
}

export async function toggleUserActiveStatus(userId: string, isActive: boolean): Promise<User | null> {
  const updatedUser = await updateUserData(userId, { isActive });
  if (updatedUser) {
    revalidatePath('/admin/dashboard');
  }
  return updatedUser;
}
