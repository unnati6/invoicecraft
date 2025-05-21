
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  currency?: string; 
  billingAddress?: { 
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shippingAddress?: { 
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
  value: number; 
  calculatedAmount: number; 
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string; 
  customerName?: string; 
  currencyCode?: string; 
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  additionalCharges?: AdditionalChargeItem[];
  subtotal: number; 
  taxRate: number; 
  taxAmount: number; 
  total: number; 
  msaContent?: string;
  termsAndConditions?: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  paymentTerms?: string;
  commitmentPeriod?: string;
  serviceStartDate?: Date;
  serviceEndDate?: Date;
  createdAt: Date;
}

export interface OrderFormItem { 
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface OrderForm {
  id: string;
  orderFormNumber: string;
  customerId: string;
  customerName?: string;
  currencyCode?: string; 
  issueDate: Date;
  validUntilDate: Date; 
  items: OrderFormItem[];
  additionalCharges?: AdditionalChargeItem[];
  subtotal: number; 
  taxRate: number;
  taxAmount: number; 
  total: number; 
  msaContent?: string;
  termsAndConditions?: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired';
  paymentTerms?: string;
  commitmentPeriod?: string;
  serviceStartDate?: Date;
  serviceEndDate?: Date;
  createdAt: Date;
}

export interface TermsTemplate {
  id: string;
  name: string;
  content: string; // HTML content from RichTextEditor
  createdAt: Date;
}

export interface MsaTemplate {
  id: string;
  name: string;
  content: string; // HTML content from RichTextEditor
  createdAt: Date;
}
