
import type { Customer, Invoice, InvoiceItem, OrderForm, OrderFormItem, AdditionalChargeItem, TermsTemplate } from '@/types';
import type { AdditionalChargeFormData, TermsTemplateFormData } from './schemas'; 
import { addDays } from 'date-fns';

let mockCustomers: Customer[] = [
  { 
    id: 'cust_1', 
    name: 'Alice Wonderland', 
    email: 'alice@example.com', 
    phone: '123-456-7890', 
    currency: 'INR',
    billingAddress: { street: '123 Rabbit Hole', city: 'Storyville', state: 'CA', zip: '90210', country: 'USA' }, 
    shippingAddress: { street: '123 Rabbit Hole', city: 'Storyville', state: 'CA', zip: '90210', country: 'USA' },
    createdAt: new Date() 
  },
  { 
    id: 'cust_2', 
    name: 'Bob The Builder', 
    email: 'bob@example.com', 
    phone: '987-654-3210', 
    currency: 'GBP',
    billingAddress: { street: '456 Construction Way', city: 'BuildCity', state: 'NY', zip: '10001', country: 'USA' },
    createdAt: new Date() 
  },
];

let mockInvoices: Invoice[] = [
  { 
    id: 'inv_1', 
    invoiceNumber: 'INV-001', 
    customerId: 'cust_1',
    customerName: 'Alice Wonderland',
    currencyCode: 'INR',
    issueDate: new Date(2023, 10, 15), 
    dueDate: new Date(2023, 11, 15),
    paymentTerms: "Net 30 Days",
    commitmentPeriod: "N/A",
    serviceStartDate: new Date(2023, 10, 1),
    serviceEndDate: new Date(2023, 10, 30),
    items: [
      { id: 'item_1', description: 'Web Design Service', quantity: 1, rate: 1200, amount: 1200 },
      { id: 'item_2', description: 'Hosting (1 year)', quantity: 1, rate: 100, amount: 100 },
    ],
    additionalCharges: [
        { id: 'ac_1', description: 'Service Fee', valueType: 'fixed', value: 50, calculatedAmount: 50 }
    ],
    subtotal: 1300, 
    taxRate: 10,
    taxAmount: 135, 
    total: 1485, 
    termsAndConditions: 'Payment due within 30 days. Late fees apply.',
    status: 'Sent',
    createdAt: new Date(2023, 10, 15)
  },
  { 
    id: 'inv_2', 
    invoiceNumber: 'INV-002', 
    customerId: 'cust_2',
    customerName: 'Bob The Builder',
    currencyCode: 'GBP',
    issueDate: new Date(2023, 11, 1), 
    dueDate: new Date(2023, 12, 1),
    paymentTerms: "Due on Receipt",
    items: [
      { id: 'item_3', description: 'Consultation', quantity: 5, rate: 80, amount: 400 },
    ],
    subtotal: 400,
    taxRate: 0,
    taxAmount: 0,
    total: 400,
    termsAndConditions: 'Full payment required upfront.',
    status: 'Paid',
    createdAt: new Date(2023, 11, 1)
  }
];

let mockOrderForms: OrderForm[] = [
  {
    id: 'of_1',
    orderFormNumber: 'OF-001',
    customerId: 'cust_1',
    customerName: 'Alice Wonderland',
    currencyCode: 'INR',
    issueDate: new Date(2024, 0, 10),
    validUntilDate: new Date(2024, 1, 9),
    paymentTerms: "Net 15 Days",
    commitmentPeriod: "3 Months",
    serviceStartDate: new Date(2024, 0, 15),
    serviceEndDate: new Date(2024, 3, 14),
    items: [
      { id: 'of_item_1', description: 'Initial Project Scoping', quantity: 1, rate: 500, amount: 500 },
      { id: 'of_item_2', description: 'Phase 1 Development Estimate', quantity: 1, rate: 2500, amount: 2500 },
    ],
    additionalCharges: [
      { id: 'of_ac_1', description: 'Rush Fee', valueType: 'percentage', value: 5, calculatedAmount: 150 } 
    ],
    subtotal: 3000, 
    taxRate: 10,
    taxAmount: 315, 
    total: 3465, 
    termsAndConditions: 'This order form is valid for 30 days. Prices subject to change thereafter.',
    status: 'Sent',
    createdAt: new Date(2024, 0, 10),
  },
];

