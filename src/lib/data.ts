
import type { Customer, Invoice, InvoiceItem, OrderForm,BrandingSettings, OrderFormItem, AdditionalChargeItem, TermsTemplate, MsaTemplate, CoverPageTemplate, RepositoryItem, PurchaseOrder, PurchaseOrderItem, User, PlanType ,RepositoryItemFormData} from '@/types';
import type { AdditionalChargeFormData , BrandingSettingsFormData} from './schemas';
import { securedApiCall } from './api';
import { format } from 'date-fns';
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

// --- Mock Data ---
let mockCustomers: Customer[] = [
  { id: 'cust_1', firstname: '',lastname:'', email: 'alice@example.com', phone: '123-456-7890', currency: 'INR',company:{name:'',email:'',street: '123 Rabbit Hole', city: 'Wonderland', state: 'WL', zip: '12345', country: 'Fairyland'}, billingAddress: { street: '123 Rabbit Hole', city: 'Wonderland', state: 'WL', zip: '12345', country: 'Fairyland' }, shippingAddress: { street: '123 Rabbit Hole', city: 'Wonderland', state: 'WL', zip: '12345', country: 'Fairyland' }, createdAt: new Date('2023-01-15') },
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
    id: 'po_1', poNumber: 'PO-001', vendorName: 'Scope Masters', orderFormId: 'of_1', orderFormNumber: 'OF-001', currencyCode: 'INR',
    issueDate: new Date('2023-05-02'),
    items: [{ id: 'poi_1_1', description: 'Initial Project Scoping', quantity: 1, procurementPrice: 2000, totalVendorPayable: 2000 }],
    grandTotalVendorPayable: 2000, status: 'Issued', createdAt: new Date('2023-05-02')
  },
  {
    id: 'po_2', poNumber: 'PO-002', vendorName: 'Dev Experts Inc.', orderFormId: 'of_1', orderFormNumber: 'OF-001', currencyCode: 'INR',
    issueDate: new Date('2023-05-03'),
    items: [{ id: 'poi_2_1', description: 'Phase 1 Development Estimate', quantity: 1, procurementPrice: 45000, totalVendorPayable: 45000 }],
    grandTotalVendorPayable: 45000, status: 'Draft', createdAt: new Date('2023-05-03')
  }
];

