
import type { Customer, Invoice, InvoiceItem, OrderForm, OrderFormItem, AdditionalChargeItem, TermsTemplate, MsaTemplate, CoverPageTemplate, RepositoryItem } from '@/types';
import type { AdditionalChargeFormData, CoverPageTemplateFormData, MsaTemplateFormData, TermsTemplateFormData, RepositoryItemFormData } from './schemas';
import { addDays } from 'date-fns';

// --- Mock Data Store ---
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
    currency: 'USD',
    billingAddress: { street: '456 Construction Way', city: 'BuildCity', state: 'NY', zip: '10001', country: 'USA' },
    createdAt: new Date()
  },
];

let mockMsaTemplates: MsaTemplate[] = [
  {
    id: 'msa_tpl_1',
    name: 'General Services MSA',
    content: '<h1>Master Service Agreement</h1><p>This Master Service Agreement (MSA) is entered into by and between Your Awesome Company LLC and {{customerName}} ("Client").</p><h2>1. Services</h2><p>Company agrees to provide services as described in applicable Order Forms or Invoices.</p>',
    coverPageTemplateId: 'cpt_1',
    createdAt: new Date(),
  },
  {
    id: 'msa_tpl_2',
    name: 'Consulting MSA (No Cover)',
    content: '<h1>Consulting Master Service Agreement</h1><p>This agreement governs all consulting services provided by Your Awesome Company LLC to {{customerName}}.</p><h2>Scope of Work</h2><p>Specific services and deliverables will be detailed in separate Statements of Work (SOWs) or Order Forms, which will reference this MSA.</p>',
    createdAt: new Date(),
  }
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
    linkedMsaTemplateId: 'msa_tpl_1',
    msaContent: mockMsaTemplates.find(m => m.id === 'msa_tpl_1')?.content,
    msaCoverPageTemplateId: mockMsaTemplates.find(m => m.id === 'msa_tpl_1')?.coverPageTemplateId,
    items: [
      { id: 'item_1', description: 'Web Design Service', quantity: 1, rate: 1200, amount: 1200 },
      { id: 'item_2', description: 'Hosting (1 year)', quantity: 1, rate: 100, amount: 100 },
    ],
    additionalCharges: [
        { id: 'ac_1', description: 'Service Fee', valueType: 'fixed', value: 50, calculatedAmount: 50 }
    ],
    discountEnabled: true,
    discountDescription: "Early Bird Discount",
    discountType: "fixed",
    discountValue: 50,
    discountAmount: 50,
    subtotal: 1300,
    taxRate: 10,
    taxAmount: (1300 + 50 - 50) * 0.10,
    total: (1300 + 50 - 50) + ((1300 + 50 - 50) * 0.10),
    termsAndConditions: 'Payment due within 30 days. Late fees apply.',
    status: 'Sent',
    createdAt: new Date(2023, 10, 15)
  },
  {
    id: 'inv_2',
    invoiceNumber: 'INV-002',
    customerId: 'cust_2',
    customerName: 'Bob The Builder',
    currencyCode: 'USD',
    issueDate: new Date(2023, 11, 1),
    dueDate: new Date(2024, 0, 1),
    paymentTerms: "Due on Receipt",
    items: [
      { id: 'item_3', description: 'Consultation', quantity: 5, rate: 80, amount: 400 },
    ],
    additionalCharges: [],
    discountEnabled: false,
    discountDescription: "",
    discountType: "fixed",
    discountValue: 0,
    discountAmount: 0,
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
    linkedMsaTemplateId: 'msa_tpl_1',
    msaContent: mockMsaTemplates.find(m => m.id === 'msa_tpl_1')?.content,
    msaCoverPageTemplateId: mockMsaTemplates.find(m => m.id === 'msa_tpl_1')?.coverPageTemplateId,
    items: [
      { id: 'of_item_1', description: 'Initial Project Scoping', quantity: 1, rate: 500, amount: 500, procurementPrice: 400, vendorName: "Scope Masters" },
      { id: 'of_item_2', description: 'Phase 1 Development Estimate', quantity: 1, rate: 2500, amount: 2500, procurementPrice: 2000, vendorName: "Dev Experts Inc." },
    ],
    additionalCharges: [
      { id: 'of_ac_1', description: 'Rush Fee', valueType: 'percentage', value: 5, calculatedAmount: 150 }
    ],
    discountEnabled: false,
    discountAmount: 0,
    subtotal: 3000,
    taxRate: 10,
    taxAmount: (3000 + 150) * 0.10,
    total: (3000 + 150) + ((3000 + 150) * 0.10),
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
    content: '<h2>Project Scope</h2><p>The scope of work is defined in Appendix A.</p><h2>Payment Schedule</h2><ul><li>50% upfront</li><li>25% upon milestone 1 completion</li><li>25% upon final delivery</li></ul><p>This agreement is made with {{customerName}}.</p><p>Please sign below:</p>{{signaturePanel}}',
    createdAt: new Date(),
  }
];