let mockTermsTemplates: TermsTemplate[] = [
  {
    id: 'terms_tpl_1',
    name: 'Standard 30-Day Net',
    content: '<p>Payment is due within <strong>30 days</strong> from the invoice date. A late fee of 1.5% per month may be applied to all overdue balances.</p><p>Thank you for your business!</p>',
    createdAt: new Date(),
  },
  {
    id: 'terms_tpl_2',
    name: 'Software Development Contract Terms',
    content: '<h2>Project Scope</h2><p>The scope of work is defined in Appendix A.</p><h2>Payment Schedule</h2><ul><li>50% upfront</li><li>25% upon milestone 1 completion</li><li>25% upon final delivery</li></ul>',
    createdAt: new Date(),
  }
];

const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

// Customer Functions
export const getCustomers = async (): Promise<Customer[]> => {
  return [...mockCustomers];
};

export const getCustomerById = async (id: string): Promise<Customer | undefined> => {
  return mockCustomers.find(c => c.id === id);
};

export const createCustomer = async (data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> => {
  const newCustomer: Customer = { 
    ...data, 
    id: generateId('cust'), 
    currency: data.currency || 'USD', 
    billingAddress: data.billingAddress || undefined,
    shippingAddress: data.shippingAddress || undefined,
    createdAt: new Date() 
  };
  mockCustomers.push(newCustomer);
  return newCustomer;
};

export const updateCustomer = async (id: string, data: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<Customer | null> => {
  const index = mockCustomers.findIndex(c => c.id === id);
  if (index === -1) return null;
  mockCustomers[index] = { 
    ...mockCustomers[index], 
    ...data,
    currency: data.currency || mockCustomers[index].currency,
    billingAddress: data.billingAddress !== undefined ? data.billingAddress : mockCustomers[index].billingAddress,
    shippingAddress: data.shippingAddress !== undefined ? data.shippingAddress : mockCustomers[index].shippingAddress,
  };
  return mockCustomers[index];
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
  const initialLength = mockCustomers.length;
  mockCustomers = mockCustomers.filter(c => c.id !== id);
  return mockCustomers.length < initialLength;
};

function calculateTotalsAndCharges(
    itemsData: Omit<InvoiceItem, 'id' | 'amount'>[] | Omit<OrderFormItem, 'id' | 'amount'>[],
    additionalChargesData: AdditionalChargeFormData[] | undefined,
    taxRateInput: number
): {
    processedItems: (InvoiceItem[] | OrderFormItem[]);
    processedAdditionalCharges: AdditionalChargeItem[];
    mainItemsSubtotal: number;
    totalAdditionalChargesValue: number;
    taxAmount: number;
    grandTotal: number;
} {
    const processedItems = itemsData.map(item => ({
        ...item,
        id: generateId('item'), 
        amount: item.quantity * item.rate,
    }));

    const mainItemsSubtotal = processedItems.reduce((sum, item) => sum + item.amount, 0);

    const processedAdditionalCharges: AdditionalChargeItem[] = (additionalChargesData || []).map(charge => {
        let calculatedAmount = 0;
        if (charge.valueType === 'fixed') {
            calculatedAmount = charge.value;
        } else if (charge.valueType === 'percentage') {
            calculatedAmount = mainItemsSubtotal * (charge.value / 100);
        }
        return {
            id: charge.id || generateId('ac'),
            description: charge.description,
            valueType: charge.valueType,
            value: charge.value,
            calculatedAmount: calculatedAmount,
        };
    });

    const totalAdditionalChargesValue = processedAdditionalCharges.reduce((sum, charge) => sum + charge.calculatedAmount, 0);
    const taxableBase = mainItemsSubtotal + totalAdditionalChargesValue;
    const taxAmount = taxableBase * (taxRateInput / 100);
    const grandTotal = taxableBase + taxAmount;

    return {
        processedItems: processedItems as (InvoiceItem[] | OrderFormItem[]),
        processedAdditionalCharges,
        mainItemsSubtotal,
        totalAdditionalChargesValue,
        taxAmount,
        grandTotal,
    };
}

// Invoice Functions
export const getInvoices = async (): Promise<Invoice[]> => {
  return [...mockInvoices].map(inv => {
    const customer = mockCustomers.find(c => c.id === inv.customerId);
    return {
      ...inv,
      customerName: customer?.name || 'Unknown Customer',
      currencyCode: customer?.currency || 'USD'
    };
  });
};

export const getInvoiceById = async (id: string): Promise<Invoice | undefined> => {
  const invoice = mockInvoices.find(i => i.id === id);
  if (invoice) {
    const customer = mockCustomers.find(c => c.id === invoice.customerId);
    return {
      ...invoice,
      customerName: customer?.name || 'Unknown Customer',
      currencyCode: customer?.currency || 'USD'
    };
  }
  return undefined;
};

type CreateInvoiceInputData = Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'customerName' | 'additionalCharges' | 'currencyCode'> & 
                             { items: Omit<InvoiceItem, 'id' | 'amount'>[], additionalCharges?: AdditionalChargeFormData[] };

export const createInvoice = async (data: CreateInvoiceInputData): Promise<Invoice> => {
  const customer = mockCustomers.find(c => c.id === data.customerId);
  const taxRate = data.taxRate || 0;

  const { 
    processedItems, 
    processedAdditionalCharges, 
    mainItemsSubtotal, 
    taxAmount, 
    grandTotal 
  } = calculateTotalsAndCharges(data.items, data.additionalCharges, taxRate);

  const newInvoice: Invoice = {
    ...data,
    id: generateId('inv'),
    customerName: customer?.name || 'Unknown Customer',
    currencyCode: customer?.currency || 'USD',
    items: processedItems as InvoiceItem[],
    additionalCharges: processedAdditionalCharges,
    subtotal: mainItemsSubtotal,
    taxRate: taxRate,
    taxAmount: taxAmount,
    total: grandTotal,
    paymentTerms: data.paymentTerms,
    commitmentPeriod: data.commitmentPeriod,
    serviceStartDate: data.serviceStartDate,
    serviceEndDate: data.serviceEndDate,
    createdAt: new Date(),
  };
  mockInvoices.push(newInvoice);
  return newInvoice;
};

type UpdateInvoiceInputData = Partial<Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'customerName' | 'additionalCharges' | 'currencyCode'>> & 
                              { items?: Omit<InvoiceItem, 'id' | 'amount'>[], additionalCharges?: AdditionalChargeFormData[] };

export const updateInvoice = async (id: string, data: UpdateInvoiceInputData): Promise<Invoice | null> => {
  const index = mockInvoices.findIndex(i => i.id === id);
  if (index === -1) return null;

  let existingInvoice = mockInvoices[index];
  let updatedData = { ...existingInvoice, ...data };

  const customerIdForLookup = data.customerId || existingInvoice.customerId;
  const customer = mockCustomers.find(c => c.id === customerIdForLookup);
  updatedData.customerName = customer?.name || 'Unknown Customer';
  updatedData.currencyCode = customer?.currency || 'USD';
  
  const itemsForCalc = data.items || existingInvoice.items.map(item => ({description: item.description, quantity: item.quantity, rate: item.rate }));
  const additionalChargesForCalc = data.additionalCharges || existingInvoice.additionalCharges?.map(ac => ({ id: ac.id, description: ac.description, valueType: ac.valueType, value: ac.value })) || [];
  const taxRateForCalc = data.taxRate !== undefined ? data.taxRate : existingInvoice.taxRate;

  const {
    processedItems,
    processedAdditionalCharges,
    mainItemsSubtotal,
    taxAmount,
    grandTotal
  } = calculateTotalsAndCharges(itemsForCalc, additionalChargesForCalc, taxRateForCalc);

  updatedData = {
      ...updatedData,
      items: processedItems.map(item => ({...item, id: (data.items?.find(i => i.description === item.description)?.id || item.id || generateId('item'))  })) as InvoiceItem[],
      additionalCharges: processedAdditionalCharges.map(ac => ({...ac, id: (additionalChargesForCalc.find(c => c.description === ac.description)?.id || ac.id || generateId('ac')) })),
      subtotal: mainItemsSubtotal,
      taxRate: taxRateForCalc,
      taxAmount: taxAmount,
      total: grandTotal,
      paymentTerms: data.paymentTerms !== undefined ? data.paymentTerms : existingInvoice.paymentTerms,
      commitmentPeriod: data.commitmentPeriod !== undefined ? data.commitmentPeriod : existingInvoice.commitmentPeriod,
      serviceStartDate: data.serviceStartDate !== undefined ? data.serviceStartDate : existingInvoice.serviceStartDate,
      serviceEndDate: data.serviceEndDate !== undefined ? data.serviceEndDate : existingInvoice.serviceEndDate,
  };
  
  mockInvoices[index] = updatedData;
  return mockInvoices[index];
};

export const deleteInvoice = async (id: string): Promise<boolean> => {
  const initialLength = mockInvoices.length;
  mockInvoices = mockInvoices.filter(i => i.id !== id);
  return mockInvoices.length < initialLength;
};

export const getNextInvoiceNumber = async (): Promise<string> => {
    // For prototype, prefix is hardcoded here. In production, this would come from settings.
    const prefix = "INV-"; 
    const relevantInvoices = mockInvoices.filter(inv => inv.invoiceNumber.startsWith(prefix));
    if (relevantInvoices.length === 0) {
        return `${prefix}001`;
    }
    const lastInvoice = relevantInvoices.sort((a,b) => {
        const numA = parseInt(a.invoiceNumber.substring(prefix.length), 10);
        const numB = parseInt(b.invoiceNumber.substring(prefix.length), 10);
        return numA - numB;
    })[relevantInvoices.length - 1];
    
    try {
        const num = parseInt(lastInvoice.invoiceNumber.substring(prefix.length));
        return `${prefix}${(num + 1).toString().padStart(3, '0')}`;
    } catch (e) {
        return `${prefix}${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`;
    }
};

// OrderForm Functions
export const getOrderForms = async (): Promise<OrderForm[]> => {
  return [...mockOrderForms].map(of => {
    const customer = mockCustomers.find(c => c.id === of.customerId);
    return {
      ...of,
      customerName: customer?.name || 'Unknown Customer',
      currencyCode: customer?.currency || 'USD'
    };
  });
};

export const getOrderFormById = async (id: string): Promise<OrderForm | undefined> => {
  const orderForm = mockOrderForms.find(q => q.id === id);
  if (orderForm) {
     const customer = mockCustomers.find(c => c.id === orderForm.customerId);
    return {
      ...orderForm,
      customerName: customer?.name || 'Unknown Customer',
      currencyCode: customer?.currency || 'USD'
    };
  }
  return undefined;
};

type CreateOrderFormInputData = Omit<OrderForm, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'customerName' | 'additionalCharges' | 'currencyCode'> & 
                           { items: Omit<OrderFormItem, 'id' | 'amount'>[], additionalCharges?: AdditionalChargeFormData[] };

export const createOrderForm = async (data: CreateOrderFormInputData): Promise<OrderForm> => {
  const customer = mockCustomers.find(c => c.id === data.customerId);
  const taxRate = data.taxRate || 0;

  const { 
    processedItems, 
    processedAdditionalCharges, 
    mainItemsSubtotal, 
    taxAmount, 
    grandTotal 
  } = calculateTotalsAndCharges(data.items, data.additionalCharges, taxRate);

  const newOrderForm: OrderForm = {
    ...data,
    id: generateId('of'),
    customerName: customer?.name || 'Unknown Customer',
    currencyCode: customer?.currency || 'USD',
    items: processedItems.map(item => ({...item, id: generateId('of_item')})) as OrderFormItem[],
    additionalCharges: processedAdditionalCharges.map(ac => ({...ac, id: generateId('of_ac')})),
    subtotal: mainItemsSubtotal,
    taxRate: taxRate,
    taxAmount: taxAmount,
    total: grandTotal,
    paymentTerms: data.paymentTerms,
    commitmentPeriod: data.commitmentPeriod,
    serviceStartDate: data.serviceStartDate,
    serviceEndDate: data.serviceEndDate,
    createdAt: new Date(),
  };
  mockOrderForms.push(newOrderForm);
  return newOrderForm;
};

type UpdateOrderFormInputData = Partial<Omit<OrderForm, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'customerName' | 'additionalCharges' | 'currencyCode'>> & 
                            { items?: Omit<OrderFormItem, 'id' | 'amount'>[], additionalCharges?: AdditionalChargeFormData[] };

export const updateOrderForm = async (id: string, data: UpdateOrderFormInputData): Promise<OrderForm | null> => {
  const index = mockOrderForms.findIndex(q => q.id === id);
  if (index === -1) return null;

  let existingOrderForm = mockOrderForms[index];
  let updatedData = { ...existingOrderForm, ...data };

  const customerIdForLookup = data.customerId || existingOrderForm.customerId;
  const customer = mockCustomers.find(c => c.id === customerIdForLookup);
  updatedData.customerName = customer?.name || 'Unknown Customer';
  updatedData.currencyCode = customer?.currency || 'USD';

  const itemsForCalc = data.items || existingOrderForm.items.map(item => ({description: item.description, quantity: item.quantity, rate: item.rate }));
  const additionalChargesForCalc = data.additionalCharges || existingOrderForm.additionalCharges?.map(ac => ({ id: ac.id, description: ac.description, valueType: ac.valueType, value: ac.value })) || [];
  const taxRateForCalc = data.taxRate !== undefined ? data.taxRate : existingOrderForm.taxRate;

  const {
    processedItems,
    processedAdditionalCharges,
    mainItemsSubtotal,
    taxAmount,
    grandTotal
  } = calculateTotalsAndCharges(itemsForCalc, additionalChargesForCalc, taxRateForCalc);

  updatedData = {
      ...updatedData,
      items: processedItems.map(item => ({...item, id: (data.items?.find(i => i.description === item.description)?.id || item.id || generateId('of_item'))  })) as OrderFormItem[],
      additionalCharges: processedAdditionalCharges.map(ac => ({...ac, id: (additionalChargesForCalc.find(c => c.description === ac.description)?.id || ac.id || generateId('of_ac')) })),
      subtotal: mainItemsSubtotal,
      taxRate: taxRateForCalc,
      taxAmount: taxAmount,
      total: grandTotal,
      paymentTerms: data.paymentTerms !== undefined ? data.paymentTerms : existingOrderForm.paymentTerms,
      commitmentPeriod: data.commitmentPeriod !== undefined ? data.commitmentPeriod : existingOrderForm.commitmentPeriod,
      serviceStartDate: data.serviceStartDate !== undefined ? data.serviceStartDate : existingOrderForm.serviceStartDate,
      serviceEndDate: data.serviceEndDate !== undefined ? data.serviceEndDate : existingOrderForm.serviceEndDate,
  };
  
  mockOrderForms[index] = updatedData;
  return mockOrderForms[index];
};

export const deleteOrderForm = async (id: string): Promise<boolean> => {
  const initialLength = mockOrderForms.length;
  mockOrderForms = mockOrderForms.filter(q => q.id !== id);
  return mockOrderForms.length < initialLength;
};

export const getNextOrderFormNumber = async (): Promise<string> => {
    // For prototype, prefix is hardcoded here. In production, this would come from settings.
    const prefix = "OF-"; 
    const relevantOrderForms = mockOrderForms.filter(of => of.orderFormNumber.startsWith(prefix));
    if (relevantOrderForms.length === 0) {
        return `${prefix}001`;
    }
    const lastOrderForm = relevantOrderForms.sort((a,b) => {
        const numA = parseInt(a.orderFormNumber.substring(prefix.length), 10);
        const numB = parseInt(b.orderFormNumber.substring(prefix.length), 10);
        return numA - numB;
    })[relevantOrderForms.length - 1];
    
    try {
        const num = parseInt(lastOrderForm.orderFormNumber.substring(prefix.length));
        return `${prefix}${(num + 1).toString().padStart(3, '0')}`;
    } catch (e) {
        return `${prefix}${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`;
    }
};

// TermsTemplate Functions
export const getTermsTemplates = async (): Promise<TermsTemplate[]> => {
  return [...mockTermsTemplates];
};

export const getTermsTemplateById = async (id: string): Promise<TermsTemplate | undefined> => {
  return mockTermsTemplates.find(t => t.id === id);
};

export const createTermsTemplate = async (data: TermsTemplateFormData): Promise<TermsTemplate> => {
  const newTemplate: TermsTemplate = {
    id: generateId('terms_tpl'),
    name: data.name,
    content: data.content || '<p></p>',
    createdAt: new Date(),
  };
  mockTermsTemplates.push(newTemplate);
  return newTemplate;
};

export const updateTermsTemplate = async (id: string, data: Partial<TermsTemplateFormData>): Promise<TermsTemplate | null> => {
  const index = mockTermsTemplates.findIndex(t => t.id === id);
  if (index === -1) return null;
  mockTermsTemplates[index] = {
    ...mockTermsTemplates[index],
    ...data,
    content: data.content !== undefined ? (data.content || '<p></p>') : mockTermsTemplates[index].content,
  };
  return mockTermsTemplates[index];
};

export const deleteTermsTemplate = async (id: string): Promise<boolean> => {
  const initialLength = mockTermsTemplates.length;
  mockTermsTemplates = mockTermsTemplates.filter(t => t.id !== id);
  return mockTermsTemplates.length < initialLength;
};