let mockBrandingSettings: BrandingSettings = {
  id: 'global_branding_settings', // Fixed ID for the single global settings object
  invoicePrefix: "INV-",
  orderFormPrefix: "OF-",
  name: "Your Awesome Company LLC",
  street: "123 Main Street",
  city: "Anytown",
  state: "CA",
  zip: "90210",
  country: "USA",
  phone: "(555) 123-4567",
  email: "contact@example.com",
  logoUrl: null, // Default to null, can be set via UI
  signatureUrl: null, // Default to null, can be set via UI
  createdAt: new Date('2023-01-01T00:00:00.000Z'),
  updatedAt: new Date('2023-01-01T00:00:00.000Z'),
};

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
// --- Customer Data Operations ---

  // Get all customers (pichle discussion ke according thoda sa sudhara hua)
  export async function getCustomers(): Promise<Customer[]> {
      console.log("DEBUG: [data.ts] getCustomers called.");
      try {
          const customersFromApi = await securedApiCall<Customer[]>('/api/customers', {
              method: 'GET',
          });

          if (customersFromApi && Array.isArray(customersFromApi)) {
              return customersFromApi.map(c => ({
                  ...c,
                  // Make sure createdAt is Date | null in your Customer type
                  createdAt: c.createdAt ? new Date(c.createdAt) : null,
                  // Agar Customer type mein koi aur date field hai, use bhi parse karein
              }));
          } else {
              console.warn('API returned no customers or an invalid response. Returning empty array.');
              return [];
          }
      } catch (error) {
          console.error('Failed to fetch customers from backend:', error);
          console.warn('Falling back to mock customers due to API error.');
          // Mock data ko bhi consistent banayein
          return mockCustomers.map(c => ({
              ...c,
              createdAt: c.createdAt ? new Date(c.createdAt) : null,
              // Agar mock data mein dates string hain aur type Date | null hai
          }));
      }
  }

  // Get customer by ID (pichle discussion ke according sudhara hua)
  export async function getCustomerById(id: string): Promise<Customer | undefined> {
      console.log(`DEBUG: [data.ts] getCustomerById called for ID: ${id}`);
      try {
          const customer = await securedApiCall<Customer>(`/api/customers/${id}`, {
              method: 'GET',
          });

          if (customer) {
              // Make sure createdAt is Date | null in your Customer type
              return {
                  ...customer,
                  createdAt: customer.createdAt ? new Date(customer.createdAt) : null,
                  // Agar Customer type mein koi aur date field hai, use bhi parse karein
              };
          }
          return undefined; // Customer not found
      } catch (error) {
          console.error(`Failed to fetch customer with ID ${id}:`, error);
          console.warn('Falling back to mock customer due to API error.');
          // Fallback to mock data
          const mockCustomer = mockCustomers.find(c => c.id === id);
          if (mockCustomer) {
              return {
                  ...mockCustomer,
                  createdAt: mockCustomer.createdAt ? new Date(mockCustomer.createdAt) : null,
              };
          }
          return undefined;
      }
  }
  export async function createCustomer(customerData: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
      console.log("DEBUG: [data.ts] createCustomer called with data:", customerData);
      try {
          // securedApiCall will typically return Customer data on success for POST
          const newCustomer = await securedApiCall<Customer>('/api/customers', { // <--- Here, expecting Customer
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(customerData),
          });

          // Add a check here: If backend is configured to return null on certain POST success cases (less common but possible)
          // Or if securedApiCall can internally return null if response.json() fails or is empty.
          if (!newCustomer) {
              throw new Error("API did not return customer data after creation.");
          }
          return newCustomer;
      } catch (error) {
          console.error('Failed to create customer:', error);
          throw error;
      }
  }

  // Update an existing customer
  export async function updateCustomer(id: string, customerData: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<Customer> {
      console.log(`DEBUG: [data.ts] updateCustomer called for ID ${id} with data:`, customerData);
      try {
          const updatedCustomer = await securedApiCall<Customer>(`/api/customers/${id}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(customerData),
          });
      if (!updatedCustomer) { // <--- This check is now required and correct
          throw new Error(`API did not return customer data after updating ID: ${id}`);
      }
      return updatedCustomer;
      } catch (error) {
          console.error(`Failed to update customer with ID ${id}:`, error);
          throw error; // Re-throw the error
      }
  }

  // Delete a customer
  export async function deleteCustomer(id: string): Promise<boolean> { // Change return type to Promise<boolean>
      console.log(`DEBUG: [data.ts] deleteCustomer called for ID: ${id}`);
      try {
          await securedApiCall<void>(`/api/customers/${id}`, {
              method: 'DELETE',
          });
          console.log(`Customer with ID ${id} deleted successfully.`);
          return true; // Explicitly return true on success
      } catch (error) {
          console.error(`Failed to delete customer with ID ${id}:`, error);
          throw error; // Re-throw the error so `removeCustomer` can catch it and return false
      }
  }


// --- Invoice Functions ---
    // --- Invoice Functions ---
    const safeParseJsonb = (data: any) => {
        if (typeof data === 'string' && data.trim() !== '') {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Error parsing JSONB string:", data, e);
            return [];
        }
        }
        if (Array.isArray(data)) {
        return data;
        }
        return []; // null, undefined, या अन्य प्रकारों के लिए खाली सरणी पर डिफ़ॉルト
    };

    export async function getInvoices(): Promise<Invoice[]> {
        console.log("DEBUG: [data.ts] getInvoices called (API call).");
        try {
            const invoicesFromApi = await securedApiCall<Invoice[]>('/api/invoices', {
                method: 'GET',
            });

            if (invoicesFromApi && Array.isArray(invoicesFromApi)) {
                return invoicesFromApi.map(inv => ({
        ...inv,
                    // JSONB फ़ील्ड को पार्स करें
                    items: safeParseJsonb(inv.items),
                    additionalCharges: safeParseJsonb(inv.additionalCharges),

                    // तारीख स्ट्रिंग को Date objects में पार्स करें
                issueDate: inv.issueDate instanceof Date ? inv.issueDate : (inv.issueDate ? new Date(inv.issueDate) : null),
        dueDate: inv.dueDate instanceof Date ? inv.dueDate : (inv.dueDate ? new Date(inv.dueDate) : null),
                    serviceStartDate: inv.serviceStartDate instanceof Date ? inv.serviceStartDate : (inv.serviceStartDate ? new Date(inv.serviceStartDate) : null),
                    serviceEndDate: inv.serviceEndDate instanceof Date ? inv.serviceEndDate : (inv.serviceEndDate ? new Date(inv.serviceEndDate) : null),
                    createdAt: inv.createdAt instanceof Date ? inv.createdAt : (inv.createdAt ? new Date(inv.createdAt) : null),
                        }));
            } else {
                console.warn('API returned no invoices or an invalid response. Returning empty array.');
                return [];
            }
        } catch (error) {
            console.error('Failed to fetch invoices from backend:', error);
            throw error; // त्रुटि को आगे बढ़ाएं ताकि UI इसे संभाल सके
        }
    }




export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  try {
    const invoice = await securedApiCall<Invoice>(`/api/invoices/${id}`, {
      method: 'GET',
    });

    if (!invoice) return undefined;

    return {
      ...invoice,
      items: safeParseJsonb(invoice.items),
      additionalCharges: safeParseJsonb(invoice.additionalCharges),
      issueDate: invoice.issueDate ? new Date(invoice.issueDate) : null,
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
      serviceStartDate: invoice.serviceStartDate ? new Date(invoice.serviceStartDate) : null,
      serviceEndDate: invoice.serviceEndDate ? new Date(invoice.serviceEndDate) : null,
      createdAt: invoice.createdAt ? new Date(invoice.createdAt) : null,
    };
  } catch (error) {
    console.error(`Failed to fetch invoice by ID ${id}:`, error);
    return undefined;
  }
}    type CreateInvoiceInputData = Omit<Invoice,
        'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'discountAmount' | 'customerName' | 'currencyCode' // These are calculated or derived by backend
    > & {
        items: Omit<InvoiceItem, 'id' | 'amount'>[]; // Frontend provides items without IDs/amounts
        additionalCharges?: AdditionalChargeFormData[]; // Frontend provides additional charges
    };


    export async function createInvoice(data: CreateInvoiceInputData): Promise<Invoice | null> {
        console.log("DEBUG: [data.ts] createInvoice called (API call) with data:", data);

        try {
            // Frontend should send the raw data, backend handles calculation and customer lookup.
            const newInvoice = await securedApiCall<Invoice>('/api/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data), // Send the raw data as JSON string to the backend
            });

            if (!newInvoice) {
                throw new Error("API did not return invoice data after creation.");
            }

            // Parse JSONB and dates from the returned invoice data
            return {
                ...newInvoice,
                items: safeParseJsonb(newInvoice.items),
                additionalCharges: safeParseJsonb(newInvoice.additionalCharges),
                issueDate: newInvoice.issueDate instanceof Date ? newInvoice.issueDate : (newInvoice.issueDate ? new Date(newInvoice.issueDate) : null),
                dueDate: newInvoice.dueDate instanceof Date ? newInvoice.dueDate : (newInvoice.dueDate ? new Date(newInvoice.dueDate) : null),
                serviceStartDate: newInvoice.serviceStartDate instanceof Date ? newInvoice.serviceStartDate : (newInvoice.serviceStartDate ? new Date(newInvoice.serviceStartDate) : null),
                serviceEndDate: newInvoice.serviceEndDate instanceof Date ? newInvoice.serviceEndDate : (newInvoice.serviceEndDate ? new Date(newInvoice.serviceEndDate) : null),
                createdAt: newInvoice.createdAt instanceof Date ? newInvoice.createdAt : (newInvoice.createdAt ? new Date(newInvoice.createdAt) : null),
    };
        } catch (error) {
            console.error('Failed to create invoice via API:', error);
            throw error; // Re-throw the error for UI to handle
        }
    }

    // updateInvoice function - you should also connect this to your backend's PUT route
    type UpdateInvoiceInputData = Partial<Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'discountAmount' | 'customerName' | 'currencyCode'>> &
                                { items?: Omit<InvoiceItem, 'id' | 'amount'>[], additionalCharges?: AdditionalChargeFormData[] };

    export async function updateInvoice(id: string, data: UpdateInvoiceInputData): Promise<Invoice | null> {
        console.log(`DEBUG: [data.ts] updateInvoice called (API call) for ID ${id} with data:`, data);
        try {
            const payload = {
        ...data,
                // Format Date objects to ISO strings before sending to API
                issueDate: data.issueDate instanceof Date ? format(data.issueDate, 'yyyy-MM-dd') : data.issueDate,
                dueDate: data.dueDate instanceof Date ? format(data.dueDate, 'yyyy-MM-dd') : data.dueDate,
                serviceStartDate: data.serviceStartDate instanceof Date ? format(data.serviceStartDate, 'yyyy-MM-dd') : data.serviceStartDate,
                serviceEndDate: data.serviceEndDate instanceof Date ? format(data.serviceEndDate, 'yyyy-MM-dd') : data.serviceEndDate,
                // items and additionalCharges should be stringified if your backend expects JSON strings
                // If your backend expects arrays, remove JSON.stringify here and ensure the type is correct
     items: data.items,
  additionalCharges: data.additionalCharges,};
  console.log("DEBUG: [updateInvoice] Payload being sent to backend:", payload);

            const updatedInvoice = await securedApiCall<Invoice>(`/api/invoices/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload), // Send the updated data as JSON string to the backend
            });

            if (updatedInvoice) {
                    

            // Parse JSONB and dates from the returned invoice data
            return {
                ...updatedInvoice,
                items: safeParseJsonb(updatedInvoice.items),
                additionalCharges: safeParseJsonb(updatedInvoice.additionalCharges),
                issueDate: updatedInvoice.issueDate instanceof Date ? updatedInvoice.issueDate : (updatedInvoice.issueDate ? new Date(updatedInvoice.issueDate) : null),
                dueDate: updatedInvoice.dueDate instanceof Date ? updatedInvoice.dueDate : (updatedInvoice.dueDate ? new Date(updatedInvoice.dueDate) : null),
                serviceStartDate: updatedInvoice.serviceStartDate instanceof Date ? updatedInvoice.serviceStartDate : (updatedInvoice.serviceStartDate ? new Date(updatedInvoice.serviceStartDate) : null),
                serviceEndDate: updatedInvoice.serviceEndDate instanceof Date ? updatedInvoice.serviceEndDate : (updatedInvoice.serviceEndDate ? new Date(updatedInvoice.serviceEndDate) : null),
                createdAt: updatedInvoice.createdAt instanceof Date ? updatedInvoice.createdAt : (updatedInvoice.createdAt ? new Date(updatedInvoice.createdAt) : null),
            };
            }
            return null;
        } catch (error) {
            console.error(`Failed to update invoice with ID ${id} via API:`, error);
            throw error;
        }
    }

    // deleteInvoice function - connect to backend DELETE route
    export async function deleteInvoice(id: string): Promise<boolean> {
        console.log(`DEBUG: [data.ts] deleteInvoice called (API call) for ID: ${id}`);
        try {
            await securedApiCall<void>(`/api/invoices/${id}`, {
                method: 'DELETE',
            });
            console.log(`Invoice with ID ${id} deleted successfully via API.`);
            return true; // Indicate success
        } catch (error) {
            console.error(`Failed to delete invoice with ID ${id} via API:`, error);
            throw error;
        }
    }

  export async function getNextInvoiceNumber(): Promise<string> {
    const maxNum = mockInvoices.reduce((max, inv) => {
      const num = parseInt(inv.invoiceNumber.split('-')[1] || '0');
      return num > max ? num : max;
    }, 0);
    return `INV-${String(maxNum + 1).padStart(3, '0')}`;
  }

