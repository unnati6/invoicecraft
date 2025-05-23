
import type { Customer, Invoice, InvoiceItem, OrderForm, OrderFormItem, AdditionalChargeItem, TermsTemplate, MsaTemplate, CoverPageTemplate, RepositoryItem, PurchaseOrder, PurchaseOrderItem } from '@/types';
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

const longMSALoremIpsum = `
<h2>1. Definitions</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
<p><strong>1.1 "Agreement"</strong> means this Master Services Agreement, including all Schedules and Exhibits attached hereto and all Order Forms executed hereunder.</p>
<p><strong>1.2 "Client Data"</strong> means any data, information or material provided or submitted by Client to Company in the course of utilizing the Services.</p>
<p><strong>1.3 "Confidential Information"</strong> means all information disclosed by a party ("Disclosing Party") to the other party ("Receiving Party"), whether orally or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.</p>

<h2>2. Services</h2>
<p>Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam consequat.</p>
<p>Vivamus consequat lorem vitae tortor. Ut consectetuer est.</p>
<ul>
    <li>Service A: Description of Service A. Deliverables include X, Y, Z.</li>
    <li>Service B: Description of Service B. This service has specific performance metrics.</li>
    <li>Service C: Support services related to A and B.</li>
</ul>

<h2>3. Term and Termination</h2>
<p>Vestibulum subit publica vulg Bemદાવાદ est terminalis processus. Quis vestrum agmen agitaret, nemo scit; sed si me frater. Accipite equidem paucis perennials planta processus gradibus. Nam faucibus, tellus nec dapibus ullamcorper, odio lorem luctus erat, vitae porta lectus justo et massa. Cras volutpat facilisis nunc. Ut id enim. Quisque molestie varius nulla. Donec vulputate feugiat felis. Nulla facilisi.</p>
<p>Morbi pellentesque, mauris interdum porta tincidunt, neque neque ultricies massa, at aliquam magna ligula ut enim. Duis ut magna. Nullam eu tellus. Integer varius, nisi et convallis ultricies, turpis lacus volutpat urna, vitae laoreet turpis justo vitae tellus. Phasellus ac nisl. Aeneam tincidunt aliquam tortor. Quisque nonummy, metus vitae tempus consectetuer, arcu diam consectetuer nibh, quis pharetra nulla elit et sem. Integer et ante. Aliquam ante. Vivamus ac leo. Aliquam sollicitudin, turpis eget vestibulum congue, justo nunc nonummy pede, et varius lacus lacus quis magna.</p>

<h2>4. Fees and Payment</h2>
<p>Nunc tincidunt, enim in commodo tempor, nisi tellus consequat purus, nec lacinia quam metus nec lorem. Praesent id quam. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. In hac habitasse platea dictumst. Nullam id justo vitae velit varius pellentesque. Quisque dictum, justo nec consequat pharetra, sapien odio mattis tellus, et fermentum nibh nisl ut dolor. Integer in enim. Phasellus vitae leo. Sed tempus ornare purus. Nunc pellentesque, magna in cursus imperdiet, nibh risus lacinia massa, quis blandit eros urna quis risus. Phasellus pulvinar scelerisque lorem. Cras commodo, ante nec suscipit pharetra, est nisl consequat nulla, ac laoreet mi nunc et dolor.</p>
<p>Aenean dapibus sapien non magna. Pellentesque metus. Proin euismod consectetuer dolor. Etiam commodo nibh sed diam. Maecenas vitae dolor. Nam eu neque. Aliquam libero. Aliquam et tellus. Suspendisse nonummy, nibh in tincidunt tempor, quam tortor consectetuer lorem, quis sodales mauris pede et pede. Aenean sit amet metus. Donec laoreet, pede quis pharetra sagittis, turpis magna laoreet nibh, ac venenatis diam nulla in arcu.</p>
<p>{{signaturePanel}}</p>
`;

