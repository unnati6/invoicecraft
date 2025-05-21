
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  currency?: string; // Added
  billingAddress?: { // Renamed from address
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shippingAddress?: { // Added
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface AdditionalChargeItem {
  id: string;
  description: string;
  valueType: 'fixed' | 'percentage';
  value: number; // The raw fixed value or percentage rate
  calculatedAmount: number; // The actual monetary value of this charge
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string; 
  customerName?: string; 
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  additionalCharges?: AdditionalChargeItem[];
  subtotal: number; // Subtotal of main items ONLY
  // No need for totalAdditionalChargesAmount on the main object if derived or part of summary
  taxRate: number; 
  taxAmount: number; // Tax calculated on (subtotal of main items + sum of calculated additional charges)
  total: number; // Grand total
  termsAndConditions?: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  createdAt: Date;
}

export interface QuoteItem { 
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName?: string;
  issueDate: Date;
  expiryDate: Date; 
  items: QuoteItem[];
  additionalCharges?: AdditionalChargeItem[];
  subtotal: number; // Subtotal of main items ONLY
  taxRate: number;
  taxAmount: number; // Tax calculated on (subtotal of main items + sum of calculated additional charges)
  total: number; // Grand total
  termsAndConditions?: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired';
  createdAt: Date;
}