// --- OrderForm Functions ---


// --- Fetch All Order Forms (GET) ---
export async function getOrderForms(): Promise<OrderForm[]> {
    console.log("DEBUG: [data.ts] getOrderForms called (API call).");
    try {
        const orderFormsFromApi = await securedApiCall<OrderForm[]>('/api/order-forms', {
            method: 'GET',
        });

        if (orderFormsFromApi && Array.isArray(orderFormsFromApi)) {
            return orderFormsFromApi.map(of => ({
      ...of,
                // Parse date strings to Date objects
                issueDate: of.issueDate ? new Date(of.issueDate) : null,
                validUntilDate: of.validUntilDate ? new Date(of.validUntilDate) : null,
                serviceStartDate: of.serviceStartDate ? new Date(of.serviceStartDate) : null,
                serviceEndDate: of.serviceEndDate ? new Date(of.serviceEndDate) : null,
                createdAt: of.createdAt ? new Date(of.createdAt) : null,
                    // Parse JSONB strings to arrays/objects
                items: safeParseJsonb(of.items),
                additionalCharges: safeParseJsonb(of.additionalCharges),
            }));
        } else {
            console.warn('API returned no order forms or an invalid response. Returning empty array.');
            return [];
        }
    } catch (error) {
        console.error('Failed to fetch order forms from backend:', error);
        // If you still want a mock data fallback, keep this block:
        // console.warn('Falling back to mock order forms due to API error.');
        // return mockOrderForms.map(of => ({
        //     ...of,
        //     issueDate: of.issueDate instanceof Date ? of.issueDate : (of.issueDate ? new Date(of.issueDate) : null),
        //     validUntilDate: of.validUntilDate instanceof Date ? of.validUntilDate : (of.validUntilDate ? new Date(of.validUntilDate) : null),
        //     serviceStartDate: of.serviceStartDate instanceof Date ? of.serviceStartDate : (of.serviceStartDate ? new Date(of.serviceStartDate) : null),
        //     serviceEndDate: of.serviceEndDate instanceof Date ? of.serviceEndDate : (of.serviceEndDate ? new Date(of.serviceEndDate) : null),
        //     createdAt: of.createdAt instanceof Date ? of.createdAt : (of.createdAt ? new Date(of.createdAt) : null),
        // }));
        return []; // If no mock fallback, return empty array on error
    }
}


