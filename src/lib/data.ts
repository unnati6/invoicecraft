
import type { Customer, Invoice, InvoiceItem, Quote, QuoteItem } from '@/types';

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

let mockQuotes: Quote[] = [
  {
    id: 'quo_1',
    quoteNumber: 'QUO-001',
    customerId: 'cust_1',
    customerName: 'Alice Wonderland',
    issueDate: new Date(2024, 0, 10),
    expiryDate: new Date(2024, 1, 9),
    items: [
      { id: 'q_item_1', description: 'Initial Project Scoping', quantity: 1, rate: 500, amount: 500 },
      { id: 'q_item_2', description: 'Phase 1 Development Estimate', quantity: 1, rate: 2500, amount: 2500 },
    ],
    subtotal: 3000,
    taxRate: 10,
    taxAmount: 300,
    total: 3300,
    termsAndConditions: 'This quote is valid for 30 days. Prices subject to change thereafter.',
    status: 'Sent',
    createdAt: new Date(2024, 0, 10),
  },
];


// Helper to generate unique IDs
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

// Customer Functions
export const getCustomers = async (): Promise<Customer[]> => {
  // Simulate API delay for list fetching if desired, but not for core data ops
  // await new Promise(resolve => setTimeout(resolve, 500)); 
  return [...mockCustomers];
};

export const getCustomerById = async (id: string): Promise<Customer | undefined> => {
  // No delay for direct fetch by ID
  return mockCustomers.find(c => c.id === id);
};

