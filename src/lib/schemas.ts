
import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
}).optional();

export const customerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }).optional(),
  phone: z.string().optional(),
  currency: z.string().optional(), // Stores currency code like 'USD', 'INR'
  billingAddress: addressSchema.optional(),
  shippingAddress: addressSchema.optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

const baseItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, { message: "Description cannot be empty." }),
  quantity: z.number().min(0.01, { message: "Quantity must be positive." }),
  rate: z.number().min(0, { message: "Rate must be non-negative." }),
});

export const invoiceItemSchema = baseItemSchema;
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;

export const additionalChargeFormSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, { message: "Description cannot be empty." }),
  valueType: z.enum(['fixed', 'percentage'], { required_error: "Type is required."}).default('fixed'),
  value: z.number().min(0.01, { message: "Value must be positive." }),
});
export type AdditionalChargeFormData = z.infer<typeof additionalChargeFormSchema>;

export const coverPageTemplateSchema = z.object({
  name: z.string().min(2, { message: "Template name must be at least 2 characters." }),
  title: z.string().optional(),
  companyLogoEnabled: z.boolean().optional().default(true),
  companyLogoUrl: z.string().url({ message: "Please enter a valid URL (e.g., https://placehold.co/200x60.png) or leave blank." }).or(z.literal('')).optional(),
  clientLogoEnabled: z.boolean().optional().default(true),
  clientLogoUrl: z.string().url({ message: "Please enter a valid URL or leave blank." }).or(z.literal('')).optional(),
  additionalImage1Enabled: z.boolean().optional().default(false),
  additionalImage1Url: z.string().url({ message: "Please enter a valid URL or leave blank." }).or(z.literal('')).optional(),
  additionalImage2Enabled: z.boolean().optional().default(false),
  additionalImage2Url: z.string().url({ message: "Please enter a valid URL or leave blank." }).or(z.literal('')).optional(),
});
export type CoverPageTemplateFormData = z.infer<typeof coverPageTemplateSchema>;

export const msaTemplateSchema = z.object({
  name: z.string().min(2, { message: "Template name must be at least 2 characters." }),
  content: z.string().optional().default('<p></p>'),
  coverPageTemplateId: z.string().optional(),
});
export type MsaTemplateFormData = z.infer<typeof msaTemplateSchema>;

const discountSchemaFields = {
  discountEnabled: z.boolean().optional().default(false),
  discountDescription: z.string().optional(),
  discountType: z.enum(['fixed', 'percentage']).optional().default('fixed'),
  discountValue: z.number().optional().default(0),
};

const commonDocumentSchemaFields = {
  paymentTerms: z.string().optional().default("Net 30 Days"),
  customPaymentTerms: z.string().optional(),
  commitmentPeriod: z.string().optional().default("N/A"),
  customCommitmentPeriod: z.string().optional(),
  paymentFrequency: z.string().optional().default("Monthly"),
  customPaymentFrequency: z.string().optional(),
  serviceStartDate: z.date().optional().nullable(),
  serviceEndDate: z.date().optional().nullable(),
}

export const invoiceSchema = z.object({
  customerId: z.string().min(1, { message: "Customer is required." }),
  invoiceNumber: z.string().min(1, { message: "Invoice number is required." }),
  issueDate: z.date({ required_error: "Issue date is required." }),
  dueDate: z.date({ required_error: "Due date is required." }),
  items: z.array(invoiceItemSchema).min(1, { message: "At least one item is required." }),
  additionalCharges: z.array(additionalChargeFormSchema).optional(),
  ...discountSchemaFields,
  taxRate: z.number().min(0).max(100).optional().default(0),
  linkedMsaTemplateId: z.string().optional(),
  msaContent: z.string().optional(),
  msaCoverPageTemplateId: z.string().optional(),
  termsAndConditions: z.string().optional(),
  status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue']).default('Draft'),
  ...commonDocumentSchemaFields,
}).superRefine((data, ctx) => {
  if (data.serviceStartDate && data.serviceEndDate && data.serviceEndDate < data.serviceStartDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date cannot be before start date",
      path: ["serviceEndDate"],
    });
  }
  if (data.discountEnabled && (data.discountValue === undefined || data.discountValue <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Discount value must be greater than 0 if discount is enabled.",
      path: ["discountValue"],
    });
  }
  if (data.discountEnabled && data.discountType === 'percentage' && (data.discountValue === undefined || data.discountValue > 100)) {
     ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Percentage discount cannot exceed 100%.",
      path: ["discountValue"],
    });
  }
  if (data.paymentTerms === 'Custom' && !data.customPaymentTerms?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Custom payment terms cannot be empty.", path: ["customPaymentTerms"] });
  }
  if (data.commitmentPeriod === 'Custom' && !data.customCommitmentPeriod?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Custom commitment period cannot be empty.", path: ["customCommitmentPeriod"] });
  }
  if (data.paymentFrequency === 'Custom' && !data.customPaymentFrequency?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Custom payment frequency cannot be empty.", path: ["customPaymentFrequency"] });
  }
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

export const termsSchema = z.object({
  termsAndConditions: z.string().optional(),
});
export type TermsFormData = z.infer<typeof termsSchema>;