// --- Fetch Single Order Form by ID (GET) ---
export async function getOrderFormByIdData(id: string): Promise<OrderForm | undefined> { // Renamed from getOrderFormById to getOrderFormByIdData for clarity
    console.log("DEBUG: [data.ts] getOrderFormByIdData called for ID:", id);
    try {
        const orderFormFromApi = await securedApiCall<OrderForm>(`/api/order-forms/${id}`, {
            method: 'GET',
        });

        if (orderFormFromApi) {
            // Parse date strings and JSONB strings from the API response
            const parsedOrderForm: OrderForm = {
                ...orderFormFromApi,
                issueDate: orderFormFromApi.issueDate ? new Date(orderFormFromApi.issueDate) : null,
                validUntilDate: orderFormFromApi.validUntilDate ? new Date(orderFormFromApi.validUntilDate) : null,
                serviceStartDate: orderFormFromApi.serviceStartDate ? new Date(orderFormFromApi.serviceStartDate) : null,
                serviceEndDate: orderFormFromApi.serviceEndDate ? new Date(orderFormFromApi.serviceEndDate) : null,
                createdAt: orderFormFromApi.createdAt ? new Date(orderFormFromApi.createdAt) : null,
                  items: safeParseJsonb(orderFormFromApi.items),
                additionalCharges: safeParseJsonb(orderFormFromApi.additionalCharges),
            };

            // If customerName and currencyCode are not directly returned by the backend's OrderForm object,
            // you might need to fetch the customer separately and enrich the data here,
            // or handle it in the component.
            // Based on your backend logs, customer data is fetched separately.
            // So, for now, we'll return the parsedOrderForm as is.
            // The `fetchOrderFormById` in actions.ts will then call `fetchCustomerById`.

            return parsedOrderForm;
        } else {
            console.warn(`Order Form with ID ${id} not found on backend.`);
            return undefined; // Return undefined if API returns null/empty for a single record
        }
    } catch (error) {
        console.error(`Failed to fetch order form with ID ${id} from backend:`, error);
        // If you still want a mock data fallback for single item, keep this block:
        // const orderForm = mockOrderForms.find(of => of.id === id);
        // if (orderForm) {
        //     const customer = mockCustomers.find(c => c.id === orderForm.customerId);
        //     return {
        //         ...orderForm,
        //         customerName: customer?.name || 'Unknown Customer',
        //         currencyCode: customer?.currency || orderForm.currencyCode || 'USD'
        //     };
        // }
        return undefined; // Return undefined on error
    }
}

  export type CreateOrderFormInputData = Omit<OrderForm,
    'id' | 'createdAt' | 'updatedAt' | 'total' | 'subtotal' | 'taxAmount' | 'discountAmount' | // ये बैकएंड द्वारा गणना किए जाते हैं
    'currencyCode' | 'customerActualName' | 'orderFormNumber' // ये बैकएंड द्वारा ग्राहक से प्राप्त/उत्पन्न किए जाते हैं
  > & {
    items: OrderFormItem[]; // API को सीधे OrderFormItem[] भेजें
    additionalCharges?: AdditionalChargeFormData[]; // API को सीधे AdditionalChargeFormData[] भेजें
  };

  // PUT (Update) के लिए इनपुट डेटा का प्रकार
  // इसमें वे फ़ील्ड शामिल नहीं होने चाहिए जो बैकएंड द्वारा उत्पन्न/गणना किए जाते हैं।
  // 'id' को शामिल किया गया है क्योंकि यह अपडेट के लिए आवश्यक है।


  // --- Create Order Form (POST) ---
  export async function createOrderFormDataLayer(data: Partial<CreateOrderFormInputData>): Promise<OrderForm | null> {
    console.log("DEBUG: createOrderFormDataLayer called with data:", data);

    try {
      // API को भेजने से पहले डेट ऑब्जेक्ट्स को ISO स्ट्रिंग में फ़ॉर्मेट करें
      const payload = {
        ...data,
        issueDate: data.issueDate ? format(data.issueDate, 'yyyy-MM-dd') : null,
        validUntilDate: data.validUntilDate ? format(data.validUntilDate, 'yyyy-MM-dd') : null,
        serviceStartDate: data.serviceStartDate ? format(data.serviceStartDate, 'yyyy-MM-dd') : null,
        serviceEndDate: data.serviceEndDate ? format(data.serviceEndDate, 'yyyy-MM-dd') : null,
        // items: safeParseJsonb(data.items),
        // additionalCharges: safeParseJsonb(data.additionalCharges),

        // items और additionalCharges को सीधे भेजा जाएगा, API उन्हें JSON.stringify() करेगा
      };

      const newOrderForm = await securedApiCall<OrderForm>('/api/order-forms', {
        method: 'POST',
        body: JSON.stringify(payload), // payload को JSON स्ट्रिंग के रूप में भेजें
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // API से लौटे डेटा को parse करें
      if (newOrderForm) {
        return {
          ...newOrderForm,
          // JSONB fields from DB will come as parsed objects if your API parses them.
          // If they come as strings, you might need to parse them here.
        //   items: newOrderForm.items as OrderFormItem[],
        //   additionalCharges: (newOrderForm.additionalCharges || []) as AdditionalChargeItem[],

          // Ensure date strings are converted to Date objects for frontend use
          issueDate: newOrderForm.issueDate ? new Date(newOrderForm.issueDate) : null,
          validUntilDate: newOrderForm.validUntilDate ? new Date(newOrderForm.validUntilDate) : null,
          serviceStartDate: newOrderForm.serviceStartDate ? new Date(newOrderForm.serviceStartDate) : null,
          serviceEndDate: newOrderForm.serviceEndDate ? new Date(newOrderForm.serviceEndDate) : null,
          createdAt: newOrderForm.createdAt ? new Date(newOrderForm.createdAt) : null,
          items: safeParseJsonb(newOrderForm.items), // <--- ADD THIS
        additionalCharges: safeParseJsonb(newOrderForm.additionalCharges), // <--- AND THIS
      
        };
      }

      return null;
    } catch (error) {
      console.error("Failed to create order form:", error);
      throw error; // त्रुटि को आगे बढ़ाएं ताकि कॉलिंग कंपोनेंट इसे हैंडल कर सके
    }
  }

  // --- Update Order Form (PUT) ---
 
export async function updateOrderFormDataLayer(id: string, data: Partial<OrderForm>): Promise<OrderForm | null> {
    console.log("DEBUG: [data.ts] updateOrderFormDataLayer called for ID:", id, "with data:", data);

    try {
        // First, get the existing order form to ensure we have all required data
        const existingOrderForm = await getOrderFormByIdData(id);
        if (!existingOrderForm) {
            console.error("Order form not found for update:", id);
            return null;
        }

        // Prepare the payload with proper data handling
        const payload = {
            ...data,
            // Format Date objects to ISO strings before sending to API
            issueDate: data.issueDate instanceof Date ? format(data.issueDate, 'yyyy-MM-dd') : data.issueDate,
            validUntilDate: data.validUntilDate instanceof Date ? format(data.validUntilDate, 'yyyy-MM-dd') : data.validUntilDate,
            serviceStartDate: data.serviceStartDate instanceof Date ? format(data.serviceStartDate, 'yyyy-MM-dd') : data.serviceStartDate,
            serviceEndDate: data.serviceEndDate instanceof Date ? format(data.serviceEndDate, 'yyyy-MM-dd') : data.serviceEndDate,
            
            // Ensure items and additionalCharges are always arrays
            items: data.items || existingOrderForm.items || [],
            additionalCharges: data.additionalCharges || existingOrderForm.additionalCharges || [],
        };

        console.log("DEBUG: [data.ts] Sending payload to API:", JSON.stringify(payload, null, 2));

        const updatedOrderForm = await securedApiCall<OrderForm>(`/api/order-forms/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (updatedOrderForm) {
            return {
                ...updatedOrderForm,
                // Parse API returned data back to Date objects and arrays
                items: safeParseJsonb(updatedOrderForm.items) || [],
                additionalCharges: safeParseJsonb(updatedOrderForm.additionalCharges) || [],
                issueDate: updatedOrderForm.issueDate ? new Date(updatedOrderForm.issueDate) : null,
                validUntilDate: updatedOrderForm.validUntilDate ? new Date(updatedOrderForm.validUntilDate) : null,
                serviceStartDate: updatedOrderForm.serviceStartDate ? new Date(updatedOrderForm.serviceStartDate) : null,
                serviceEndDate: updatedOrderForm.serviceEndDate ? new Date(updatedOrderForm.serviceEndDate) : null,
                createdAt: updatedOrderForm.createdAt ? new Date(updatedOrderForm.createdAt) : null,
               };
        }
        return null;
    } catch (error) {
        console.error("Failed to update order form:", error);
        throw error;
    }
}

// Add a helper function to safely parse JSONB data
// function safeParseJsonb(data: any): any[] {
//     if (Array.isArray(data)) {
//         return data;
//     }
//     if (typeof data === 'string') {
//         try {
//             const parsed = JSON.parse(data);
//             return Array.isArray(parsed) ? parsed : [];
//         } catch {
//             return [];
//         }
//     }
//     return [];
// }

export async function deleteOrderForm(id: string): Promise<boolean> {
      console.log(`DEBUG: [data.ts] deleteOrderform called for ID: ${id}`);
      try {
          await securedApiCall<void>(`/api/order-forms/${id}`, {
              method: 'DELETE',
          });
          console.log(`Orderfrom with ID ${id} deleted successfully.`);
          return true;
        }catch (error) {
          console.error(`Failed to delete Orderfrom with ID ${id}:`, error);
          throw error; // Re-throw the error
      }
}

export async function getNextOrderFormNumber(): Promise<string> {
  const maxNum = mockOrderForms.reduce((max, of) => {
    const num = parseInt(of.orderFormNumber.split('-')[1] || '0');
    return num > max ? num : max;
  }, 0);
  return `OF-${String(maxNum + 1).padStart(3, '0')}`;
}

// --- TermsTemplate Functions ---
 export async function getTermsTemplates(): Promise<TermsTemplate[] | null> {
    console.log("API: Fetching all terms templates...");
    try {
        const response = await securedApiCall<TermsTemplate[]>('/api/terms-templates', {
            method: 'GET',
        });
        console.log("API: Successfully fetched terms templates.");
        return response;
    } catch (error) {
        console.error("API Error: Failed to fetch terms templates:", error);
       
        throw error; // Re-throw to be caught by the action/page
    }
}


export async function getTermsTemplateById(id: string): Promise<TermsTemplate | null | undefined> {
    console.log(`API: Fetching terms template with ID: ${id}`);
    try {
        const response = await securedApiCall<TermsTemplate>(`/api/terms-templates/${id}`, {
            method: 'GET',
        });
        console.log(`API: Successfully fetched terms template with ID: ${id}`);
        return response;
    } catch (error) {
        console.error(`API Error: Failed to fetch terms template with ID ${id}:`, error);
        // If not found, API might throw an error or return null/undefined depending on implementation
        // Re-throw if you want the calling action/page to handle the error,
        // or return undefined if you want to explicitly signal not found.
        if (error instanceof Response && error.status === 404) {
            return undefined; // Explicitly return undefined if 404 Not Found
        }
        throw error;
    }
}

export async function createTermsTemplate(data: Omit<TermsTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<TermsTemplate | null> {
    console.log("API: Creating terms template with data:", data);
    try {
        const newTemplate = await securedApiCall<TermsTemplate>('/api/terms-templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        console.log("API: Successfully created terms template:", newTemplate?.id);
        return newTemplate; // newTemplate here could be null if securedApiCall returns null
    } catch (error) {
        console.error("API Error: Failed to create terms template:", error);
        throw error; // This will cause the outer `saveTermsTemplate` action to throw
    }
}

export async function updateTermsTemplate(id: string, data: Partial<Omit<TermsTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TermsTemplate | null> {
    console.log(`API: Updating terms template ID: ${id} with data:`, data);
    try {
        const updatedTemplate = await securedApiCall<TermsTemplate>(`/api/terms-templates/${id}`, {
            method: 'PUT', // Or 'PATCH' if your API supports partial updates
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        console.log(`API: Successfully updated terms template with ID: ${id}`);
        return updatedTemplate;
    } catch (error) {
        console.error(`API Error: Failed to update terms template with ID ${id}:`, error);
        throw error;
    }
}

export async function deleteTermsTemplate(id: string): Promise<boolean> {
    console.log(`API: Deleting terms template with ID: ${id}`);
    try {
        await securedApiCall<void>(`/api/terms-templates/${id}`, {
            method: 'DELETE',
        });
        console.log(`API: Successfully deleted terms template with ID: ${id}`);
        return true; // Return true on successful deletion
    } catch (error) {
        console.error(`API Error: Failed to delete terms template with ID ${id}:`, error);
        return false; // Return false or re-throw based on desired error handling
    }
}


// --- MSA Template Functions ---

export async function getMsaTemplates(): Promise<MsaTemplate[]> {
    console.log("API: Fetching all MSA templates...");
    try {
        const response = await securedApiCall<MsaTemplate[]>('/api/msa-templates', {
            method: 'GET',
        });
        console.log("API: Successfully fetched MSA templates.");
        // Ensure the response is an array before returning
        return Array.isArray(response) ? response : [];
    } catch (error) {
        console.error("API Error: Failed to fetch MSA templates:", error);
        throw error; // Re-throw to be caught by the action/page
    }
}

export async function getMsaTemplateById(id: string): Promise<MsaTemplate | null | undefined> {
    // Note the return type now includes 'null' to match securedApiCall's potential return
    console.log(`API: Fetching MSA template with ID: ${id}`);
    try {
        const response = await securedApiCall<MsaTemplate>(`/api/msa-templates/${id}`, {
            method: 'GET',
        });
        console.log(`API: Successfully fetched MSA template with ID: ${id}`);
        return response; // securedApiCall can return null, which is now allowed by the return type
    } catch (error) {
        console.error(`API Error: Failed to fetch MSA template with ID ${id}:`, error);
        // If the API explicitly returns 404 for 'not found', you can return undefined
        if (error instanceof Response && error.status === 404) {
            return undefined;
        }
        throw error; // Re-throw for other types of errors
    }
    
}

export async function createMsaTemplate(
    data: Partial<Omit<MsaTemplate, 'id' | 'created_at' | 'updated_at'>> // Adjusted to match DB schema naming
): Promise<MsaTemplate | null> {
    console.log("API: Creating MSA template with data:", data);
    try {
        const newTemplate = await securedApiCall<MsaTemplate>('/api/msa-templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        console.log("API: Successfully created MSA template:", newTemplate?.id);
        return newTemplate;
    } catch (error) {
        console.error("API Error: Failed to create MSA template:", error);
        throw error;
    }
}

export async function updateMsaTemplate(
    id: string,
    data: Partial<Omit<MsaTemplate, 'id' | 'created_at' | 'updated_at'>> // Adjusted to match DB schema naming
): Promise<MsaTemplate | null> {
    console.log(`API: Updating MSA template ID: ${id} with data:`, data);
    try {
        const updatedTemplate = await securedApiCall<MsaTemplate>(`/api/msa-templates/${id}`, {
            method: 'PUT', // Or 'PATCH' if your API supports partial updates
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        console.log(`API: Successfully updated MSA template with ID: ${id}`);
        return updatedTemplate;
    } catch (error) {
        console.error(`API Error: Failed to update MSA template with ID ${id}:`, error);
        throw error;
    }
}

export async function deleteMsaTemplate(id: string): Promise<boolean> {
    console.log(`API: Deleting MSA template with ID: ${id}`);
    try {
        await securedApiCall<void>(`/api/msa-templates/${id}`, {
            method: 'DELETE',
        });
        console.log(`API: Successfully deleted MSA template with ID: ${id}`);
        return true;
    } catch (error) {
        console.error(`API Error: Failed to delete MSA template with ID ${id}:`, error);
        return false; // Return false on failure
    }
}


// --- Cover Page Template Functions ---

export async function getCoverPageTemplates(): Promise<CoverPageTemplate[]> {
    console.log("API: Fetching all cover page templates...");
    try {
        const response = await securedApiCall<CoverPageTemplate[]>('/api/cover-page-templates', {
            method: 'GET',
        });
        console.log("API: Successfully fetched cover page templates.");
        // Ensure the response is an array before returning
        return Array.isArray(response) ? response : [];
    } catch (error) {
        console.error("API Error: Failed to fetch cover page templates:", error);
        throw error; // Re-throw to be caught by the action/page
    }
}

export async function getCoverPageTemplateById(id: string): Promise<CoverPageTemplate | null | undefined> {
    // Note the return type now includes 'null' to match securedApiCall's potential return
    console.log(`API: Fetching cover page template with ID: ${id}`);
    try {
        const response = await securedApiCall<CoverPageTemplate>(`/api/cover-page-templates/${id}`, {
            method: 'GET',
        });
        console.log(`API: Successfully fetched cover page template with ID: ${id}`);
        return response; // securedApiCall can return null, which is now allowed by the return type
    } catch (error) {
        console.error(`API Error: Failed to fetch cover page template with ID ${id}:`, error);
        // If the API explicitly returns 404 for 'not found', you can return undefined
        if (error instanceof Response && error.status === 404) {
            return undefined;
}
        throw error; // Re-throw for other types of errors
    }
}


export async function createCoverPageTemplate(data: Omit<CoverPageTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<CoverPageTemplate | null> {
    // Note: Used 'created_at' and 'updated_at' to match Supabase schema fields
    console.log("API: Creating cover page template with data:", data);
    try {
        const newTemplate = await securedApiCall<CoverPageTemplate>('/api/cover-page-templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        console.log("API: Successfully created cover page template:", newTemplate?.id);
        return newTemplate;
    } catch (error) {
        console.error("API Error: Failed to create cover page template:", error);
        throw error;
    }
}

export async function updateCoverPageTemplate(
    id: string,
    data: Partial<Omit<CoverPageTemplate, 'id' | 'createdAt' | 'updated_at'>> // Note: Using 'created_at' and 'updated_at' to match DB, adjust if API sends 'createdAt'
): Promise<CoverPageTemplate | null> {
    console.log(`API: Updating cover page template ID: ${id} with data:`, data);
    try {
        const updatedTemplate = await securedApiCall<CoverPageTemplate>(`/api/cover-page-templates/${id}`, {
            method: 'PUT', // Or 'PATCH' depending on your backend
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        console.log(`API: Successfully updated cover page template with ID: ${id}`);
        // Ensure this 'updatedTemplate' is indeed not null here if successful
        return updatedTemplate; // If securedApiCall returns null on failure, this is fine
    } catch (error) {
        console.error(`API Error: Failed to update cover page template with ID ${id}:`, error);
        // Crucial: Re-throw the error so the calling action/component can catch it
        throw error;
}
}
export async function deleteCoverPageTemplate(id: string): Promise<boolean> {
    console.log(`API: Deleting cover page template with ID: ${id}`);
    try {
        await securedApiCall<void>(`/api/cover-page-templates/${id}`, {
            method: 'DELETE',
        });
        console.log(`API: Successfully deleted cover page template with ID: ${id}`);
        return true;
    } catch (error) {
        console.error(`API Error: Failed to delete cover page template with ID ${id}:`, error);
        return false; // Return false on failure
    }
}

// --- Repository Item Functions ---

export async function getRepositoryItems(): Promise<RepositoryItem[]> {
    console.log("data.ts: Fetching all repository items via API...");
    try {
        // securedApiCall will return null on network errors or non-2xx status codes
        const items = await securedApiCall<RepositoryItem[]>('/api/item-route', { method: 'GET' });
        // Ensure it's an array, even if API returns null for no data
        return Array.isArray(items) ? items : [];
    } catch (error) {
        console.error("data.ts Error: Failed to fetch repository items from backend:", error);
        // Rethrow or return an empty array based on your error handling strategy
        throw error;
    }
}


export async function getRepositoryItemById(id: string): Promise<RepositoryItem | undefined> {
    console.log(`data.ts: Fetching repository item by ID: ${id} via API...`);
    try {
        const item = await securedApiCall<RepositoryItem>(`/api/item-route/${id}`, { method: 'GET' });
        // securedApiCall should return null for 404s, so convert to undefined
        return item || undefined;
    } catch (error) {
        console.error(`data.ts Error: Failed to fetch repository item ID ${id} from backend:`, error);
        throw error;
    }
}

export async function createRepositoryItem(data: RepositoryItemFormData): Promise<RepositoryItem | null> {
    console.log("data.ts: Creating repository item via API with data:", data);
    try {
        const newItem = await securedApiCall<RepositoryItem>('/api/item-route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data), // Send the data to the backend
        });
        return newItem;
    } catch (error) {
        console.error("data.ts Error: Failed to create repository item via backend:", error);
        throw error;
    }
}

export async function updateRepositoryItem(id: string, data: Partial<RepositoryItemFormData>): Promise<RepositoryItem | null> {
    console.log(`data.ts: Updating repository item ID: ${id} via API with data:`, data);
    try {
        const updatedItem = await securedApiCall<RepositoryItem>(`/api/item-route/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data), // Send the partial data for update
        });
        return updatedItem;

    } catch (error) {
        console.error(`data.ts Error: Failed to update repository item ID ${id} via backend:`, error);
        throw error;
    }
}