export const createCustomer = async (data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> => {
  // No delay for create
  const newCustomer: Customer = { ...data, id: generateId('cust'), createdAt: new Date() };
  mockCustomers.push(newCustomer);
  return newCustomer;
};

export const updateCustomer = async (id: string, data: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<Customer | null> => {
  // No delay for update
  const index = mockCustomers.findIndex(c => c.id === id);
  if (index === -1) return null;
  mockCustomers[index] = { ...mockCustomers[index], ...data };
  return mockCustomers[index];
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
  // No delay for delete
  const initialLength = mockCustomers.length;
  mockCustomers = mockCustomers.filter(c => c.id !== id);
  return mockCustomers.length < initialLength;
};


// Invoice Functions
export const getInvoices = async (): Promise<Invoice[]> => {
  // await new Promise(resolve => setTimeout(resolve, 500));
  return [...mockInvoices].map(inv => ({
    ...inv,
    customerName: mockCustomers.find(c => c.id === inv.customerId)?.name || 'Unknown Customer'
  }));
};

export const getInvoiceById = async (id: string): Promise<Invoice | undefined> => {
  // No delay for direct fetch by ID
  const invoice = mockInvoices.find(i => i.id === id);
  if (invoice) {
    return {
      ...invoice,
      customerName: mockCustomers.find(c => c.id === invoice.customerId)?.name || 'Unknown Customer'
    }
  }
  return undefined;
};

export const createInvoice = async (data: Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'customerName'> & { items: Omit<InvoiceItem, 'id' | 'amount'>[] } ): Promise<Invoice> => {
  // No delay for create
  const itemsWithAmounts: InvoiceItem[] = data.items.map(item => ({
    ...item,
    id: generateId('item'),
    amount: item.quantity * item.rate,
  }));
  
  const subtotal = itemsWithAmounts.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (data.taxRate / 100);
  const total = subtotal + taxAmount;

  // Fetch customer name synchronously if possible, or handle potential undefined if getCustomerById remains async without delay
  const customer = mockCustomers.find(c => c.id === data.customerId);

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

export const updateInvoice = async (id: string, data: Partial<Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'customerName'>> & { items?: Omit<InvoiceItem, 'id' | 'amount'>[] }): Promise<Invoice | null> => {
  // No delay for update
  const index = mockInvoices.findIndex(i => i.id === id);
  if (index === -1) return null;

  let updatedInvoice = { ...mockInvoices[index], ...data };

  if (data.items || data.taxRate !== undefined) {
    const itemsWithAmounts: InvoiceItem[] = (data.items || updatedInvoice.items).map((item: any) => ({ 
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
     const customer = mockCustomers.find(c => c.id === data.customerId);
     updatedInvoice.customerName = customer?.name || 'Unknown Customer';
  }

  mockInvoices[index] = updatedInvoice;
  return mockInvoices[index];
};

export const deleteInvoice = async (id: string): Promise<boolean> => {
  // No delay for delete
  const initialLength = mockInvoices.length;
  mockInvoices = mockInvoices.filter(i => i.id !== id);
  return mockInvoices.length < initialLength;
};

export const getNextInvoiceNumber = async (): Promise<string> => {
    // No delay
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
};

// Quote Functions
export const getQuotes = async (): Promise<Quote[]> => {
  // await new Promise(resolve => setTimeout(resolve, 500));
  return [...mockQuotes].map(quo => ({
    ...quo,
    customerName: mockCustomers.find(c => c.id === quo.customerId)?.name || 'Unknown Customer'
  }));
};

export const getQuoteById = async (id: string): Promise<Quote | undefined> => {
  // No delay for direct fetch by ID
  const quote = mockQuotes.find(q => q.id === id);
  if (quote) {
    return {
      ...quote,
      customerName: mockCustomers.find(c => c.id === quote.customerId)?.name || 'Unknown Customer'
    }
  }
  return undefined;
};

export const createQuote = async (data: Omit<Quote, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'customerName'> & { items: Omit<QuoteItem, 'id' | 'amount'>[] }): Promise<Quote> => {
  // No delay for create
  const itemsWithAmounts: QuoteItem[] = data.items.map(item => ({
    ...item,
    id: generateId('q_item'),
    amount: item.quantity * item.rate,
  }));
  
  const subtotal = itemsWithAmounts.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (data.taxRate / 100);
  const total = subtotal + taxAmount;

  const customer = mockCustomers.find(c => c.id === data.customerId);

  const newQuote: Quote = {
    ...data,
    id: generateId('quo'),
    customerName: customer?.name || 'Unknown Customer',
    items: itemsWithAmounts,
    subtotal,
    taxAmount,
    total,
    createdAt: new Date(),
  };
  mockQuotes.push(newQuote);
  return newQuote;
};

export const updateQuote = async (id: string, data: Partial<Omit<Quote, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'items' | 'customerName'>> & { items?: Omit<QuoteItem, 'id' | 'amount'>[] }): Promise<Quote | null> => {
  // No delay for update
  const index = mockQuotes.findIndex(q => q.id === id);
  if (index === -1) return null;

  let updatedQuote = { ...mockQuotes[index], ...data };

  if (data.items || data.taxRate !== undefined) {
    const itemsWithAmounts: QuoteItem[] = (data.items || updatedQuote.items).map((item: any) => ({
      id: item.id || generateId('q_item'),
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.quantity * item.rate,
    }));
    
    const subtotal = itemsWithAmounts.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = data.taxRate !== undefined ? data.taxRate : updatedQuote.taxRate;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    updatedQuote = {
      ...updatedQuote,
      items: itemsWithAmounts,
      subtotal,
      taxRate,
      taxAmount,
      total,
    };
  }
  
  if (data.customerId) {
     const customer = mockCustomers.find(c => c.id === data.customerId);
     updatedQuote.customerName = customer?.name || 'Unknown Customer';
  }

  mockQuotes[index] = updatedQuote;
  return mockQuotes[index];
};

export const deleteQuote = async (id: string): Promise<boolean> => {
  // No delay for delete
  const initialLength = mockQuotes.length;
  mockQuotes = mockQuotes.filter(q => q.id !== id);
  return mockQuotes.length < initialLength;
};

export const getNextQuoteNumber = async (): Promise<string> => {
    // No delay
    const lastQuote = mockQuotes.length > 0 ? mockQuotes.sort((a,b) => a.quoteNumber.localeCompare(b.quoteNumber))[mockQuotes.length-1] : null;
    if (!lastQuote || !lastQuote.quoteNumber.startsWith("QUO-")) {
        return "QUO-001";
    }
    try {
        const num = parseInt(lastQuote.quoteNumber.split("-")[1]);
        return `QUO-${(num + 1).toString().padStart(3, '0')}`;
    } catch (e) {
        return `QUO-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`; // fallback
    }
};
