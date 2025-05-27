
import type { Customer, Invoice, InvoiceItem, OrderForm, OrderFormItem, AdditionalChargeItem, TermsTemplate, MsaTemplate, CoverPageTemplate, RepositoryItem, PurchaseOrder, PurchaseOrderItem, User, PlanType } from '@/types';
import type { AdditionalChargeFormData } from './schemas';
import { securedApiCall } from './api';
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

// --- Mock Data ---
let mockCustomers: Customer[] = [
  { id: 'cust_1', name: 'Alice Wonderland', email: 'alice@example.com', phone: '123-456-7890', currency: 'INR', billingAddress: { street: '123 Rabbit Hole', city: 'Wonderland', state: 'WL', zip: '12345', country: 'Fairyland' }, shippingAddress: { street: '123 Rabbit Hole', city: 'Wonderland', state: 'WL', zip: '12345', country: 'Fairyland' }, createdAt: new Date('2023-01-15') },
  { id: 'cust_2', name: 'Bob The Builder', email: 'bob@example.com', phone: '987-654-3210', currency: 'USD', billingAddress: { street: '456 Construction Way', city: 'Builderville', state: 'BV', zip: '67890', country: 'Tooltopia' }, createdAt: new Date('2023-03-20') },
  { id: 'cust_3', name: 'Charlie Brown', email: 'charlie@example.com', phone: '555-1212', currency: 'CAD', billingAddress: { street: '789 Kite Hill', city: 'Peanutsville', state: 'PS', zip: '54321', country: 'Cartoonland' }, createdAt: new Date('2023-05-10') },
];

let mockInvoices: Invoice[] = [
  {
    id: 'inv_1', invoiceNumber: 'INV-001', customerId: 'cust_1', customerName: 'Alice Wonderland', currencyCode: 'INR',
    issueDate: new Date('2023-06-01'), dueDate: new Date('2023-07-01'),
    items: [{ id: 'item_1_1', description: 'Web Design Services', quantity: 10, rate: 7500, amount: 75000 }],
    subtotal: 75000, taxRate: 18, taxAmount: 13500, total: 88500, status: 'Sent',
    termsAndConditions: '<p>Payment due upon receipt. Late fees apply.</p>',
    msaContent: '<h1>MSA Sample</h1><p>This is a sample MSA for INV-001.</p>',
    linkedMsaTemplateId: 'msa_tpl_1',
    msaCoverPageTemplateId: 'cpt_1',
    paymentTerms: "Net 30 Days", customPaymentTerms: "", commitmentPeriod: "12 Months", customCommitmentPeriod: "", paymentFrequency: "Monthly", customPaymentFrequency: "", serviceStartDate: new Date('2023-06-01'), serviceEndDate: new Date('2024-05-31'),
    createdAt: new Date('2023-06-01')
  },
  {
    id: 'inv_2', invoiceNumber: 'INV-002', customerId: 'cust_2', customerName: 'Bob The Builder', currencyCode: 'USD',
    issueDate: new Date('2023-06-15'), dueDate: new Date('2023-07-15'),
    items: [{ id: 'item_2_1', description: 'Consulting Hours', quantity: 20, rate: 100, amount: 2000 }],
    additionalCharges: [{id: 'ac_1', description: 'Rush Fee', valueType: 'fixed', value: 150, calculatedAmount: 150}],
    subtotal: 2000, taxRate: 10, taxAmount: 215, total: 2365, status: 'Paid',
    termsAndConditions: '<p>Thank you for your business!</p>',
    paymentTerms: "Due on Receipt", customPaymentTerms: "", commitmentPeriod: "N/A", customCommitmentPeriod: "", paymentFrequency: "Monthly", customPaymentFrequency: "",
    createdAt: new Date('2023-06-15')
  },
];

let mockOrderForms: OrderForm[] = [
  {
    id: 'of_1', orderFormNumber: 'OF-001', customerId: 'cust_1', customerName: 'Alice Wonderland', currencyCode: 'INR',
    issueDate: new Date('2023-05-01'), validUntilDate: new Date('2023-05-31'),
    items: [
      { id: 'of_item_1_1', description: 'Initial Project Scoping', quantity: 1, rate: 5000, amount: 5000, procurementPrice: 2000, vendorName: 'Scope Masters' },
      { id: 'of_item_1_2', description: 'Phase 1 Development Estimate', quantity: 1, rate: 60000, amount: 60000, procurementPrice: 45000, vendorName: 'Dev Experts Inc.' }
    ],
    subtotal: 65000, taxRate: 18, taxAmount: 11700, total: 76700, status: 'Accepted',
    termsAndConditions: '<h2>Order Form Terms</h2><p>This order is valid for 30 days. Services begin upon acceptance.</p>',
    linkedMsaTemplateId: 'msa_tpl_1',
    msaContent: '<h1>MSA Sample for Order Form</h1><p>This is a sample MSA for OF-001.</p>',
    msaCoverPageTemplateId: 'cpt_1',
    paymentTerms: "Net 30 Days", customPaymentTerms: "", commitmentPeriod: "6 Months", customCommitmentPeriod: "", paymentFrequency: "Monthly", customPaymentFrequency: "", serviceStartDate: new Date('2023-06-01'), serviceEndDate: new Date('2023-11-30'),
    createdAt: new Date('2023-05-01')
  },
];