export async function deleteRepositoryItem(id: string): Promise<boolean> {
    console.log(`data.ts: Deleting repository item ID: ${id} via API...`);
    try {
        // securedApiCall for DELETE typically returns void or handles success internally.
        // It should throw an error if the deletion failed (e.g., 404, 500).
        await securedApiCall<void>(`/api/item-route/${id}`, { method: 'DELETE' });
        return true; // If no error was thrown, assume success
    } catch (error) {
        console.error(`data.ts Error: Failed to delete repository item ID ${id} via backend:`, error);
        return false; // Indicate failure
    }
}

export async function upsertRepositoryItemFromOrderForm(
  itemFromDoc: { description: string; rate: number; procurementPrice?: number; vendorName?: string; currencyCode?: string; },
  orderFormCustomerId: string,
  orderFormCustomerName: string
): Promise<RepositoryItem | null> {

    // --- CRITICAL NULL/UNDEFINED CHECKS START ---
    if (!itemFromDoc) {
        console.error("[Data: upsertRepo] Error: itemFromDoc is null or undefined. Cannot process.");
        return null; // Or throw an error, depending on desired error handling
    }
    if (typeof itemFromDoc.description !== 'string' || itemFromDoc.description.trim() === '') {
        console.error("[Data: upsertRepo] Error: itemFromDoc.description is missing or not a string. Cannot process item:", itemFromDoc);
        return null; // Cannot proceed without a valid description
    }
    // --- CRITICAL NULL/UNDEFINED CHECKS END ---
  
  console.log("[Data: upsertRepo] Processing item from doc:", itemFromDoc.description, "for customer:", orderFormCustomerName, "(ID:", orderFormCustomerId, ")");

    const lowercasedDescription = itemFromDoc.description.toLowerCase(); // Cache this to avoid repeated calls

  const existingItemIndex = mockRepositoryItems.findIndex(
    repoItem =>
            repoItem.name.toLowerCase() === lowercasedDescription && // Use cached lowercasedDescription
      repoItem.customerId === orderFormCustomerId
  );

  if (existingItemIndex !== -1) {
    console.log("[Data: upsertRepo] Found existing client-specific item. Updating:", mockRepositoryItems[existingItemIndex].name);
    mockRepositoryItems[existingItemIndex].defaultRate = itemFromDoc.rate;
        mockRepositoryItems[existingItemIndex].defaultProcurementPrice = itemFromDoc.procurementPrice;
        mockRepositoryItems[existingItemIndex].defaultVendorName = itemFromDoc.vendorName;
    mockRepositoryItems[existingItemIndex].currencyCode = itemFromDoc.currencyCode;
        return { ...mockRepositoryItems[existingItemIndex] }; // Return a clone
  } else {
    // Try to find a global item to "clone" and make client-specific, or create brand new
    const globalItemIndex = mockRepositoryItems.findIndex(
            repoItem => repoItem.name.toLowerCase() === lowercasedDescription && !repoItem.customerId // Use cached lowercasedDescription
        );1

        const newItemData: RepositoryItemFormData  = {
      name: itemFromDoc.description,
      defaultRate: itemFromDoc.rate,
      defaultProcurementPrice: itemFromDoc.procurementPrice,
      defaultVendorName: itemFromDoc.vendorName,
            currencyCode: itemFromDoc.currencyCode ?? null,
      customerId: orderFormCustomerId,
      customerName: orderFormCustomerName,
            // createdAt and id will be handled by createRepositoryItem
    };
    
    if (globalItemIndex !== -1) {
        console.log("[Data: upsertRepo] Found global item. Creating client-specific version for:", itemFromDoc.description);
    } else {
        console.log("[Data: upsertRepo] No existing global or client-specific item found. Creating new client-specific item for:", itemFromDoc.description);
    }
        return createRepositoryItem(newItemData); // Assuming createRepositoryItem exists and handles default values and ID creation
  }
}

