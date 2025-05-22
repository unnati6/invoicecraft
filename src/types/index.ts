
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
  name: string; // Name of the cover page template itself
  title?: string; // Title to display on the cover page (e.g., "Master Service Agreement")
  companyLogoEnabled?: boolean;
  companyLogoUrl?: string; // URL or placeholder for company logo
  clientLogoEnabled?: boolean;
  clientLogoUrl?: string;   // URL or placeholder for client logo
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
  customerName?: string; // Denormalized for easy display
  currencyCode?: string; // Denormalized from customer
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  additionalCharges?: AdditionalChargeItem[];
  discountEnabled?: boolean;
  discountDescription?: string;
  discountType?: 'fixed' | 'percentage';
  discountValue?: number;
  discountAmount?: number; // Calculated
  subtotal: number; // Sum of item amounts
  taxRate: number;
  taxAmount: number; // Calculated
  total: number; // Calculated
  linkedMsaTemplateId?: string;
  msaContent?: string;
  msaCoverPageTemplateId?: string; // ID of the CoverPageTemplate linked via the MSA
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
  procurementPrice?: number;
  vendorName?: string;
}

export interface OrderForm {
  id: string;
  orderFormNumber: string;
  customerId: string;
  customerName?: string; // Denormalized for easy display
  currencyCode?: string; // Denormalized from customer
  issueDate: Date;
  validUntilDate: Date;
  items: OrderFormItem[];
  additionalCharges?: AdditionalChargeItem[];
  discountEnabled?: boolean;
  discountDescription?: string;
  discountType?: 'fixed' | 'percentage';
  discountValue?: number;
  discountAmount?: number; // Calculated
  subtotal: number; // Sum of item amounts
  taxRate: number;
  taxAmount: number; // Calculated
  total: number; // Calculated
  linkedMsaTemplateId?: string;
  msaContent?: string;
  msaCoverPageTemplateId?: string; // ID of the CoverPageTemplate linked via the MSA
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
  customerId?: string; // Link to customer if this is a client-specific item
  customerName?: string; // Denormalized for easy display
  createdAt: Date;
}