let mockTermsTemplates: TermsTemplate[] = [
  { id: 'terms_tpl_1', name: 'Standard Payment Terms', content: '<p>All payments are due within 30 days of the invoice date. A late fee of 1.5% per month will be applied to overdue balances.</p>', createdAt: new Date('2023-01-01') },
  { id: 'terms_tpl_2', name: 'Software Development Contract Terms (Extended)', content: '<h2>1. Scope of Work</h2><p>The services to be provided are detailed in the attached Statement of Work (SOW).</p><h2>2. Payment Schedule</h2><p>Payments shall be made according to the milestones defined in the SOW. All invoices are payable within 15 days of receipt.</p><h3>3. Intellectual Property</h3><p>Client shall own all deliverables upon full payment.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p><p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p><h2>4. Confidentiality</h2><p>Both parties agree to keep confidential information private.</p>{{signaturePanel}}', createdAt: new Date('2023-01-05') },
];

let mockMsaTemplates: MsaTemplate[] = [
  { id: 'msa_tpl_1', name: 'General Services MSA', content: '<h1>Master Service Agreement</h1><p>This Master Service Agreement ("Agreement") is made and entered into as of {{issueDate}} by and between {{customerName}} ("Client") and Your Awesome Company LLC ("Service Provider").</p><h2>1. Services</h2><p>Service Provider agrees to perform services as described in any mutually agreed upon Statement of Work ("SOW") which shall be incorporated herein by reference.</p><h2>2. Term</h2><p>This Agreement shall commence on the Effective Date and continue until terminated as provided herein.</p>{{signaturePanel}}', coverPageTemplateId: 'cpt_1', createdAt: new Date('2023-01-10') },
  { id: 'msa_tpl_2', name: 'General Services MSA (Long)', content: '<h1>Master Service Agreement</h1><p>This Master Service Agreement ("Agreement") is made and entered into as of {{issueDate}} by and between {{customerName}} ("Client") and Your Awesome Company LLC ("Service Provider").</p><h2>1. Services</h2><p>Service Provider agrees to perform services as described in any mutually agreed upon Statement of Work ("SOW") which shall be incorporated herein by reference. Each SOW will describe the specific services, deliverables, timelines, and fees for a particular project.</p><h2>2. Term and Termination</h2><p>This Agreement shall commence on the Effective Date written above and shall continue in full force and effect until terminated by either party with thirty (30) days written notice. Termination of this MSA shall not affect any SOW then in effect, which shall continue to be governed by the terms of this MSA until completion or termination of such SOW.</p><h2>3. Fees and Payment</h2><p>Client agrees to pay Service Provider the fees set forth in each SOW. Invoices will be submitted as specified in the SOW and are payable within thirty (30) days of receipt, unless otherwise specified. Late payments may be subject to a late fee of 1.5% per month or the maximum rate permitted by law, whichever is lower.</p><h2>4. Intellectual Property</h2><p>Unless otherwise specified in an SOW, any intellectual property developed by Service Provider specifically for Client under an SOW ("Deliverables") shall be owned by Client upon full and final payment for such Deliverables. Service Provider retains ownership of all its pre-existing intellectual property and any tools, methodologies, or know-how used in connection with the services.</p><h2>5. Confidentiality</h2><p>Each party (the "Receiving Party") agrees to hold in confidence and not to use or disclose to any third party any Confidential Information of the other party (the "Disclosing Party"). "Confidential Information" means any non-public information disclosed by one party to the other, whether orally or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.</p><h2>6. Warranties and Disclaimers</h2><p>Service Provider warrants that the services will be performed in a professional and workmanlike manner. EXCEPT FOR THE FOREGOING WARRANTY, SERVICE PROVIDER MAKES NO OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.</p><h2>7. Limitation of Liability</h2><p>IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (a) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES; (b) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES. THE AGGREGATE LIABILITY OF SERVICE PROVIDER TO CLIENT FOR ANY AND ALL CLAIMS ARISING OUT OF OR RELATING TO THIS AGREEMENT OR ANY SOW SHALL NOT EXCEED THE TOTAL FEES PAID BY CLIENT TO SERVICE PROVIDER UNDER THE APPLICABLE SOW DURING THE TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING RISE TO THE CLAIM.</p><h2>8. Independent Contractor</h2><p>The parties are independent contractors. This Agreement shall not be construed as creating an agency, partnership, joint venture, or employment relationship between the parties.</p><h2>9. Governing Law</h2><p>This Agreement shall be governed by and construed in accordance with the laws of the State of [Your State/Jurisdiction], without regard to its conflict of laws principles.</p><h2>10. Entire Agreement</h2><p>This Agreement, together with all SOWs executed hereunder, constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements, proposals, or representations, written or oral, concerning its subject matter.</p><p>IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.</p>{{signaturePanel}}', coverPageTemplateId: 'cpt_2', createdAt: new Date('2023-01-12') },
];