const longTermsAndConditions = `
<h2>1. Scope of Services</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
<p>Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh.</p>

<h2>2. Payment Terms</h2>
<p>Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis. Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit.</p>
<ul>
    <li>Payment is due within <strong>{{paymentTerms}}</strong> from the invoice date.</li>
    <li>A late fee of 1.5% per month may be applied to all overdue balances.</li>
    <li>All payments shall be made in {{currencyCode}}.</li>
</ul>

<h2>3. Confidentiality</h2>
<p>Sed lectus. Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi lacinia molestie dui. Praesent blandit dolor. Sed non quam. In vel mi sit amet augue congue elementum. Morbi in ipsum sit amet pede facilisis laoreet. Donec lacus nunc, viverra nec, blandit vel, egestas et, augue. Vestibulum tincidunt malesuada tellus. Ut ultrices ultrices enim. Curabitur sit amet mauris. Morbi in dui quis est pulvinar ullamcorper. Nulla facilisi. Integer lacinia sollicitudin massa. Cras metus. Sed aliquet risus a tortor.</p>

<h2>4. Term and Termination</h2>
<p>Integer id quam. Morbi mi. Quisque nisl felis, venenatis tristique, dignissim in, ultrices sit amet, augue. Proin sodales libero eget ante. Nulla quam. Aenean laoreet. Vestibulum nisi lectus, commodo ac, facilisis ac, ultricies eu, pede. Ut orci risus, accumsan porttitor, cursus quis, aliquet eget, justo. Sed pretium blandit orci. Ut eu diam at pede suscipit sodales. Aenean lectus elit, fermentum non, convallis id, sagittis at, neque. Nullam mauris orci, aliquet et, iaculis et, viverra vitae, ligula. Nulla ut felis in purus aliquam imperdiet. Maecenas aliquet mollis lectus. Vivamus consectetuer risus et tortor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris.</p>

<h2>5. Limitation of Liability</h2>
<p>Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor.</p>

<h2>6. Governing Law</h2>
<p>Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis. Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet.</p>

<h2>7. Entire Agreement</h2>
<p>Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi lacinia molestie dui. Praesent blandit dolor. Sed non quam. In vel mi sit amet augue congue elementum. Morbi in ipsum sit amet pede facilisis laoreet. Donec lacus nunc, viverra nec, blandit vel, egestas et, augue. Vestibulum tincidunt malesuada tellus. Ut ultrices ultrices enim. Curabitur sit amet mauris. Morbi in dui quis est pulvinar ullamcorper. Nulla facilisi. Integer lacinia sollicitudin massa. Cras metus. Sed aliquet risus a tortor. Integer id quam. Morbi mi. Quisque nisl felis, venenatis tristique, dignissim in, ultrices sit amet, augue.</p>
<p>For any queries regarding this agreement, please contact us at company_email@example.com.</p>
<p>This agreement is made with {{customerName}} on {{issueDate}}.</p>
<p>Please find the signature panel below:</p>
<p>{{signaturePanel}}</p>
`;