let mockCoverPageTemplates: CoverPageTemplate[] = [
  {
    id: 'cpt_1',
    name: 'Standard Cover Page',
    title: 'Master Service Agreement',
    companyLogoEnabled: true,
    companyLogoUrl: '', 
    clientLogoEnabled: true,
    clientLogoUrl: 'https://placehold.co/150x50.png',
    additionalImage1Enabled: false,
    additionalImage1Url: 'https://placehold.co/300x200.png',
    additionalImage2Enabled: false,
    additionalImage2Url: 'https://placehold.co/300x200.png',
    createdAt: new Date(),
  },
  {
    id: 'cpt_2',
    name: 'Minimalist Cover',
    title: 'Service Agreement',
    companyLogoEnabled: true,
    clientLogoEnabled: false,
    createdAt: new Date(),
  },
];

let mockRepositoryItems: RepositoryItem[] = [
  { id: 'repo_item_1', name: 'Web Design Service', defaultRate: 1250, currencyCode: 'INR', createdAt: new Date(), defaultProcurementPrice: 950, defaultVendorName: "Creative Designs Co. Updated" },
  { id: 'repo_item_2', name: 'Hosting (1 year)', defaultRate: 110, currencyCode: 'USD', createdAt: new Date(), defaultProcurementPrice: 75, defaultVendorName: "CloudNine Hosting Global" },
  { id: 'repo_item_3', name: 'Consultation', defaultRate: 85, currencyCode: 'USD', createdAt: new Date(), defaultVendorName: "Expert Advisors LLC", defaultProcurementPrice: 50 },
  { id: 'repo_item_4', name: 'Initial Project Scoping', defaultRate: 520, currencyCode: 'INR', createdAt: new Date(), defaultVendorName: "Strategy Solutions Plus", defaultProcurementPrice: 460 },
  { id: 'repo_item_5', name: 'Phase 1 Development Estimate', defaultRate: 2600, currencyCode: 'INR', createdAt: new Date(), defaultProcurementPrice: 2250, defaultVendorName: "Dev House Advanced" },
  { id: 'repo_item_6', name: 'Monthly Maintenance Retainer', defaultRate: 310, currencyCode: 'USD', createdAt: new Date() },
  { id: 'repo_item_7', name: 'Graphic Design Package', defaultRate: 760, currencyCode: 'USD', createdAt: new Date(), defaultProcurementPrice: 610, defaultVendorName: "Pixel Perfect Designs" },
  { id: 'repo_item_8', name: 'SEO Audit', defaultRate: 470, currencyCode: 'USD', createdAt: new Date(), defaultVendorName: "Search Boosters Pro", defaultProcurementPrice: 300 },
];

// --- Helper Functions ---
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

// --- Customer Functions ---
export const getCustomers = async (): Promise<Customer[]> => {
  return mockCustomers.map(c => ({ 
    ...c,
    billingAddress: c.billingAddress ? { ...c.billingAddress } : undefined,
    shippingAddress: c.shippingAddress ? { ...c.shippingAddress } : undefined,
  }));
};

export const getCustomerById = async (id: string): Promise<Customer | undefined> => {
  const customer = mockCustomers.find(c => c.id === id);
  return customer ? { 
    ...customer,
    billingAddress: customer.billingAddress ? { ...customer.billingAddress } : undefined,
    shippingAddress: customer.shippingAddress ? { ...customer.shippingAddress } : undefined,
   } : undefined;
};