let mockCoverPageTemplates: CoverPageTemplate[] = [
  { id: 'cpt_1', name: 'Standard Cover Page', title: 'Master Service Agreement', companyLogoEnabled: true, clientLogoEnabled: true, additionalImage1Enabled: false, additionalImage2Enabled: false, createdAt: new Date('2023-01-08') },
  { id: 'cpt_2', name: 'Branded Cover Page with Extra Image', title: 'Partnership Agreement', companyLogoEnabled: true, companyLogoUrl: 'https://revynox.com/wp-content/uploads/2024/11/cvent-logo.jpg', clientLogoEnabled: true, additionalImage1Enabled: true, additionalImage1Url: 'https://placehold.co/400x150.png', additionalImage2Enabled: false, createdAt: new Date('2023-01-09') },
];

let mockRepositoryItems: RepositoryItem[] = [
  { id: 'repo_1', name: 'Hourly Consulting', defaultRate: 150, currencyCode: 'USD', createdAt: new Date('2023-01-01') },
  { id: 'repo_2', name: 'Software License - Basic', defaultRate: 49, currencyCode: 'USD', defaultProcurementPrice: 20, defaultVendorName: 'LicensePal', createdAt: new Date('2023-01-02') },
  { id: 'repo_3', name: 'Custom Web Design Package', defaultRate: 2500, currencyCode: 'USD', customerId: 'cust_1', customerName: 'Alice Wonderland', defaultProcurementPrice: 1000, defaultVendorName: 'Creative Designs LLC', createdAt: new Date('2023-01-03') },
  { id: 'repo_4', name: 'SEO Audit', defaultRate: 750, currencyCode: 'GBP', customerId: 'cust_2', customerName: 'Bob The Builder', defaultVendorName: 'RankBoosters', createdAt: new Date('2023-01-04') },
  { id: 'repo_5', name: 'Content Writing (per 1000 words)', defaultRate: 200, currencyCode: 'USD', defaultProcurementPrice: 80, defaultVendorName: 'WordSmiths Co.', createdAt: new Date('2023-01-05') },
];

let mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po_1', poNumber: 'PO-001', vendorName: 'Scope Masters', orderFormId: 'of_1', orderFormNumber: 'OF-001',
    issueDate: new Date('2023-05-02'),
    items: [{ id: 'poi_1_1', description: 'Initial Project Scoping', quantity: 1, procurementPrice: 2000, totalVendorPayable: 2000 }],
    grandTotalVendorPayable: 2000, status: 'Issued', createdAt: new Date('2023-05-02')
  },
  {
    id: 'po_2', poNumber: 'PO-002', vendorName: 'Dev Experts Inc.', orderFormId: 'of_1', orderFormNumber: 'OF-001',
    issueDate: new Date('2023-05-03'),
    items: [{ id: 'poi_2_1', description: 'Phase 1 Development Estimate', quantity: 1, procurementPrice: 45000, totalVendorPayable: 45000 }],
    grandTotalVendorPayable: 45000, status: 'Draft', createdAt: new Date('2023-05-03')
  }
];

let mockUsers: User[] = [
  { id: 'user_1', name: 'Admin User', email: 'admin@example.com', signupDate: new Date('2023-01-01'), planType: 'Enterprise', isActive: true },
  { id: 'user_2', name: 'Alice Wonderland', email: 'alice@example.com', signupDate: new Date('2023-06-05'), planType: 'Pro', isActive: true },
  { id: 'user_3', name: 'Bob The Builder', email: 'bob@example.com', signupDate: new Date('2023-03-10'), planType: 'Basic', isActive: true },
  { id: 'user_4', name: 'Charlie Brown', email: 'charlie@example.com', signupDate: new Date('2024-01-15'), planType: 'Free', isActive: false },
  { id: 'user_5', name: 'Diana Prince', email: 'diana@example.com', signupDate: new Date('2022-11-20'), planType: 'Pro', isActive: true },
];

// --- Helper: Calculate Totals ---
function calculateDocumentTotals(
  items: { quantity: number; rate: number }[],
  additionalChargesData?: AdditionalChargeFormData[],
  taxRateVal?: number,
  discount?: {
    enabled?: boolean;
    type?: 'fixed' | 'percentage';
    value?: number;
  }
) {
  const mainItemsSubtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);

  const processedAdditionalCharges = additionalChargesData?.map(charge => {
    const value = Number(charge.value) || 0;
    let calculatedAmount = 0;
    if (charge.valueType === 'fixed') {
      calculatedAmount = value;
    } else if (charge.valueType === 'percentage') {
      calculatedAmount = mainItemsSubtotal * (value / 100);
    }
    return { ...charge, id: charge.id || generateId('ac'), calculatedAmount };
  }) || [];

  const totalAdditionalCharges = processedAdditionalCharges.reduce((sum, charge) => sum + charge.calculatedAmount, 0);
  const subtotalBeforeDiscount = mainItemsSubtotal + totalAdditionalCharges;

  let actualDiscountAmount = 0;
  if (discount?.enabled) {
    const discVal = Number(discount.value) || 0;
    if (discount.type === 'fixed') {
      actualDiscountAmount = discVal;
    } else if (discount.type === 'percentage') {
      actualDiscountAmount = subtotalBeforeDiscount * (discVal / 100);
    }
  }
  const taxableAmount = subtotalBeforeDiscount - actualDiscountAmount;
  const taxAmount = taxableAmount * ((Number(taxRateVal) || 0) / 100);
  const grandTotal = taxableAmount + taxAmount;

  const processedItems = items.map(item => ({
    ...item,
    id: (item as any).id || generateId('item'),
    amount: (Number(item.quantity) || 0) * (Number(item.rate) || 0),
  }));

  return {
    processedItems,
    processedAdditionalCharges,
    mainItemsSubtotal,
    actualDiscountAmount,
    taxAmount,
    grandTotal,
  };
}