// You need to ensure createRepositoryItem and mockRepositoryItems are defined elsewhere in data.ts
// Example placeholder if not defined:
// interface RepositoryItem {
//     id: string;
//     name: string;
//     unit?: string; // Add if needed
//     defaultRate: number;
//     defaultProcurementPrice?: number;
//     defaultVendorName?: string;
//     currencyCode?: string;
//     customerId?: string;
//     customerName?: string;
//     createdAt: string;
//     updatedAt: string;
// }
// --- Purchase Order Functions ---

// --- Purchase Order Functions ---
export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  return mockPurchaseOrders.map(po => ({ ...po, issueDate: new Date(po.issueDate), createdAt: new Date(po.createdAt) }));
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined> {
  const po = mockPurchaseOrders.find(p => p.id === id);
  return po ? { ...po, issueDate: new Date(po.issueDate), createdAt: new Date(po.createdAt) } : undefined;
}

// For creating a new PO or getting data for a PO form (not from OF directly)
type CreatePurchaseOrderData = Omit<PurchaseOrder, 'id' | 'createdAt' | 'items' | 'grandTotalVendorPayable'> & {
  items: Omit<PurchaseOrderItem, 'id' | 'totalVendorPayable'>[];
};


export async function createPurchaseOrderDataLayer(data: CreatePurchaseOrderData): Promise<PurchaseOrder | null> {
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
    currencyCode: data.currencyCode || 'USD',
    issueDate: new Date(data.issueDate),
    items: processedItems,
    grandTotalVendorPayable: grandTotal,
    status: data.status || 'Draft',
    createdAt: new Date(),
  };
  mockPurchaseOrders.push(newOrder);
  return { ...newOrder };
}