let mockMsaTemplates: MsaTemplate[] = [
  {
    id: 'msa_tpl_1',
    name: 'General Services MSA (Long)',
    content: longMSALoremIpsum,
    coverPageTemplateId: 'cpt_1',
    createdAt: new Date(),
  },
  {
    id: 'msa_tpl_2',
    name: 'Consulting MSA (Short)',
    content: '<h1>Consulting Master Service Agreement</h1><p>This agreement governs all consulting services provided by Your Awesome Company LLC to {{customerName}}.</p><h2>Scope of Work</h2><p>Specific services and deliverables will be detailed in separate Statements of Work (SOWs) or Order Forms, which will reference this MSA.</p><p>{{signaturePanel}}</p>',
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
    discountDescription: "",
    discountType: "fixed",
    discountValue: 0,
    discountAmount: 0,
    subtotal: 3000, 
    taxRate: 10,
    taxAmount: (3000 + 150 - 0) * 0.10, 
    total: (3000 + 150 - 0) + ((3000 + 150 - 0) * 0.10),
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
    name: 'Software Development Contract Terms (Extended)',
    content: longTermsAndConditions,
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
  { id: 'repo_item_1', name: 'Web Design Service', defaultRate: 1250, currencyCode: 'INR', createdAt: new Date(), defaultProcurementPrice: 950, defaultVendorName: "Creative Designs Co.", customerId: 'cust_1', customerName: 'Alice Wonderland' },
  { id: 'repo_item_2', name: 'Hosting (1 year)', defaultRate: 110, currencyCode: 'USD', createdAt: new Date(), defaultProcurementPrice: 75, defaultVendorName: "CloudNine Hosting Global" },
  { id: 'repo_item_3', name: 'Consultation', defaultRate: 85, currencyCode: 'USD', createdAt: new Date(), defaultVendorName: "Expert Advisors LLC", defaultProcurementPrice: 50, customerId: 'cust_2', customerName: 'Bob The Builder' },
  { id: 'repo_item_4', name: 'Initial Project Scoping', defaultRate: 520, currencyCode: 'INR', createdAt: new Date(), defaultVendorName: "Scope Masters", defaultProcurementPrice: 460, customerId: 'cust_1', customerName: 'Alice Wonderland' },
  { id: 'repo_item_5', name: 'Phase 1 Development Estimate', defaultRate: 2600, currencyCode: 'INR', createdAt: new Date(), defaultProcurementPrice: 2250, defaultVendorName: "Dev Experts Inc.", customerId: 'cust_1', customerName: 'Alice Wonderland' },
  { id: 'repo_item_6', name: 'Monthly Maintenance Retainer', defaultRate: 310, currencyCode: 'USD', createdAt: new Date(), defaultVendorName: "Reliable Support Ltd." },
  { id: 'repo_item_7', name: 'Graphic Design Package', defaultRate: 760, currencyCode: 'USD', createdAt: new Date(), defaultProcurementPrice: 610, defaultVendorName: "Pixel Perfect Designs" },
  { id: 'repo_item_8', name: 'SEO Audit', defaultRate: 470, currencyCode: 'USD', createdAt: new Date(), defaultVendorName: "Search Boosters Pro", defaultProcurementPrice: 300, customerName: 'Bob The Builder', customerId: 'cust_2' },
];

let mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po_1',
    poNumber: 'PO-001',
    vendorName: 'Scope Masters',
    orderFormId: 'of_1',
    orderFormNumber: 'OF-001',
    issueDate: new Date(2024, 0, 10),
    items: [
      { id: 'po_item_1', description: 'Initial Project Scoping', quantity: 1, procurementPrice: 400, totalVendorPayable: 400 }
    ],
    grandTotalVendorPayable: 400,
    status: 'Issued',
    createdAt: new Date(2024, 0, 10)
  },
  {
    id: 'po_2',
    poNumber: 'PO-002',
    vendorName: 'Dev Experts Inc.',
    orderFormId: 'of_1',
    orderFormNumber: 'OF-001',
    issueDate: new Date(2024, 0, 10),
    items: [
      { id: 'po_item_2', description: 'Phase 1 Development Estimate', quantity: 1, procurementPrice: 2000, totalVendorPayable: 2000 }
    ],
    grandTotalVendorPayable: 2000,
    status: 'Draft',
    createdAt: new Date(2024, 0, 10)
  }
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
  return { ...newCustomer, billingAddress: newCustomer.billingAddress ? { ...newCustomer.billingAddress} : undefined, shippingAddress: newCustomer.shippingAddress ? { ...newCustomer.shippingAddress} : undefined };
};