// --- Customer Data Operations ---
export async function getCustomers(): Promise<Customer[]> {
  return mockCustomers.map(c => ({ ...c }));
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  const customer = mockCustomers.find(c => c.id === id);
  return customer ? { ...customer } : undefined;
}

export async function createCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer | null> {
  console.log("DEBUG: [data.ts] createCustomer called with data:", data);
  try{
  const newCustomer = await securedApiCall<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(data), 
    headers: { 'Content-Type': 'application/json' },
  });

  if (newCustomer) {
      return {
          ...newCustomer,
          createdAt: new Date(newCustomer.createdAt),
      };
  }
  console.log("DEBUG: [data.ts] createCustomer API response:", newCustomer); // <--- यह लाइन जोड़ें
  return newCustomer;
} catch (error) {
  console.error('Failed to create customer:', error);
  return null;
}
}


export async function updateCustomer(id: string, data: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<Customer | null> {
  const index = mockCustomers.findIndex(c => c.id === id);
  if (index === -1) return null;
  const updatedCustomer = { ...mockCustomers[index], ...data };
  mockCustomers[index] = updatedCustomer;
  return { ...updatedCustomer };
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const initialLength = mockCustomers.length;
  mockCustomers = mockCustomers.filter(c => c.id !== id);
  return mockCustomers.length < initialLength;
}

// --- Invoice Functions ---
export async function getInvoices(): Promise<Invoice[]> {
  return mockInvoices.map(inv => {
    const customer = mockCustomers.find(c => c.id === inv.customerId);
    return {
      ...inv,
      customerName: customer?.name || 'Unknown Customer',
      currencyCode: customer?.currency || inv.currencyCode || 'USD'
    };
  });
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  const invoice = mockInvoices.find(inv => inv.id === id);
  if (invoice) {
    const customer = mockCustomers.find(c => c.id === invoice.customerId);
    return {
      ...invoice,
      customerName: customer?.name || 'Unknown Customer',
      currencyCode: customer?.currency || invoice.currencyCode || 'USD'
    };
  }
  return undefined;
}

type CreateInvoiceInputData = Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'additionalCharges' | 'customerName' | 'currencyCode' | 'discountAmount'> &
                             { items: Omit<InvoiceItem, 'id' | 'amount'>[], additionalCharges?: AdditionalChargeFormData[] };

export async function createInvoice(data: CreateInvoiceInputData): Promise<Invoice | null> {
  const customer = mockCustomers.find(c => c.id === data.customerId);
  const { processedItems, processedAdditionalCharges, mainItemsSubtotal, actualDiscountAmount, taxAmount, grandTotal } = calculateDocumentTotals(
    data.items,
    data.additionalCharges,
    data.taxRate,
    { enabled: data.discountEnabled, type: data.discountType, value: data.discountValue }
  );

  const newInvoice: Invoice = {
    id: generateId('inv'),
    ...data,
    customerName: customer?.name || 'Unknown Customer',
    currencyCode: customer?.currency || 'USD',
    items: processedItems as InvoiceItem[],
    additionalCharges: processedAdditionalCharges as AdditionalChargeItem[],
    subtotal: mainItemsSubtotal,
    discountAmount: actualDiscountAmount,
    taxAmount: taxAmount,
    total: grandTotal,
    createdAt: new Date(),
    customPaymentTerms: data.customPaymentTerms || '',
    customCommitmentPeriod: data.customCommitmentPeriod || '',
    customPaymentFrequency: data.customPaymentFrequency || '',
  };
  mockInvoices.push(newInvoice);
  return { ...newInvoice };
}

type UpdateInvoiceInputData = Partial<Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'additionalCharges' | 'customerName' | 'currencyCode' | 'discountAmount'>> &
                             { items?: Omit<InvoiceItem, 'id' | 'amount'>[], additionalCharges?: AdditionalChargeFormData[] };

export async function updateInvoice(id: string, data: UpdateInvoiceInputData): Promise<Invoice | null> {
  const index = mockInvoices.findIndex(inv => inv.id === id);
  if (index === -1) return null;

  const existingInvoice = mockInvoices[index];
  const customer = mockCustomers.find(c => c.id === (data.customerId || existingInvoice.customerId));

  const itemsForCalc = (data.items || existingInvoice.items).map(item => ({
    description: item.description,
    quantity: item.quantity,
    rate: item.rate,
  }));
  const additionalChargesForCalc = data.additionalCharges || existingInvoice.additionalCharges?.map(ac => ({ // Use existing if not provided
    id: ac.id,
    description: ac.description,
    valueType: ac.valueType,
    value: ac.value
  }));

  const { processedItems, processedAdditionalCharges, mainItemsSubtotal, actualDiscountAmount, taxAmount, grandTotal } = calculateDocumentTotals(
    itemsForCalc,
    additionalChargesForCalc,
    data.taxRate !== undefined ? data.taxRate : existingInvoice.taxRate,
    {
      enabled: data.discountEnabled !== undefined ? data.discountEnabled : existingInvoice.discountEnabled,
      type: data.discountType || existingInvoice.discountType,
      value: data.discountValue !== undefined ? data.discountValue : existingInvoice.discountValue,
    }
  );

  const updatedInvoice: Invoice = {
    ...existingInvoice,
    ...data,
    customerName: customer?.name || 'Unknown Customer',
    currencyCode: customer?.currency || existingInvoice.currencyCode || 'USD',
    items: processedItems as InvoiceItem[],
    additionalCharges: processedAdditionalCharges as AdditionalChargeItem[],
    subtotal: mainItemsSubtotal,
    discountAmount: actualDiscountAmount,
    taxAmount: taxAmount,
    total: grandTotal,
    // Explicitly carry over custom text fields if they are in `data`, otherwise keep existing
    customPaymentTerms: data.customPaymentTerms !== undefined ? data.customPaymentTerms : existingInvoice.customPaymentTerms,
    customCommitmentPeriod: data.customCommitmentPeriod !== undefined ? data.customCommitmentPeriod : existingInvoice.customCommitmentPeriod,
    customPaymentFrequency: data.customPaymentFrequency !== undefined ? data.customPaymentFrequency : existingInvoice.customPaymentFrequency,
  };
  mockInvoices[index] = updatedInvoice;
  return { ...updatedInvoice };
}


export async function deleteInvoice(id: string): Promise<boolean> {
  const initialLength = mockInvoices.length;
  mockInvoices = mockInvoices.filter(inv => inv.id !== id);
  return mockInvoices.length < initialLength;
}

export async function getNextInvoiceNumber(): Promise<string> {
  const maxNum = mockInvoices.reduce((max, inv) => {
    const num = parseInt(inv.invoiceNumber.split('-')[1] || '0');
    return num > max ? num : max;
  }, 0);
  return `INV-${String(maxNum + 1).padStart(3, '0')}`;
}

// --- OrderForm Functions ---
export async function getOrderForms(): Promise<OrderForm[]> {
  return mockOrderForms.map(of => {
    const customer = mockCustomers.find(c => c.id === of.customerId);
    return {
      ...of,
      customerName: customer?.name || 'Unknown Customer',
      currencyCode: customer?.currency || of.currencyCode || 'USD'
    };
  });
}

export async function getOrderFormById(id: string): Promise<OrderForm | undefined> {
  const orderForm = mockOrderForms.find(of => of.id === id);
  if (orderForm) {
    const customer = mockCustomers.find(c => c.id === orderForm.customerId);
    return {
      ...orderForm,
      customerName: customer?.name || 'Unknown Customer',
      currencyCode: customer?.currency || orderForm.currencyCode || 'USD'
    };
  }
  return undefined;
}

type CreateOrderFormInputData = Omit<OrderForm, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'additionalCharges' | 'customerName' | 'currencyCode' | 'discountAmount'> &
                               { items: Omit<OrderFormItem, 'id' | 'amount'>[], additionalCharges?: AdditionalChargeFormData[] };

export async function createOrderForm(data: CreateOrderFormInputData): Promise<OrderForm | null> {
  const customer = mockCustomers.find(c => c.id === data.customerId);
  const { processedItems, processedAdditionalCharges, mainItemsSubtotal, actualDiscountAmount, taxAmount, grandTotal } = calculateDocumentTotals(
    data.items.map(item => ({ quantity: item.quantity, rate: item.rate })), // Pass only needed for calc
    data.additionalCharges,
    data.taxRate,
    { enabled: data.discountEnabled, type: data.discountType, value: data.discountValue }
  );

  const newOrderForm: OrderForm = {
    id: generateId('of'),
    ...data,
    customerName: customer?.name || 'Unknown Customer',
    currencyCode: customer?.currency || 'USD',
    items: processedItems.map((item, index) => ({
        ...item,
        id: (data.items[index] as any).id || generateId('ofitem'), // preserve original id if present for update
        procurementPrice: (data.items[index] as OrderFormItem).procurementPrice,
        vendorName: (data.items[index] as OrderFormItem).vendorName,
    })) as OrderFormItem[],
    additionalCharges: processedAdditionalCharges as AdditionalChargeItem[],
    subtotal: mainItemsSubtotal,
    discountAmount: actualDiscountAmount,
    taxAmount: taxAmount,
    total: grandTotal,
    createdAt: new Date(),
    customPaymentTerms: data.customPaymentTerms || '',
    customCommitmentPeriod: data.customCommitmentPeriod || '',
    customPaymentFrequency: data.customPaymentFrequency || '',
  };
  mockOrderForms.push(newOrderForm);
  return { ...newOrderForm };
}

type UpdateOrderFormInputData = Partial<Omit<OrderForm, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'additionalCharges' | 'customerName' | 'currencyCode' | 'discountAmount'>> &
                               { items?: Omit<OrderFormItem, 'id' | 'amount'>[], additionalCharges?: AdditionalChargeFormData[] };

export async function updateOrderForm(id: string, data: UpdateOrderFormInputData): Promise<OrderForm | null> {
  const index = mockOrderForms.findIndex(of => of.id === id);
  if (index === -1) return null;

  const existingOrderForm = mockOrderForms[index];
  const customer = mockCustomers.find(c => c.id === (data.customerId || existingOrderForm.customerId));

  const itemsForCalc = (data.items || existingOrderForm.items).map(item => ({
    description: item.description, // Not strictly needed for calc, but good to have for processedItems
    quantity: item.quantity,
    rate: item.rate,
    procurementPrice: (item as OrderFormItem).procurementPrice, // Carry over for final object
    vendorName: (item as OrderFormItem).vendorName,       // Carry over for final object
  }));
   const additionalChargesForCalc = data.additionalCharges || existingOrderForm.additionalCharges?.map(ac => ({
    id: ac.id,
    description: ac.description,
    valueType: ac.valueType,
    value: ac.value
  }));


  const { processedItems, processedAdditionalCharges, mainItemsSubtotal, actualDiscountAmount, taxAmount, grandTotal } = calculateDocumentTotals(
    itemsForCalc.map(item => ({ quantity: item.quantity, rate: item.rate })),
    additionalChargesForCalc,
    data.taxRate !== undefined ? data.taxRate : existingOrderForm.taxRate,
    {
      enabled: data.discountEnabled !== undefined ? data.discountEnabled : existingOrderForm.discountEnabled,
      type: data.discountType || existingOrderForm.discountType,
      value: data.discountValue !== undefined ? data.discountValue : existingOrderForm.discountValue,
    }
  );
  
  const updatedOrderForm: OrderForm = {
    ...existingOrderForm,
    ...data,
    customerName: customer?.name || 'Unknown Customer',
    currencyCode: customer?.currency || existingOrderForm.currencyCode || 'USD',
    items: processedItems.map((pi, idx) => ({
      ...pi,
      id: (data.items?.[idx] as any)?.id || (existingOrderForm.items[idx] as any)?.id || generateId('ofitem'),
      procurementPrice: itemsForCalc[idx].procurementPrice,
      vendorName: itemsForCalc[idx].vendorName,
    })) as OrderFormItem[],
    additionalCharges: processedAdditionalCharges as AdditionalChargeItem[],
    subtotal: mainItemsSubtotal,
    discountAmount: actualDiscountAmount,
    taxAmount: taxAmount,
    total: grandTotal,
    customPaymentTerms: data.customPaymentTerms !== undefined ? data.customPaymentTerms : existingOrderForm.customPaymentTerms,
    customCommitmentPeriod: data.customCommitmentPeriod !== undefined ? data.customCommitmentPeriod : existingOrderForm.customCommitmentPeriod,
    customPaymentFrequency: data.customPaymentFrequency !== undefined ? data.customPaymentFrequency : existingOrderForm.customPaymentFrequency,
  };

  mockOrderForms[index] = updatedOrderForm;
  return { ...updatedOrderForm };
}


export async function deleteOrderForm(id: string): Promise<boolean> {
  const initialLength = mockOrderForms.length;
  mockOrderForms = mockOrderForms.filter(of => of.id !== id);
  return mockOrderForms.length < initialLength;
}

export async function getNextOrderFormNumber(): Promise<string> {
  const maxNum = mockOrderForms.reduce((max, of) => {
    const num = parseInt(of.orderFormNumber.split('-')[1] || '0');
    return num > max ? num : max;
  }, 0);
  return `OF-${String(maxNum + 1).padStart(3, '0')}`;
}

// --- TermsTemplate Functions ---
export async function getTermsTemplates(): Promise<TermsTemplate[]> {
  return mockTermsTemplates.map(t => ({ ...t }));
}

export async function getTermsTemplateById(id: string): Promise<TermsTemplate | undefined> {
  const template = mockTermsTemplates.find(t => t.id === id);
  return template ? { ...template } : undefined;
}

export async function createTermsTemplate(data: Omit<TermsTemplate, 'id' | 'createdAt'>): Promise<TermsTemplate | null> {
  const newTemplate: TermsTemplate = { ...data, id: generateId('terms_tpl'), createdAt: new Date() };
  mockTermsTemplates.push(newTemplate);
  return { ...newTemplate };
}

export async function updateTermsTemplate(id: string, data: Partial<Omit<TermsTemplate, 'id' | 'createdAt'>>): Promise<TermsTemplate | null> {
  const index = mockTermsTemplates.findIndex(t => t.id === id);
  if (index === -1) return null;
  mockTermsTemplates[index] = { ...mockTermsTemplates[index], ...data };
  return { ...mockTermsTemplates[index] };
}

export async function deleteTermsTemplate(id: string): Promise<boolean> {
  const initialLength = mockTermsTemplates.length;
  mockTermsTemplates = mockTermsTemplates.filter(t => t.id !== id);
  return mockTermsTemplates.length < initialLength;
}

// --- MSA Template Functions ---
export async function getMsaTemplates(): Promise<MsaTemplate[]> {
  return mockMsaTemplates.map(t => ({ ...t }));
}

export async function getMsaTemplateById(id: string): Promise<MsaTemplate | undefined> {
  const template = mockMsaTemplates.find(t => t.id === id);
  return template ? { ...template } : undefined;
}

export async function createMsaTemplate(data: Partial<Omit<MsaTemplate, 'id' | 'createdAt'>>): Promise<MsaTemplate | null> {
  const newTemplate: MsaTemplate = {
    name: data.name || 'Untitled MSA Template',
    content: data.content || '<p></p>',
    coverPageTemplateId: data.coverPageTemplateId,
    id: generateId('msa_tpl'),
    createdAt: new Date()
  };
  mockMsaTemplates.push(newTemplate);
  return { ...newTemplate };
}

export async function updateMsaTemplate(id: string, data: Partial<Omit<MsaTemplate, 'id' | 'createdAt'>>): Promise<MsaTemplate | null> {
  const index = mockMsaTemplates.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  const updatedTemplate = { ...mockMsaTemplates[index], ...data };
  // Ensure coverPageTemplateId can be explicitly set to undefined
  if (data.hasOwnProperty('coverPageTemplateId')) {
    updatedTemplate.coverPageTemplateId = data.coverPageTemplateId;
  }
  mockMsaTemplates[index] = updatedTemplate;
  return { ...mockMsaTemplates[index] };
}

export async function deleteMsaTemplate(id: string): Promise<boolean> {
  const initialLength = mockMsaTemplates.length;
  mockMsaTemplates = mockMsaTemplates.filter(t => t.id !== id);
  return mockMsaTemplates.length < initialLength;
}

// --- Cover Page Template Functions ---
export async function getCoverPageTemplates(): Promise<CoverPageTemplate[]> {
  return mockCoverPageTemplates.map(t => ({ ...t }));
}

export async function getCoverPageTemplateById(id: string): Promise<CoverPageTemplate | undefined> {
  const template = mockCoverPageTemplates.find(t => t.id === id);
  return template ? { ...template } : undefined;
}

export async function createCoverPageTemplate(data: Omit<CoverPageTemplate, 'id' | 'createdAt'>): Promise<CoverPageTemplate | null> {
  const newTemplate: CoverPageTemplate = { ...data, id: generateId('cpt'), createdAt: new Date() };
  mockCoverPageTemplates.push(newTemplate);
  return { ...newTemplate };
}

export async function updateCoverPageTemplate(id: string, data: Partial<Omit<CoverPageTemplate, 'id' | 'createdAt'>>): Promise<CoverPageTemplate | null> {
  const index = mockCoverPageTemplates.findIndex(t => t.id === id);
  if (index === -1) return null;
  mockCoverPageTemplates[index] = { ...mockCoverPageTemplates[index], ...data };
  return { ...mockCoverPageTemplates[index] };
}

export async function deleteCoverPageTemplate(id: string): Promise<boolean> {
  const initialLength = mockCoverPageTemplates.length;
  mockCoverPageTemplates = mockCoverPageTemplates.filter(t => t.id !== id);
  return mockCoverPageTemplates.length < initialLength;
}

// --- Repository Item Functions ---
export async function getRepositoryItems(): Promise<RepositoryItem[]> {
  return mockRepositoryItems.map(item => ({ ...item }));
}

export async function getRepositoryItemById(id: string): Promise<RepositoryItem | undefined> {
  const item = mockRepositoryItems.find(item => item.id === id);
  return item ? { ...item } : undefined;
}

export async function createRepositoryItem(data: Partial<Omit<RepositoryItem, 'id' | 'createdAt'>>): Promise<RepositoryItem | null> {
  const newItem: RepositoryItem = {
    id: generateId('repo'),
    name: data.name || 'Unnamed Item',
    defaultRate: data.defaultRate,
    defaultProcurementPrice: data.defaultProcurementPrice,
    defaultVendorName: data.defaultVendorName,
    currencyCode: data.currencyCode,
    customerId: data.customerId,
    customerName: data.customerName,
    createdAt: new Date(),
  };
  mockRepositoryItems.push(newItem);
  return { ...newItem };
}

export async function updateRepositoryItem(id: string, data: Partial<Omit<RepositoryItem, 'id' | 'createdAt'>>): Promise<RepositoryItem | null> {
  const index = mockRepositoryItems.findIndex(item => item.id === id);
  if (index === -1) return null;
  mockRepositoryItems[index] = { ...mockRepositoryItems[index], ...data };
  return { ...mockRepositoryItems[index] };
}

export async function deleteRepositoryItem(id: string): Promise<boolean> {
  const initialLength = mockRepositoryItems.length;
  mockRepositoryItems = mockRepositoryItems.filter(item => item.id !== id);
  return mockRepositoryItems.length < initialLength;
}

export async function upsertRepositoryItemFromOrderForm(
  itemFromDoc: { description: string; rate: number; procurementPrice?: number; vendorName?: string; currencyCode?: string; },
  orderFormCustomerId: string,
  orderFormCustomerName: string
): Promise<RepositoryItem | null> {
  
  console.log("[Data: upsertRepo] Processing item from doc:", itemFromDoc.description, "for customer:", orderFormCustomerName, "(ID:", orderFormCustomerId, ")");

  const existingItemIndex = mockRepositoryItems.findIndex(
    repoItem =>
      repoItem.name.toLowerCase() === itemFromDoc.description.toLowerCase() &&
      repoItem.customerId === orderFormCustomerId
  );

  if (existingItemIndex !== -1) {
    console.log("[Data: upsertRepo] Found existing client-specific item. Updating:", mockRepositoryItems[existingItemIndex].name);
    mockRepositoryItems[existingItemIndex].defaultRate = itemFromDoc.rate;
    mockRepositoryItems[existingItemIndex].defaultProcurementPrice = itemFromDoc.procurementPrice; // Will be undefined if not from OrderFormItem
    mockRepositoryItems[existingItemIndex].defaultVendorName = itemFromDoc.vendorName; // Will be undefined if not from OrderFormItem
    mockRepositoryItems[existingItemIndex].currencyCode = itemFromDoc.currencyCode;
    return { ...mockRepositoryItems[existingItemIndex] };
  } else {
    // Try to find a global item to "clone" and make client-specific, or create brand new
    const globalItemIndex = mockRepositoryItems.findIndex(
      repoItem => repoItem.name.toLowerCase() === itemFromDoc.description.toLowerCase() && !repoItem.customerId
    );

    const newItemData: Partial<Omit<RepositoryItem, 'id' | 'createdAt'>> = {
      name: itemFromDoc.description,
      defaultRate: itemFromDoc.rate,
      defaultProcurementPrice: itemFromDoc.procurementPrice,
      defaultVendorName: itemFromDoc.vendorName,
      currencyCode: itemFromDoc.currencyCode,
      customerId: orderFormCustomerId,
      customerName: orderFormCustomerName,
    };
    
    if (globalItemIndex !== -1) {
        console.log("[Data: upsertRepo] Found global item. Creating client-specific version for:", itemFromDoc.description);
    } else {
        console.log("[Data: upsertRepo] No existing global or client-specific item found. Creating new client-specific item for:", itemFromDoc.description);
    }
    return createRepositoryItem(newItemData);
  }
}


// --- Purchase Order Functions ---
export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  return mockPurchaseOrders.map(po => ({ ...po }));
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined> {
  const po = mockPurchaseOrders.find(p => p.id === id);
  return po ? { ...po } : undefined;
}

type CreatePurchaseOrderInputData = Omit<PurchaseOrder, 'id' | 'createdAt' | 'items' | 'grandTotalVendorPayable'> &
                                    { items: Omit<PurchaseOrderItem, 'id' | 'totalVendorPayable'>[] };

export async function createPurchaseOrder(data: CreatePurchaseOrderInputData): Promise<PurchaseOrder | null> {
  let grandTotal = 0;
  const processedItems: PurchaseOrderItem[] = data.items.map(item => {
    const totalItemPayable = (Number(item.quantity) || 0) * (Number(item.procurementPrice) || 0);
    grandTotal += totalItemPayable;
    return {
      id: generateId('poi'),
      description: item.description,
      quantity: item.quantity,
      procurementPrice: item.procurementPrice,
      totalVendorPayable: totalItemPayable,
    };
  });

  const newOrder: PurchaseOrder = {
    id: generateId('po'),
    poNumber: data.poNumber,
    vendorName: data.vendorName,
    orderFormId: data.orderFormId,
    orderFormNumber: data.orderFormNumber,
    issueDate: data.issueDate,
    items: processedItems,
    grandTotalVendorPayable: grandTotal,
    status: data.status || 'Draft',
    createdAt: new Date(),
  };
  mockPurchaseOrders.push(newOrder);
  return { ...newOrder };
}

// updatePurchaseOrder is not fully implemented for brevity
// export async function updatePurchaseOrder(id: string, data: UpdatePurchaseOrderInputData): Promise<PurchaseOrder | null> { ... }

export async function deletePurchaseOrder(id: string): Promise<boolean> {
  const initialLength = mockPurchaseOrders.length;
  mockPurchaseOrders = mockPurchaseOrders.filter(po => po.id !== id);
  return mockPurchaseOrders.length < initialLength;
}

export async function deletePurchaseOrdersByOrderFormId(orderFormId: string): Promise<boolean> {
    const initialLength = mockPurchaseOrders.length;
    mockPurchaseOrders = mockPurchaseOrders.filter(po => po.orderFormId !== orderFormId);
    return mockPurchaseOrders.length !== initialLength;
}

export async function getNextPoNumber(): Promise<string> {
    const maxNum = mockPurchaseOrders.reduce((max, po) => {
        const num = parseInt(po.poNumber.split('-')[1] || '0');
        return num > max ? num : max;
    }, 0);
    return `PO-${String(maxNum + 1).padStart(3, '0')}`;
}

// --- User Data Operations ---
export async function getUsers(): Promise<User[]> {
  return mockUsers.map(u => ({ ...u }));
}

export async function getUserById(id: string): Promise<User | undefined> {
  const user = mockUsers.find(u => u.id === id);
  return user ? { ...user } : undefined;
}

export async function updateUser(id: string, data: Partial<Omit<User, 'id' | 'signupDate'>>): Promise<User | null> {
  const index = mockUsers.findIndex(u => u.id === id);
  if (index === -1) return null;
  mockUsers[index] = { ...mockUsers[index], ...data };
  return { ...mockUsers[index] };
}
    