type UpdatePurchaseOrderData = Partial<Omit<PurchaseOrder, 'id' | 'createdAt' | 'items' | 'grandTotalVendorPayable'>> & {
  items?: Omit<PurchaseOrderItem, 'id' | 'totalVendorPayable'>[];
};

export async function updatePurchaseOrderDataLayer(id: string, data: UpdatePurchaseOrderData): Promise<PurchaseOrder | null> {
  const index = mockPurchaseOrders.findIndex(po => po.id === id);
  if (index === -1) return null;

  const existingPO = mockPurchaseOrders[index];
  
  const itemsToProcess = data.items || existingPO.items.map(item => ({
    description: item.description,
    quantity: item.quantity,
    procurementPrice: item.procurementPrice,
  }));

  let grandTotal = 0;
  const processedItems: PurchaseOrderItem[] = itemsToProcess.map((item, idx) => {
    const totalItemPayable = (Number(item.quantity) || 0) * (Number(item.procurementPrice) || 0);
    grandTotal += totalItemPayable;
    return {
      id: data.items && data.items[idx] ? ((data.items[idx] as PurchaseOrderItem).id || generateId('poi')) : existingPO.items[idx]?.id || generateId('poi'),
      description: item.description,
      quantity: item.quantity,
      procurementPrice: item.procurementPrice,
      totalVendorPayable: totalItemPayable,
    };
  });

  mockPurchaseOrders[index] = {
    ...existingPO,
    ...data,
    currencyCode: data.currencyCode || existingPO.currencyCode,
    issueDate: data.issueDate ? new Date(data.issueDate) : new Date(existingPO.issueDate),
    items: processedItems,
    grandTotalVendorPayable: grandTotal,
    // orderFormId and orderFormNumber are not typically changed after PO creation from an OF.
    // If they are part of 'data', they will be updated. Otherwise, existing values are kept.
    orderFormId: data.orderFormId !== undefined ? data.orderFormId : existingPO.orderFormId,
    orderFormNumber: data.orderFormNumber !== undefined ? data.orderFormNumber : existingPO.orderFormNumber,
  };
  return { ...mockPurchaseOrders[index] };
}


