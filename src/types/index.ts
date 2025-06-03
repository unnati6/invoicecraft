import type { BrandingSettingsFormData as BrandingSettingsFormDataType } from '@/lib/schemas';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  currency?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  createdAt: Date | null;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface AdditionalChargeItem {
  id?: string;
  description: string;
  valueType: 'fixed' | 'percentage';
  value: number;
  calculatedAmount?: number;
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
  createdAt: Date | null;
}

export interface MsaTemplate {
  id: string;
  name: string;
  content: string;
  coverPageTemplateId?: string;
  createdAt: Date | null;
}
export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled"; // <--- सुनिश्चित करें कि यह आपके सभी संभव मानों को कवर करता है

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName?: string; 
  currencyCode?: string; 
  issueDate: Date | null;
  dueDate: Date | null;
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
  status: InvoiceStatus;
  paymentTerms?: string;
  customPaymentTerms?: string;
  commitmentPeriod?: string;
  customCommitmentPeriod?: string;
  paymentFrequency?: string;
  customPaymentFrequency?: string;
  serviceStartDate?: Date | null;
  serviceEndDate?: Date | null;
  createdAt: Date | null;
}

export interface OrderFormItem {
  id?: string;
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
  issueDate: Date | null ;
  validUntilDate: Date  | null ;
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
  linkedMsaTemplateId?: string | null;
  msaContent?: string | null;
  msaCoverPageTemplateId?: string | null;
  termsAndConditions?: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired';
  paymentTerms?: string;
  customPaymentTerms?: string;
  commitmentPeriod?: string;
  customCommitmentPeriod?: string;
  paymentFrequency?: string;
  customPaymentFrequency?: string;
  serviceStartDate: Date | null;
  serviceEndDate: Date | null;
  createdAt: Date | null;
  
  
}

export interface TermsTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: Date | null;
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
  createdAt: Date | null;
}
export interface RepositoryItemFormData {
  name: string;
  defaultRate?: number;
  defaultProcurementPrice?: number;
  defaultVendorName?: string;
  currencyCode?: string | null;
  customerId?: string; // Often required for forms
  customerName?: string; // Often required for forms
  // No 'id' as it's for new items or updates where ID is passed separately
  // No 'createdAt' as it's handled by the backend
}
export interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  procurementPrice: number;
  totalVendorPayable: number; // Calculated: quantity * procurementPrice
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  orderFormId?: string; // Made optional for manual POs
  orderFormNumber?: string; // Made optional for manual POs
  currencyCode: string; // Added currency code
  issueDate: Date;
  items: PurchaseOrderItem[];
  grandTotalVendorPayable: number; // Calculated sum of all item totalVendorPayable
  status: 'Draft' | 'Issued' | 'Fulfilled' | 'Cancelled';
  createdAt: Date;
}

export type PlanType = 'Free' | 'Basic' | 'Pro' | 'Enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  signupDate: Date | null;
  planType: PlanType;
  isActive: boolean;
}

export type BrandingSettings = BrandingSettingsFormDataType & {
  id: string; // Typically a fixed ID for global settings or an ID if multiple profiles were supported
  createdAt: Date;
  updatedAt: Date;
};