export const orderFormItemSchema = baseItemSchema.extend({
  procurementPrice: z.number().optional(),
  vendorName: z.string().optional(),
});
export type OrderFormItemFormData = z.infer<typeof orderFormItemSchema>;

export const orderFormSchema = z.object({
  customerId: z.string().min(1, { message: "Customer is required." }),
  orderFormNumber: z.string().min(1, { message: "Order Form number is required." }),
  issueDate: z.date({ required_error: "Issue date is required." }),
  validUntilDate: z.date({ required_error: "Valid until date is required." }),
  items: z.array(orderFormItemSchema).min(1, { message: "At least one item is required." }),
  additionalCharges: z.array(additionalChargeFormSchema).optional(),
  ...discountSchemaFields,
  taxRate: z.number().min(0).max(100).optional().default(0),
  linkedMsaTemplateId: z.string().optional(),
  msaContent: z.string().optional(),
  msaCoverPageTemplateId: z.string().optional(),
  termsAndConditions: z.string().optional(),
  status: z.enum(['Draft', 'Sent', 'Accepted', 'Declined', 'Expired']).default('Draft'),
  ...commonDocumentSchemaFields,
}).superRefine((data, ctx) => {
  if (data.serviceStartDate && data.serviceEndDate && data.serviceEndDate < data.serviceStartDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date cannot be before start date",
      path: ["serviceEndDate"],
    });
  }
  if (data.discountEnabled && (data.discountValue === undefined || data.discountValue <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Discount value must be greater than 0 if discount is enabled.",
      path: ["discountValue"],
    });
  }
   if (data.discountEnabled && data.discountType === 'percentage' && (data.discountValue === undefined || data.discountValue > 100)) {
     ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Percentage discount cannot exceed 100%.",
      path: ["discountValue"],
    });
  }
  if (data.paymentTerms === 'Custom' && !data.customPaymentTerms?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Custom payment terms cannot be empty.", path: ["customPaymentTerms"] });
  }
  if (data.commitmentPeriod === 'Custom' && !data.customCommitmentPeriod?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Custom commitment period cannot be empty.", path: ["customCommitmentPeriod"] });
  }
  if (data.paymentFrequency === 'Custom' && !data.customPaymentFrequency?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Custom payment frequency cannot be empty.", path: ["customPaymentFrequency"] });
  }
});
export type OrderFormFormData = z.infer<typeof orderFormSchema>;

export const termsTemplateSchema = z.object({
  name: z.string().min(2, { message: "Template name must be at least 2 characters." }),
  content: z.string().optional().default('<p></p>'),

});
export type TermsTemplateFormData = z.infer<typeof termsTemplateSchema>;

export const brandingSettingsSchema = z.object({
  invoicePrefix: z.string().optional().default("INV-"),
  orderFormPrefix: z.string().optional().default("OF-"),
  name: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(), // Changed to string to match TEXT in DB
  email: z.string().email().optional(),
  logoUrl: z.string().url().optional().nullable(),      // New: for storing image URL
  signatureUrl: z.string().url().optional().nullable(), // New: for storing signature URL
});
export type BrandingSettingsFormData = z.infer<typeof brandingSettingsSchema>;
export type BrandingSettings = BrandingSettingsFormData & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};
export const repositoryItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Item name cannot be empty." }),
  defaultRate: z.number().min(0, {message: "Default rate must be non-negative."}).optional(),
  defaultProcurementPrice: z.number().optional(),
  defaultVendorName: z.string().optional(),
  currencyCode: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
});
export type RepositoryItemFormData = z.infer<typeof repositoryItemSchema>;

export const purchaseOrderItemFormSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, { message: "Description cannot be empty." }),
  quantity: z.number().min(0.01, { message: "Quantity must be positive." }),
  procurementPrice: z.number().min(0, { message: "Procurement price must be non-negative." }),
});
export type PurchaseOrderItemFormData = z.infer<typeof purchaseOrderItemFormSchema>;

export const purchaseOrderFormSchema = z.object({
  poNumber: z.string().min(1, "PO Number is required."),
  vendorName: z.string().min(1, "Vendor name is required."),
  issueDate: z.date({ required_error: "Issue date is required." }),
  items: z.array(purchaseOrderItemFormSchema).min(1, { message: "At least one item is required for a PO." }),
  status: z.enum(['Draft', 'Issued', 'Fulfilled', 'Cancelled']).default('Draft'),
  currencyCode: z.string().default('USD'),
  orderFormId: z.string().optional(),
  orderFormNumber: z.string().optional(),
});
export type PurchaseOrderFormData = z.infer<typeof purchaseOrderFormSchema>;

// Schemas for Admin Dashboard SMTP and Email Template Settings
export const smtpSettingsSchema = z.object({
  host: z.string().min(1, { message: "SMTP Host is required." }),
  port: z.coerce.number().int().min(1, { message: "Port must be a positive integer." }),
  username: z.string().optional(),
  password: z.string().optional(),
  encryption: z.enum(['None', 'SSL', 'TLS']).default('None'),
});
export type SmtpSettingsFormData = z.infer<typeof smtpSettingsSchema>;

export const emailTemplateSchema = z.object({
  subject: z.string().min(1, { message: "Email subject is required." }),
  body: z.string().min(1, { message: "Email body cannot be empty." }).default('<p></p>'),
});
export type EmailTemplateFormData = z.infer<typeof emailTemplateSchema>;