export async function deletePurchaseOrderData(id: string): Promise<boolean> {
  const initialLength = mockPurchaseOrders.length;
  mockPurchaseOrders = mockPurchaseOrders.filter(po => po.id !== id);
  return mockPurchaseOrders.length < initialLength;
}

export async function deletePurchaseOrdersByOrderFormIdData(orderFormId: string): Promise<boolean> {
    const initialLength = mockPurchaseOrders.length;
    mockPurchaseOrders = mockPurchaseOrders.filter(po => po.orderFormId !== orderFormId);
    return mockPurchaseOrders.length !== initialLength;
}

export async function getNextPoNumberData(): Promise<string> {
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
//branding setting 
//     export async function getBrandingSettings(): Promise<any> {
//     console.log("API: Fetching branding settings...");
//     try {
//         const response = await securedApiCall('/api/branding-settings', {
//             method: 'GET',
//         });
//         return response;
//     } catch (error) {
//         console.error("API Error: Failed to fetch branding settings:", error);
//         throw error;
//     }
// }

// --- Branding Settings Data Operations ---
export async function getBrandingSettingsData(): Promise<any> {
  // Ensure the mockBrandingSettings has the id, createdAt, and updatedAt fields
 console.log("API: Fetching branding settings...");
    try {
        const response = await securedApiCall('/api/branding-settings', {
            method: 'GET',
        });
        return response;
    } catch (error) {
        console.error("API Error: Failed to fetch branding settings:", error);
        throw error;
    }
}
export async function updateBrandingSettingsData(data: BrandingSettingsFormData): Promise<BrandingSettings | null> { // <--- रिटर्न टाइप को बदलें
    console.log("API: Updating branding settings with data:", data);
    try {
        const payloadToSend = {
            ...data,
            logoUrl: data.logoUrl === '' ? null : data.logoUrl,
            signatureUrl: data.signatureUrl === '' ? null : data.signatureUrl,
        };

        const updatedSettings = await securedApiCall<BrandingSettings | null>('/api/branding-settings', { // <--- यहाँ भी 'null' जोड़ें
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payloadToSend),
        });

        // यदि updatedSettings null है, तो null लौटाएं
        if (!updatedSettings) {
            console.warn("API returned null for branding settings update.");
            return null;
        }

        // सुनिश्चित करें कि createdAt और updatedAt हमेशा Date ऑब्जेक्ट हों
        return {
            ...updatedSettings,
            createdAt: updatedSettings.createdAt ? new Date(updatedSettings.createdAt) : new Date(),
            updatedAt: updatedSettings.updatedAt ? new Date(updatedSettings.updatedAt) : new Date(),
        };
    } catch (error) {
        console.error("API Error: Failed to update branding settings:", error);
        // त्रुटि को पुनः फेंकें या null लौटाएं, आपके एप्लिकेशन लॉजिक के आधार पर
        throw error; // अभी के लिए त्रुटि फेंकता है
    }
}