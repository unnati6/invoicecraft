
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

export interface CoverPageTemplate {
  id: string;
  name: string; 
  title?: string; 
  companyLogoEnabled?: boolean;
  companyLogoUrl?: string; 
  clientLogoEnabled?: boolean;
  clientLogoUrl?: string;   
  additionalImage1Enabled?: boolean;
  additionalImage1Url?: string;
  additionalImage2Enabled?: boolean;
  additionalImage2Url?: string;
  createdAt: Date;
}

export interface MsaTemplate {
  id: string;
  name: string;
  content: string;
  coverPageTemplateId?: string;
  createdAt: Date;
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
  discountEnabled?: boolean;
  discountDescription?: string;
  discountType?: 'fixed' | 'percentage';
  discountValue?: number;
  discountAmount?: number; 
  subtotal: number; 
  taxRate: number;
  taxAmount: number; 
  total: number; 
  linkedMsaTemplateId?: string;
  msaContent?: string;
  msaCoverPageTemplateId?: string;
  termsAndConditions?: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  paymentTerms?: string;
  customPaymentTerms?: string;
  commitmentPeriod?: string;
  customCommitmentPeriod?: string;
  paymentFrequency?: string;
  customPaymentFrequency?: string;
  serviceStartDate?: Date | null;
  serviceEndDate?: Date | null;
  createdAt: Date;
}

export interface OrderFormItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  procurementPrice?: number;
  vendorName?: string;
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
  discountEnabled?: boolean;
  discountDescription?: string;
  discountType?: 'fixed' | 'percentage';
  discountValue?: number;
  discountAmount?: number; 
  subtotal: number; 
  taxRate: number;
  taxAmount: number; 
  total: number; 
  linkedMsaTemplateId?: string;
  msaContent?: string;
  msaCoverPageTemplateId?: string;
  termsAndConditions?: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired';
  paymentTerms?: string;
  customPaymentTerms?: string;
  commitmentPeriod?: string;
  customCommitmentPeriod?: string;
  paymentFrequency?: string;
  customPaymentFrequency?: string;
  serviceStartDate?: Date | null;
  serviceEndDate?: Date | null;
  createdAt: Date;
}

export interface TermsTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
}

export interface RepositoryItem {
  id: string;
  name: string;
  defaultRate?: number;
  defaultProcurementPrice?: number;
  defaultVendorName?: string;
  currencyCode?: string;
  customerId?: string; 
  customerName?: string; 
  createdAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  procurementPrice: number;
  totalVendorPayable: number; // quantity * procurementPrice
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  orderFormId: string; // Link back to the source OrderForm
  orderFormNumber: string; // For easy reference
  issueDate: Date;
  items: PurchaseOrderItem[];
  grandTotalVendorPayable: number; // Sum of all item totalVendorPayable
  status: 'Draft' | 'Issued' | 'Fulfilled' | 'Cancelled';
  createdAt: Date;
}

export type PlanType = 'Free' | 'Basic' | 'Pro' | 'Enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  signupDate: Date;
  planType: PlanType;
  isActive: boolean;
}