export const createCustomer = async (data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> => {
  const newCustomer: Customer = {
    ...data,
    id: generateId('cust'),
    currency: data.currency || 'USD',
    billingAddress: data.billingAddress ? { ...data.billingAddress } : undefined,
    shippingAddress: data.shippingAddress ? { ...data.shippingAddress } : undefined,
    createdAt: new Date()
  };
  mockCustomers.push(newCustomer);
  return { ...newCustomer };
};

export const updateCustomer = async (id: string, data: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<Customer | null> => {
  const index = mockCustomers.findIndex(c => c.id === id);
  if (index === -1) return null;

  const updatedCustomerData = { ...mockCustomers[index], ...data };

  const updatedCustomer: Customer = {
    ...updatedCustomerData,
    currency: data.currency || mockCustomers[index].currency,
    billingAddress: data.billingAddress !== undefined ? (data.billingAddress ? {...data.billingAddress} : undefined) : (mockCustomers[index].billingAddress ? {...mockCustomers[index].billingAddress} : undefined),
    shippingAddress: data.shippingAddress !== undefined ? (data.shippingAddress ? {...data.shippingAddress} : undefined) : (mockCustomers[index].shippingAddress ? {...mockCustomers[index].shippingAddress} : undefined),
  };
  mockCustomers[index] = updatedCustomer;
  return { ...updatedCustomer };
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
  const initialLength = mockCustomers.length;
  mockCustomers = mockCustomers.filter(c => c.id !== id);
  return mockCustomers.length < initialLength;
};

// --- Calculation Helper ---
function calculateDocumentTotals(
  itemsData: (Omit<InvoiceItem, 'id' | 'amount'> | Omit<OrderFormItem, 'id' | 'amount'>)[],
  additionalChargesData: AdditionalChargeFormData[] | undefined,
  taxRateInput: number,
  discountData?: { enabled?: boolean; description?: string; type?: 'fixed' | 'percentage'; value?: number; }
): {
  processedItems: (InvoiceItem[] | OrderFormItem[]);
  processedAdditionalCharges: AdditionalChargeItem[];
  mainItemsSubtotal: number;
  totalAdditionalChargesValue: number;
  actualDiscountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
} {
  const processedItems = itemsData.map(item => ({
    ...item,
    id: (item as any).id || generateId('item'), 
    amount: (item.quantity || 0) * (item.rate || 0),
  }));

  const mainItemsSubtotal = processedItems.reduce((sum, item) => sum + item.amount, 0);

  const processedAdditionalCharges: AdditionalChargeItem[] = (additionalChargesData || []).map(charge => {
    let calculatedAmount = 0;
    const chargeValue = charge.value || 0;
    if (charge.valueType === 'fixed') {
      calculatedAmount = chargeValue;
    } else if (charge.valueType === 'percentage') {
      calculatedAmount = mainItemsSubtotal * (chargeValue / 100);
    }
    return {
      id: charge.id || generateId('ac'), 
      description: charge.description,
      valueType: charge.valueType,
      value: chargeValue,
      calculatedAmount: calculatedAmount,
    };
  });

  const totalAdditionalChargesValue = processedAdditionalCharges.reduce((sum, charge) => sum + charge.calculatedAmount, 0);
  const subtotalBeforeDiscount = mainItemsSubtotal + totalAdditionalChargesValue;

  let actualDiscountAmount = 0;
  if (discountData?.enabled && discountData.value && discountData.value > 0) {
    if (discountData.type === 'fixed') {
      actualDiscountAmount = discountData.value;
    } else if (discountData.type === 'percentage') {
      actualDiscountAmount = subtotalBeforeDiscount * (discountData.value / 100);
    }
  }

  const taxableAmount = subtotalBeforeDiscount - actualDiscountAmount;
  const taxAmount = taxableAmount * ((taxRateInput || 0) / 100);
  const grandTotal = taxableAmount + taxAmount;

  return {
    processedItems: processedItems as (InvoiceItem[] | OrderFormItem[]),
    processedAdditionalCharges,
    mainItemsSubtotal,
    totalAdditionalChargesValue,
    actualDiscountAmount,
    taxableAmount,
    taxAmount,
    grandTotal,
  };
}


// --- Invoice Functions ---
export const getInvoices = async (): Promise<Invoice[]> => {
  return mockInvoices.map(inv => {
    const customer = mockCustomers.find(c => c.id === inv.customerId);
    return {
      ...inv,
      items: inv.items.map(item => ({...item})),
      additionalCharges: inv.additionalCharges ? inv.additionalCharges.map(ac => ({...ac})) : undefined,
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
      items: invoice.items.map(item => ({...item})),
      additionalCharges: invoice.additionalCharges ? invoice.additionalCharges.map(ac => ({...ac})) : undefined,
      customerName: customer?.name || 'Unknown Customer',
      currencyCode: customer?.currency || 'USD'
    };
  }
  return undefined;
};

type CreateInvoiceInputData = Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'customerName' | 'additionalCharges' | 'currencyCode' | 'discountAmount'> &
                             { items: Omit<InvoiceItem, 'id' | 'amount'>[], additionalCharges?: AdditionalChargeFormData[] };

export const createInvoice = async (data: CreateInvoiceInputData): Promise<Invoice> => {
  const customer = mockCustomers.find(c => c.id === data.customerId);
  const taxRate = data.taxRate || 0;

  const {
    processedItems,
    processedAdditionalCharges,
    mainItemsSubtotal,
    actualDiscountAmount,
    taxAmount,
    grandTotal
  } = calculateDocumentTotals(data.items, data.additionalCharges, taxRate, {
    enabled: data.discountEnabled,
    description: data.discountDescription,
    type: data.discountType,
    value: data.discountValue,
  });

  const newInvoice: Invoice = {
    ...data,
    id: generateId('inv'),
    customerName: customer?.name || 'Unknown Customer',
    currencyCode: customer?.currency || 'USD',
    items: processedItems.map(item => ({...item, id: generateId('item')})) as InvoiceItem[],
    additionalCharges: processedAdditionalCharges.map(ac => ({...ac, id: generateId('ac')})),
    subtotal: mainItemsSubtotal,
    taxRate: taxRate,
    discountAmount: actualDiscountAmount,
    taxAmount: taxAmount,
    total: grandTotal,
    createdAt: new Date(),
  };
  mockInvoices.push(newInvoice);
  return { ...newInvoice, items: newInvoice.items.map(i => ({...i})), additionalCharges: newInvoice.additionalCharges?.map(ac => ({...ac})) };
};

type UpdateInvoiceInputData = Partial<Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'customerName' | 'additionalCharges' | 'currencyCode' | 'discountAmount'>> &
                              { items?: Omit<InvoiceItem, 'id' | 'amount'>[], additionalCharges?: AdditionalChargeFormData[] };

export const updateInvoice = async (id: string, data: UpdateInvoiceInputData): Promise<Invoice | null> => {
  const index = mockInvoices.findIndex(i => i.id === id);
  if (index === -1) return null;

  let existingInvoice = mockInvoices[index];

  const itemsForCalc = data.items || existingInvoice.items.map(item => ({description: item.description, quantity: item.quantity, rate: item.rate }));
  const additionalChargesForCalc = data.additionalCharges || existingInvoice.additionalCharges?.map(ac => ({ id: ac.id, description: ac.description, valueType: ac.valueType, value: ac.value })) || [];
  const taxRateForCalc = data.taxRate !== undefined ? data.taxRate : existingInvoice.taxRate;
  const discountDataForCalc = {
    enabled: data.discountEnabled !== undefined ? data.discountEnabled : existingInvoice.discountEnabled,
    description: data.discountDescription !== undefined ? data.discountDescription : existingInvoice.discountDescription,
    type: data.discountType !== undefined ? data.discountType : existingInvoice.discountType,
    value: data.discountValue !== undefined ? data.discountValue : existingInvoice.discountValue,
  };

  const {
    processedItems,
    processedAdditionalCharges,
    mainItemsSubtotal,
    actualDiscountAmount,
    taxAmount,
    grandTotal
  } = calculateDocumentTotals(itemsForCalc, additionalChargesForCalc, taxRateForCalc, discountDataForCalc);

  const updatedInvoice: Invoice = {
    ...existingInvoice,
    ...data,
    issueDate: data.issueDate ? new Date(data.issueDate) : existingInvoice.issueDate,
    dueDate: data.dueDate ? new Date(data.dueDate) : existingInvoice.dueDate,
    serviceStartDate: data.serviceStartDate ? new Date(data.serviceStartDate) : existingInvoice.serviceStartDate,
    serviceEndDate: data.serviceEndDate ? new Date(data.serviceEndDate) : existingInvoice.serviceEndDate,
    msaContent: data.msaContent !== undefined ? data.msaContent : existingInvoice.msaContent,
    msaCoverPageTemplateId: data.msaCoverPageTemplateId !== undefined ? data.msaCoverPageTemplateId : existingInvoice.msaCoverPageTemplateId,
    linkedMsaTemplateId: data.linkedMsaTemplateId !== undefined ? data.linkedMsaTemplateId : existingInvoice.linkedMsaTemplateId,
    termsAndConditions: data.termsAndConditions !== undefined ? data.termsAndConditions : existingInvoice.termsAndConditions,
    items: processedItems.map((item, idx) => ({
        ...item, 
        id: (data.items && data.items[idx] && (data.items[idx] as any).id) ? (data.items[idx] as any).id : (existingInvoice.items[idx]?.id || generateId('item')),
    })) as InvoiceItem[],
    additionalCharges: processedAdditionalCharges.map((ac, idx) => ({
        ...ac, 
        id: (data.additionalCharges && data.additionalCharges[idx] && data.additionalCharges[idx].id) ? data.additionalCharges[idx].id : (existingInvoice.additionalCharges?.[idx]?.id || generateId('ac')),
    })),
    subtotal: mainItemsSubtotal,
    taxRate: taxRateForCalc,
    discountEnabled: discountDataForCalc.enabled,
    discountDescription: discountDataForCalc.description,
    discountType: discountDataForCalc.type,
    discountValue: discountDataForCalc.value,
    discountAmount: actualDiscountAmount,
    taxAmount: taxAmount,
    total: grandTotal,
  };

  const customerIdForLookup = updatedInvoice.customerId;
  const customer = mockCustomers.find(c => c.id === customerIdForLookup);
  updatedInvoice.customerName = customer?.name || 'Unknown Customer';
  updatedInvoice.currencyCode = customer?.currency || 'USD';

  mockInvoices[index] = updatedInvoice;
  return { ...updatedInvoice, items: updatedInvoice.items.map(i => ({...i})), additionalCharges: updatedInvoice.additionalCharges?.map(ac => ({...ac})) };
};

export const deleteInvoice = async (id: string): Promise<boolean> => {
  const initialLength = mockInvoices.length;
  mockInvoices = mockInvoices.filter(i => i.id !== id);
  return mockInvoices.length < initialLength;
};

export const getNextInvoiceNumber = async (): Promise<string> => {
    const prefix = typeof localStorage !== 'undefined' ? localStorage.getItem('branding_invoice_prefix') || "INV-" : "INV-";
    const relevantInvoices = mockInvoices.filter(inv => inv.invoiceNumber.startsWith(prefix));
    if (relevantInvoices.length === 0) {
        return `${prefix}001`;
    }
    const lastInvoice = relevantInvoices.sort((a,b) => {
        const numA = parseInt(a.invoiceNumber.substring(prefix.length), 10) || 0;
        const numB = parseInt(b.invoiceNumber.substring(prefix.length), 10) || 0;
        return numA - numB;
    })[relevantInvoices.length - 1];

    try {
        const num = parseInt(lastInvoice.invoiceNumber.substring(prefix.length)) || 0;
        return `${prefix}${(num + 1).toString().padStart(3, '0')}`;
    } catch (e) {
        return `${prefix}${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`;
    }
};

// --- OrderForm Functions ---
export const getOrderForms = async (): Promise<OrderForm[]> => {
  return mockOrderForms.map(of => {
    const customer = mockCustomers.find(c => c.id === of.customerId);
    return {
      ...of,
      items: of.items.map(item => ({...item})),
      additionalCharges: of.additionalCharges ? of.additionalCharges.map(ac => ({...ac})) : undefined,
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
      items: orderForm.items.map(item => ({...item})),
      additionalCharges: orderForm.additionalCharges ? orderForm.additionalCharges.map(ac => ({...ac})) : undefined,
      customerName: customer?.name || 'Unknown Customer',
      currencyCode: customer?.currency || 'USD'
    };
  }
  return undefined;
};

type CreateOrderFormInputData = Omit<OrderForm, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'customerName' | 'additionalCharges' | 'currencyCode' | 'discountAmount'> &
                           { items: Omit<OrderFormItem, 'id' | 'amount'>[], additionalCharges?: AdditionalChargeFormData[] };

export const createOrderForm = async (data: CreateOrderFormInputData): Promise<OrderForm> => {
  const customer = mockCustomers.find(c => c.id === data.customerId);
  const taxRate = data.taxRate || 0;

  const {
    processedItems,
    processedAdditionalCharges,
    mainItemsSubtotal,
    actualDiscountAmount,
    taxAmount,
    grandTotal
  } = calculateDocumentTotals(data.items, data.additionalCharges, taxRate, {
    enabled: data.discountEnabled,
    description: data.discountDescription,
    type: data.discountType,
    value: data.discountValue,
  });

  const newOrderForm: OrderForm = {
    ...data,
    id: generateId('of'),
    customerName: customer?.name || 'Unknown Customer',
    currencyCode: customer?.currency || 'USD',
    items: processedItems.map(item => ({
        ...item,
        id: generateId('of_item'),
        procurementPrice: (item as OrderFormItem).procurementPrice,
        vendorName: (item as OrderFormItem).vendorName,
    })) as OrderFormItem[],
    additionalCharges: processedAdditionalCharges.map(ac => ({...ac, id: generateId('of_ac')})),
    subtotal: mainItemsSubtotal,
    taxRate: taxRate,
    discountAmount: actualDiscountAmount,
    taxAmount: taxAmount,
    total: grandTotal,
    createdAt: new Date(),
  };
  mockOrderForms.push(newOrderForm);
  return { ...newOrderForm, items: newOrderForm.items.map(i => ({...i})), additionalCharges: newOrderForm.additionalCharges?.map(ac => ({...ac})) };
};

type UpdateOrderFormInputData = Partial<Omit<OrderForm, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'customerName' | 'additionalCharges' | 'currencyCode' | 'discountAmount'>> &
                            { items?: Omit<OrderFormItem, 'id' | 'amount'>[], additionalCharges?: AdditionalChargeFormData[] };

export const updateOrderForm = async (id: string, data: UpdateOrderFormInputData): Promise<OrderForm | null> => {
  const index = mockOrderForms.findIndex(q => q.id === id);
  if (index === -1) return null;

  let existingOrderForm = mockOrderForms[index];

  const itemsForCalc = data.items || existingOrderForm.items.map(item => ({
    description: item.description,
    quantity: item.quantity,
    rate: item.rate,
    procurementPrice: item.procurementPrice,
    vendorName: item.vendorName,
  }));
  const additionalChargesForCalc = data.additionalCharges || existingOrderForm.additionalCharges?.map(ac => ({ id: ac.id, description: ac.description, valueType: ac.valueType, value: ac.value })) || [];
  const taxRateForCalc = data.taxRate !== undefined ? data.taxRate : existingOrderForm.taxRate;
  const discountDataForCalc = {
    enabled: data.discountEnabled !== undefined ? data.discountEnabled : existingOrderForm.discountEnabled,
    description: data.discountDescription !== undefined ? data.discountDescription : existingOrderForm.discountDescription,
    type: data.discountType !== undefined ? data.discountType : existingOrderForm.discountType,
    value: data.discountValue !== undefined ? data.discountValue : existingOrderForm.discountValue,
  };

  const {
    processedItems,
    processedAdditionalCharges,
    mainItemsSubtotal,
    actualDiscountAmount,
    taxAmount,
    grandTotal
  } = calculateDocumentTotals(itemsForCalc, additionalChargesForCalc, taxRateForCalc, discountDataForCalc);

  const updatedOrderForm: OrderForm = {
     ...existingOrderForm,
     ...data,
     issueDate: data.issueDate ? new Date(data.issueDate) : existingOrderForm.issueDate,
     validUntilDate: data.validUntilDate ? new Date(data.validUntilDate) : existingOrderForm.validUntilDate,
     serviceStartDate: data.serviceStartDate ? new Date(data.serviceStartDate) : existingOrderForm.serviceStartDate,
     serviceEndDate: data.serviceEndDate ? new Date(data.serviceEndDate) : existingOrderForm.serviceEndDate,
     msaContent: data.msaContent !== undefined ? data.msaContent : existingOrderForm.msaContent,
     msaCoverPageTemplateId: data.msaCoverPageTemplateId !== undefined ? data.msaCoverPageTemplateId : existingOrderForm.msaCoverPageTemplateId,
     linkedMsaTemplateId: data.linkedMsaTemplateId !== undefined ? data.linkedMsaTemplateId : existingOrderForm.linkedMsaTemplateId,
     termsAndConditions: data.termsAndConditions !== undefined ? data.termsAndConditions : existingOrderForm.termsAndConditions,
     items: processedItems.map((item, idx) => ({
        ...item,
        id: (data.items && data.items[idx] && (data.items[idx] as any).id) ? (data.items[idx] as any).id : (existingOrderForm.items[idx]?.id || generateId('of_item')),
        procurementPrice: (item as OrderFormItem).procurementPrice,
        vendorName: (item as OrderFormItem).vendorName,
    })) as OrderFormItem[],
     additionalCharges: processedAdditionalCharges.map((ac, idx) => ({
        ...ac, 
        id: (data.additionalCharges && data.additionalCharges[idx] && data.additionalCharges[idx].id) ? data.additionalCharges[idx].id : (existingOrderForm.additionalCharges?.[idx]?.id || generateId('of_ac')),
    })),
     subtotal: mainItemsSubtotal,
     taxRate: taxRateForCalc,
     discountEnabled: discountDataForCalc.enabled,
     discountDescription: discountDataForCalc.description,
     discountType: discountDataForCalc.type,
     discountValue: discountDataForCalc.value,
     discountAmount: actualDiscountAmount,
     taxAmount: taxAmount,
     total: grandTotal,
    };

  const customerIdForLookup = updatedOrderForm.customerId;
  const customer = mockCustomers.find(c => c.id === customerIdForLookup);
  updatedOrderForm.customerName = customer?.name || 'Unknown Customer';
  updatedOrderForm.currencyCode = customer?.currency || 'USD';

  mockOrderForms[index] = updatedOrderForm;
  return { ...updatedOrderForm, items: updatedOrderForm.items.map(i => ({...i})), additionalCharges: updatedOrderForm.additionalCharges?.map(ac => ({...ac})) };
};

export const deleteOrderForm = async (id: string): Promise<boolean> => {
  const initialLength = mockOrderForms.length;
  mockOrderForms = mockOrderForms.filter(q => q.id !== id);
  return mockOrderForms.length < initialLength;
};

export const getNextOrderFormNumber = async (): Promise<string> => {
    const prefix = typeof localStorage !== 'undefined' ? localStorage.getItem('branding_orderform_prefix') || "OF-" : "OF-";
    const relevantOrderForms = mockOrderForms.filter(of => of.orderFormNumber.startsWith(prefix));
    if (relevantOrderForms.length === 0) {
        return `${prefix}001`;
    }
    const lastOrderForm = relevantOrderForms.sort((a,b) => {
        const numA = parseInt(a.orderFormNumber.substring(prefix.length), 10) || 0;
        const numB = parseInt(b.orderFormNumber.substring(prefix.length), 10) || 0;
        return numA - numB;
    })[relevantOrderForms.length - 1];

    try {
        const num = parseInt(lastOrderForm.orderFormNumber.substring(prefix.length)) || 0;
        return `${prefix}${(num + 1).toString().padStart(3, '0')}`;
    } catch (e) {
        return `${prefix}${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`;
    }
};

// --- TermsTemplate Functions ---
export const getTermsTemplates = async (): Promise<TermsTemplate[]> => {
  return mockTermsTemplates.map(t => ({ ...t }));
};

export const getTermsTemplateById = async (id: string): Promise<TermsTemplate | undefined> => {
  const template = mockTermsTemplates.find(t => t.id === id);
  return template ? { ...template } : undefined;
};

export const createTermsTemplate = async (data: TermsTemplateFormData): Promise<TermsTemplate> => {
  const newTemplate: TermsTemplate = {
    id: generateId('terms_tpl'),
    name: data.name,
    content: data.content || '<p></p>',
    createdAt: new Date(),
  };
  mockTermsTemplates.push(newTemplate);
  return { ...newTemplate };
};

export const updateTermsTemplate = async (id: string, data: Partial<TermsTemplateFormData>): Promise<TermsTemplate | null> => {
  const index = mockTermsTemplates.findIndex(t => t.id === id);
  if (index === -1) return null;
  const updatedTemplate = {
    ...mockTermsTemplates[index],
    ...data,
    content: data.content !== undefined ? (data.content || '<p></p>') : mockTermsTemplates[index].content,
  };
  mockTermsTemplates[index] = updatedTemplate;
  return { ...updatedTemplate };
};

export const deleteTermsTemplate = async (id: string): Promise<boolean> => {
  const initialLength = mockTermsTemplates.length;
  mockTermsTemplates = mockTermsTemplates.filter(t => t.id !== id);
  return mockTermsTemplates.length < initialLength;
};

// --- MSA Template Functions ---
export const getMsaTemplates = async (): Promise<MsaTemplate[]> => {
  return mockMsaTemplates.map(t => ({ ...t }));
};

export const getMsaTemplateById = async (id: string): Promise<MsaTemplate | undefined> => {
  const template = mockMsaTemplates.find(t => t.id === id);
  return template ? { ...template } : undefined;
};

export const createMsaTemplate = async (data: Partial<Omit<MsaTemplate, 'id' | 'createdAt'>>): Promise<MsaTemplate> => {
  const newTemplate: MsaTemplate = {
    id: generateId('msa_tpl'),
    name: data.name || 'Unnamed MSA Template',
    content: data.content || '<p></p>',
    coverPageTemplateId: data.coverPageTemplateId,
    createdAt: new Date(),
  };
  mockMsaTemplates.push(newTemplate);
  return { ...newTemplate };
};

export const updateMsaTemplate = async (id: string, data: Partial<Omit<MsaTemplate, 'id' | 'createdAt'>>): Promise<MsaTemplate | null> => {
  const index = mockMsaTemplates.findIndex(t => t.id === id);
  if (index === -1) return null;

  const currentTemplate = mockMsaTemplates[index];
  const updatedTemplate: MsaTemplate = { ...currentTemplate };

  if (data.hasOwnProperty('name')) updatedTemplate.name = data.name!;
  if (data.hasOwnProperty('content')) updatedTemplate.content = data.content!;
  if (data.hasOwnProperty('coverPageTemplateId')) {
    updatedTemplate.coverPageTemplateId = data.coverPageTemplateId;
  }
  
  mockMsaTemplates[index] = updatedTemplate;
  return { ...updatedTemplate };
};

export const deleteMsaTemplate = async (id: string): Promise<boolean> => {
  const initialLength = mockMsaTemplates.length;
  mockMsaTemplates = mockMsaTemplates.filter(t => t.id !== id);
  return mockMsaTemplates.length < initialLength;
};

// --- Cover Page Template Functions ---
export const getCoverPageTemplates = async (): Promise<CoverPageTemplate[]> => {
  return mockCoverPageTemplates.map(t => ({ ...t }));
};

export const getCoverPageTemplateById = async (id: string): Promise<CoverPageTemplate | undefined> => {
  const template = mockCoverPageTemplates.find(t => t.id === id);
  return template ? { ...template } : undefined;
};

export const createCoverPageTemplate = async (data: CoverPageTemplateFormData): Promise<CoverPageTemplate> => {
  const newTemplate: CoverPageTemplate = {
    id: generateId('cpt'),
    ...data,
    createdAt: new Date(),
  };
  mockCoverPageTemplates.push(newTemplate);
  return { ...newTemplate };
};

export const updateCoverPageTemplate = async (id: string, data: Partial<CoverPageTemplateFormData>): Promise<CoverPageTemplate | null> => {
  const index = mockCoverPageTemplates.findIndex(t => t.id === id);
  if (index === -1) return null;
  const updatedTemplate = {
    ...mockCoverPageTemplates[index],
    ...data,
  };
  mockCoverPageTemplates[index] = updatedTemplate;
  return { ...updatedTemplate };
};

export const deleteCoverPageTemplate = async (id: string): Promise<boolean> => {
  const initialLength = mockCoverPageTemplates.length;
  mockCoverPageTemplates = mockCoverPageTemplates.filter(t => t.id !== id);
  return mockCoverPageTemplates.length < initialLength;
};

// --- Repository Item Functions ---
export const getRepositoryItems = async (): Promise<RepositoryItem[]> => {
  return mockRepositoryItems.map(item => ({ ...item }));
};

export const createRepositoryItem = async (data: Omit<RepositoryItem, 'id' | 'createdAt'>): Promise<RepositoryItem> => {
  const newItem: RepositoryItem = {
    id: generateId('repo_item'),
    name: data.name,
    defaultRate: data.defaultRate,
    defaultProcurementPrice: data.defaultProcurementPrice,
    defaultVendorName: data.defaultVendorName,
    currencyCode: data.currencyCode || 'USD',
    createdAt: new Date(),
  };
  mockRepositoryItems.push(newItem);
  return { ...newItem };
};

export const updateRepositoryItem = async (id: string, data: Partial<Omit<RepositoryItem, 'id' | 'createdAt'>>): Promise<RepositoryItem | null> => {
  const index = mockRepositoryItems.findIndex(item => item.id === id);
  if (index === -1) return null;
  mockRepositoryItems[index] = { ...mockRepositoryItems[index], ...data };
  return { ...mockRepositoryItems[index] };
};

export const deleteRepositoryItem = async (id: string): Promise<boolean> => {
  const initialLength = mockRepositoryItems.length;
  mockRepositoryItems = mockRepositoryItems.filter(item => item.id !== id);
  return mockRepositoryItems.length < initialLength;
};

export const findRepositoryItemByNameAndUpdate = async (
  itemName: string,
  itemDataFromDocument: {
    rate?: number;
    procurementPrice?: number;
    vendorName?: string;
    currencyCode?: string;
  }
): Promise<RepositoryItem | null> => {
  const itemIndex = mockRepositoryItems.findIndex(
    (repoItem) => repoItem.name.toLowerCase() === itemName.toLowerCase()
  );

  if (itemIndex !== -1) {
    const repoItemToUpdate = { ...mockRepositoryItems[itemIndex] };

    if (itemDataFromDocument.rate !== undefined) {
      repoItemToUpdate.defaultRate = itemDataFromDocument.rate;
    }
    if (itemDataFromDocument.procurementPrice !== undefined) {
      repoItemToUpdate.defaultProcurementPrice = itemDataFromDocument.procurementPrice;
    }
    // If vendorName is explicitly passed (even as an empty string), update it.
    // If it's undefined (not set in order form), don't change the repository's default.
    if (itemDataFromDocument.vendorName !== undefined) {
      repoItemToUpdate.defaultVendorName = itemDataFromDocument.vendorName;
    }
    if (itemDataFromDocument.currencyCode) {
      repoItemToUpdate.currencyCode = itemDataFromDocument.currencyCode;
    }

    mockRepositoryItems[itemIndex] = repoItemToUpdate;
    return { ...mockRepositoryItems[itemIndex] }; // Return a clone
  }
  return null; // Item not found in repository
};

