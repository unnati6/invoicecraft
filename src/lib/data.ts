import type { Customer, Invoice, InvoiceItem } from '@/types';

// In-memory store for mock data
let mockCustomers: Customer[] = [
  { id: 'cust_1', name: 'Alice Wonderland', email: 'alice@example.com', phone: '123-456-7890', address: { street: '123 Rabbit Hole', city: 'Storyville', state: 'CA', zip: '90210', country: 'USA' }, createdAt: new Date() },
  { id: 'cust_2', name: 'Bob The Builder', email: 'bob@example.com', phone: '987-654-3210', address: { street: '456 Construction Way', city: 'BuildCity', state: 'NY', zip: '10001', country: 'USA' }, createdAt: new Date() },
];

let mockInvoices: Invoice[] = [
  { 
    id: 'inv_1', 
    invoiceNumber: 'INV-001', 
    customerId: 'cust_1',
    customerName: 'Alice Wonderland',
    issueDate: new Date(2023, 10, 15), 
    dueDate: new Date(2023, 11, 15),
    items: [
      { id: 'item_1', description: 'Web Design Service', quantity: 1, rate: 1200, amount: 1200 },
      { id: 'item_2', description: 'Hosting (1 year)', quantity: 1, rate: 100, amount: 100 },
    ],
    subtotal: 1300,
    taxRate: 10,
    taxAmount: 130,
    total: 1430,
    termsAndConditions: 'Payment due within 30 days. Late fees apply.',
    status: 'Sent',
    createdAt: new Date(2023, 10, 15)
  },
  { 
    id: 'inv_2', 
    invoiceNumber: 'INV-002', 
    customerId: 'cust_2',
    customerName: 'Bob The Builder',
    issueDate: new Date(2023, 11, 1), 
    dueDate: new Date(2023, 12, 1),
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

// Helper to generate unique IDs
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

// Customer Functions
export const getCustomers = async (): Promise<Customer[]> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  return [...mockCustomers];
};

export const getCustomerById = async (id: string): Promise<Customer | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockCustomers.find(c => c.id === id);
};

export const createCustomer = async (data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newCustomer: Customer = { ...data, id: generateId('cust'), createdAt: new Date() };
  mockCustomers.push(newCustomer);
  return newCustomer;
};

export const updateCustomer = async (id: string, data: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<Customer | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockCustomers.findIndex(c => c.id === id);
  if (index === -1) return null;
  mockCustomers[index] = { ...mockCustomers[index], ...data };
  return mockCustomers[index];
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const initialLength = mockCustomers.length;
  mockCustomers = mockCustomers.filter(c => c.id !== id);
  return mockCustomers.length < initialLength;
};


// Invoice Functions
export const getInvoices = async (): Promise<Invoice[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...mockInvoices].map(inv => ({
    ...inv,
    customerName: mockCustomers.find(c => c.id === inv.customerId)?.name || 'Unknown Customer'
  }));
};

export const getInvoiceById = async (id: string): Promise<Invoice | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const invoice = mockInvoices.find(i => i.id === id);
  if (invoice) {
    return {
      ...invoice,
      customerName: mockCustomers.find(c => c.id === invoice.customerId)?.name || 'Unknown Customer'
    }
  }
  return undefined;
};

export const createInvoice = async (data: Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items'> & { items: Omit<InvoiceItem, 'id' | 'amount'>[] } ): Promise<Invoice> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const itemsWithAmounts: InvoiceItem[] = data.items.map(item => ({
    ...item,
    id: generateId('item'),
    amount: item.quantity * item.rate,
  }));
  
  const subtotal = itemsWithAmounts.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (data.taxRate / 100);
  const total = subtotal + taxAmount;

  const customer = await getCustomerById(data.customerId);

  const newInvoice: Invoice = {
    ...data,
    id: generateId('inv'),
    customerName: customer?.name || 'Unknown Customer',
    items: itemsWithAmounts,
    subtotal,
    taxAmount,
    total,
    createdAt: new Date(),
  };
  mockInvoices.push(newInvoice);
  return newInvoice;
};

export const updateInvoice = async (id: string, data: Partial<Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items'>> & { items?: Omit<InvoiceItem, 'id' | 'amount'>[] }): Promise<Invoice | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockInvoices.findIndex(i => i.id === id);
  if (index === -1) return null;

  let updatedInvoice = { ...mockInvoices[index], ...data };

  if (data.items || data.taxRate !== undefined) {
    const itemsWithAmounts: InvoiceItem[] = (data.items || updatedInvoice.items).map((item: any) => ({ // any for items that might not have amount yet
      id: item.id || generateId('item'),
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
    amount: item.quantity * item.rate,
    }));
    
    const subtotal = itemsWithAmounts.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = data.taxRate !== undefined ? data.taxRate : updatedInvoice.taxRate;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    updatedInvoice = {
      ...updatedInvoice,
      items: itemsWithAmounts,
      subtotal,
      taxRate,
      taxAmount,
      total,
    };
  }
  
  if (data.customerId) {
     const customer = await getCustomerById(data.customerId);
     updatedInvoice.customerName = customer?.name || 'Unknown Customer';
  }


  mockInvoices[index] = updatedInvoice;
  return mockInvoices[index];
};

export const deleteInvoice = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const initialLength = mockInvoices.length;
  mockInvoices = mockInvoices.filter(i => i.id !== id);
  return mockInvoices.length < initialLength;
};

export const getNextInvoiceNumber = async (): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const lastInvoice = mockInvoices.length > 0 ? mockInvoices.sort((a,b) => a.invoiceNumber.localeCompare(b.invoiceNumber))[mockInvoices.length-1] : null;
    if (!lastInvoice || !lastInvoice.invoiceNumber.startsWith("INV-")) {
        return "INV-001";
    }
    try {
        const num = parseInt(lastInvoice.invoiceNumber.split("-")[1]);
        return `INV-${(num + 1).toString().padStart(3, '0')}`;
    } catch (e) {
        return `INV-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`; // fallback
    }
}