export const updateCustomer = async (id: string, data: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<Customer | null> => {
  const index = mockCustomers.findIndex(c => c.id === id);
  if (index === -1) return null;

  const updatedCustomerData = { ...mockCustomers[index], ...data };
  mockCustomers[index] = updatedCustomerData; 
  return { ...updatedCustomerData, billingAddress: updatedCustomerData.billingAddress ? { ...updatedCustomerData.billingAddress} : undefined, shippingAddress: updatedCustomerData.shippingAddress ? { ...updatedCustomerData.shippingAddress} : undefined };
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
    items: processedItems.map(item => ({...item, id: (item as any).id || generateId('item')})) as InvoiceItem[],
    additionalCharges: processedAdditionalCharges.map(ac => ({...ac, id: (ac as any).id || generateId('ac')})),
    subtotal: mainItemsSubtotal,
    taxRate: taxRate,
    discountEnabled: data.discountEnabled,
    discountDescription: data.discountDescription,
    discountType: data.discountType,
    discountValue: data.discountValue,
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

  const updatedInvoiceData: Omit<Invoice, 'id' | 'createdAt' | 'customerName' | 'currencyCode' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'additionalCharges' | 'discountAmount'> & { items: InvoiceItem[], additionalCharges?: AdditionalChargeItem[], subtotal: number, taxAmount: number, total: number, discountAmount: number } = {
    ...existingInvoice,
    ...data,
    issueDate: data.issueDate ? new Date(data.issueDate) : existingInvoice.issueDate,
    dueDate: data.dueDate ? new Date(data.dueDate) : existingInvoice.dueDate,
    serviceStartDate: data.serviceStartDate ? new Date(data.serviceStartDate) : (existingInvoice.serviceStartDate ? new Date(existingInvoice.serviceStartDate) : null),
    serviceEndDate: data.serviceEndDate ? new Date(data.serviceEndDate) : (existingInvoice.serviceEndDate ? new Date(existingInvoice.serviceEndDate) : null),
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

  const customer = mockCustomers.find(c => c.id === updatedInvoiceData.customerId);
  
  const finalUpdatedInvoice: Invoice = {
    ...updatedInvoiceData,
    id: existingInvoice.id,
    createdAt: existingInvoice.createdAt,
    customerName: customer?.name || 'Unknown Customer',
    currencyCode: customer?.currency || 'USD',
  };

  mockInvoices[index] = finalUpdatedInvoice;
  return { ...finalUpdatedInvoice, items: finalUpdatedInvoice.items.map(i => ({...i})), additionalCharges: finalUpdatedInvoice.additionalCharges?.map(ac => ({...ac})) };
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
        id: (item as any).id || generateId('of_item'),
        procurementPrice: (item as OrderFormItem).procurementPrice,
        vendorName: (item as OrderFormItem).vendorName,
    })) as OrderFormItem[],
    additionalCharges: processedAdditionalCharges.map(ac => ({...ac, id: (ac as any).id || generateId('of_ac')})),
    subtotal: mainItemsSubtotal,
    taxRate: taxRate,
    discountEnabled: data.discountEnabled,
    discountDescription: data.discountDescription,
    discountType: data.discountType,
    discountValue: data.discountValue,
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

  const updatedOrderFormData: Omit<OrderForm, 'id' | 'createdAt' | 'customerName' | 'currencyCode' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'additionalCharges' | 'discountAmount'> & { items: OrderFormItem[], additionalCharges?: AdditionalChargeItem[], subtotal: number, taxAmount: number, total: number, discountAmount: number } = {
     ...existingOrderForm,
     ...data,
     issueDate: data.issueDate ? new Date(data.issueDate) : existingOrderForm.issueDate,
     validUntilDate: data.validUntilDate ? new Date(data.validUntilDate) : existingOrderForm.validUntilDate,
     serviceStartDate: data.serviceStartDate ? new Date(data.serviceStartDate) : (existingOrderForm.serviceStartDate ? new Date(existingOrderForm.serviceStartDate) : null),
     serviceEndDate: data.serviceEndDate ? new Date(data.serviceEndDate) : (existingOrderForm.serviceEndDate ? new Date(existingOrderForm.serviceEndDate) : null),
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
  
  const customer = mockCustomers.find(c => c.id === updatedOrderFormData.customerId);

  const finalUpdatedOrderForm: OrderForm = {
    ...updatedOrderFormData,
    id: existingOrderForm.id,
    createdAt: existingOrderForm.createdAt,
    customerName: customer?.name || 'Unknown Customer',
    currencyCode: customer?.currency || 'USD',
  };

  mockOrderForms[index] = finalUpdatedOrderForm;
  return { ...finalUpdatedOrderForm, items: finalUpdatedOrderForm.items.map(i => ({...i})), additionalCharges: finalUpdatedOrderForm.additionalCharges?.map(ac => ({...ac})) };
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

  if (data.hasOwnProperty('name')) {
    updatedTemplate.name = data.name!;
  }
  if (data.hasOwnProperty('content')) {
    updatedTemplate.content = data.content!;
  }
  if (data.hasOwnProperty('coverPageTemplateId')) {
    updatedTemplate.coverPageTemplateId = data.coverPageTemplateId === '' ? undefined : data.coverPageTemplateId;
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

export const getRepositoryItemById = async (id: string): Promise<RepositoryItem | undefined> => { 
  const item = mockRepositoryItems.find(i => i.id === id);
  return item ? { ...item } : undefined;
};

export const createRepositoryItem = async (data: Omit<RepositoryItem, 'id' | 'createdAt'>): Promise<RepositoryItem> => {
  const newItem: RepositoryItem = {
    id: generateId('repo_item'),
    name: data.name,
    defaultRate: data.defaultRate,
    defaultProcurementPrice: data.defaultProcurementPrice,
    defaultVendorName: data.defaultVendorName,
    currencyCode: data.currencyCode || 'USD',
    customerId: data.customerId,
    customerName: data.customerName,
    createdAt: new Date(),
  };
  mockRepositoryItems.push(newItem);
  console.log("[DATA: CREATE REPO ITEM]", JSON.parse(JSON.stringify(newItem)));
  return { ...newItem };
};

export const updateRepositoryItem = async (id: string, data: Partial<Omit<RepositoryItem, 'id' | 'createdAt'>>): Promise<RepositoryItem | null> => {
  const index = mockRepositoryItems.findIndex(item => item.id === id);
  if (index === -1) return null;
  mockRepositoryItems[index] = { ...mockRepositoryItems[index], ...data };
  console.log("[DATA: UPDATE REPO ITEM]", JSON.parse(JSON.stringify(mockRepositoryItems[index])));
  return { ...mockRepositoryItems[index] };
};

export const deleteRepositoryItem = async (id: string): Promise<boolean> => {
  const initialLength = mockRepositoryItems.length;
  mockRepositoryItems = mockRepositoryItems.filter(item => item.id !== id);
  return mockRepositoryItems.length < initialLength;
};

export const upsertRepositoryItemFromOrderForm = async (
  itemFromDocument: OrderFormItem | InvoiceItem,
  documentCustomerId: string,
  documentCustomerName: string,
  documentCurrencyCode: string
): Promise<RepositoryItem | null> => {
  const isOrderFormItem = 'procurementPrice' in itemFromDocument || 'vendorName' in itemFromDocument;
  const description = itemFromDocument.description;

  console.log(
    `[UPSERT REPO] Processing item: "${description}" for customer: "${documentCustomerName}" (ID: ${documentCustomerId}). Currency: ${documentCurrencyCode}. From OrderForm: ${isOrderFormItem}`
  );

  const itemIndex = mockRepositoryItems.findIndex(
    (repoItem) =>
      repoItem.name.toLowerCase() === description.toLowerCase() &&
      repoItem.customerId === documentCustomerId
  );

  if (itemIndex !== -1) {
    const repoItemToUpdate = { ...mockRepositoryItems[itemIndex] };
    console.log(`[UPSERT REPO] Found existing client-specific item to update. ID: ${repoItemToUpdate.id}, Name: ${repoItemToUpdate.name}`);
    
    repoItemToUpdate.defaultRate = itemFromDocument.rate;
    repoItemToUpdate.currencyCode = documentCurrencyCode;

    if (isOrderFormItem) {
        const orderItem = itemFromDocument as OrderFormItem;
        if (orderItem.procurementPrice !== undefined) {
            repoItemToUpdate.defaultProcurementPrice = orderItem.procurementPrice;
        }
        if (orderItem.vendorName !== undefined) { // Allow empty string to clear vendor
            repoItemToUpdate.defaultVendorName = orderItem.vendorName;
        }
    }
    mockRepositoryItems[itemIndex] = repoItemToUpdate;
    console.log(`[UPSERT REPO] Updated to:`, JSON.parse(JSON.stringify(repoItemToUpdate)));
    return { ...mockRepositoryItems[itemIndex] };
  } else {
    console.log(`[UPSERT REPO] No existing client-specific item for "${description}" & customer "${documentCustomerName}". Creating new.`);
    const newItemData: Omit<RepositoryItem, 'id' | 'createdAt'> = {
      name: description,
      defaultRate: itemFromDocument.rate,
      currencyCode: documentCurrencyCode,
      customerId: documentCustomerId,
      customerName: documentCustomerName,
    };
    if (isOrderFormItem) {
        const orderItem = itemFromDocument as OrderFormItem;
        newItemData.defaultProcurementPrice = orderItem.procurementPrice;
        newItemData.defaultVendorName = orderItem.vendorName;
    }
    const createdItem = await createRepositoryItem(newItemData);
    return { ...createdItem };
  }
};


// --- Purchase Order Functions ---
export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  return mockPurchaseOrders.map(po => ({...po, items: po.items.map(item => ({...item}))}));
};

export const getPurchaseOrderById = async (id: string): Promise<PurchaseOrder | undefined> => {
  const po = mockPurchaseOrders.find(p => p.id === id);
  return po ? {...po, items: po.items.map(item => ({...item}))} : undefined;
};

export const createPurchaseOrder = async (data: Omit<PurchaseOrder, 'id' | 'createdAt' | 'grandTotalVendorPayable' | 'items'> & { items: Omit<PurchaseOrderItem, 'id' | 'totalVendorPayable'>[] }): Promise<PurchaseOrder> => {
  const processedItems = data.items.map(item => ({
    ...item,
    id: generateId('po_item'),
    totalVendorPayable: (item.quantity || 0) * (item.procurementPrice || 0),
  }));

  const grandTotalVendorPayable = processedItems.reduce((sum, item) => sum + item.totalVendorPayable, 0);

  const newPO: PurchaseOrder = {
    ...data,
    id: generateId('po'),
    items: processedItems,
    grandTotalVendorPayable,
    createdAt: new Date(),
  };
  mockPurchaseOrders.push(newPO);
  return {...newPO, items: newPO.items.map(item => ({...item}))};
};

export const updatePurchaseOrder = async (id: string, data: Partial<Omit<PurchaseOrder, 'id' | 'createdAt' | 'grandTotalVendorPayable' | 'items'>> & { items?: Omit<PurchaseOrderItem, 'id' | 'totalVendorPayable'>[] }): Promise<PurchaseOrder | null> => {
  const index = mockPurchaseOrders.findIndex(po => po.id === id);
  if (index === -1) return null;

  const existingPO = mockPurchaseOrders[index];
  let updatedItems = existingPO.items;
  let grandTotalVendorPayable = existingPO.grandTotalVendorPayable;

  if (data.items) {
    updatedItems = data.items.map(item => ({
      ...item,
      id: (item as any).id || generateId('po_item'),
      totalVendorPayable: (item.quantity || 0) * (item.procurementPrice || 0),
    }));
    grandTotalVendorPayable = updatedItems.reduce((sum, item) => sum + item.totalVendorPayable, 0);
  }

  mockPurchaseOrders[index] = {
    ...existingPO,
    ...data,
    items: updatedItems,
    grandTotalVendorPayable,
  };
  return {...mockPurchaseOrders[index], items: mockPurchaseOrders[index].items.map(item => ({...item}))};
};

export const deletePurchaseOrder = async (id: string): Promise<boolean> => {
  const initialLength = mockPurchaseOrders.length;
  mockPurchaseOrders = mockPurchaseOrders.filter(po => po.id !== id);
  return mockPurchaseOrders.length < initialLength;
};

export const deletePurchaseOrdersByOrderFormId = async (orderFormId: string): Promise<boolean> => {
  const initialLength = mockPurchaseOrders.length;
  mockPurchaseOrders = mockPurchaseOrders.filter(po => po.orderFormId !== orderFormId);
  return mockPurchaseOrders.length < initialLength;
};


export const getNextPoNumber = async (): Promise<string> => {
    const prefix = "PO-"; // POs usually have a simple prefix
    if (mockPurchaseOrders.length === 0) {
        return `${prefix}001`;
    }
    const lastPO = mockPurchaseOrders.sort((a,b) => {
        const numA = parseInt(a.poNumber.substring(prefix.length), 10) || 0;
        const numB = parseInt(b.poNumber.substring(prefix.length), 10) || 0;
        return numA - numB;
    })[mockPurchaseOrders.length - 1];

    try {
        const num = parseInt(lastPO.poNumber.substring(prefix.length)) || 0;
        return `${prefix}${(num + 1).toString().padStart(3, '0')}`;
    } catch (e) {
        // Fallback for safety, though should not happen if PO numbers are consistent
        return `${prefix}${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`;
    }
};

// Reset function for testing if needed
export const resetAllMockData = () => {
  mockCustomers = [ /* initial customers */ ];
  mockInvoices = [ /* initial invoices */ ];
  mockOrderForms = [ /* initial order forms */ ];
  mockTermsTemplates = [ /* initial terms templates */ ];
  mockMsaTemplates = [ /* initial msa templates */ ];
  mockCoverPageTemplates = [ /* initial cover page templates */ ];
  mockRepositoryItems = [ /* initial repository items */ ];
  mockPurchaseOrders = [ /* initial purchase orders */ ];
};

// Function to log all data for debugging
export const logAllData = () => {
  console.log("Mock Customers:", JSON.parse(JSON.stringify(mockCustomers)));
  console.log("Mock Invoices:", JSON.parse(JSON.stringify(mockInvoices)));
  console.log("Mock Order Forms:", JSON.parse(JSON.stringify(mockOrderForms)));
  console.log("Mock Terms Templates:", JSON.parse(JSON.stringify(mockTermsTemplates)));
  console.log("Mock MSA Templates:", JSON.parse(JSON.stringify(mockMsaTemplates)));
  console.log("Mock Cover Page Templates:", JSON.parse(JSON.stringify(mockCoverPageTemplates)));
  console.log("Mock Repository Items:", JSON.parse(JSON.stringify(mockRepositoryItems)));
  console.log("Mock Purchase Orders:", JSON.parse(JSON.stringify(mockPurchaseOrders)));
};

