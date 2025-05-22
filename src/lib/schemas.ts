
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
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().optional(),
  currency: z.string().optional(), 
  billingAddress: addressSchema, 
  shippingAddress: addressSchema, 
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
  paymentTerms: z.string().optional(),
  commitmentPeriod: z.string().optional(),
  serviceStartDate: z.date().optional().nullable(),
  serviceEndDate: z.date().optional().nullable(),
}).refine(data => {
  if (data.serviceStartDate && data.serviceEndDate) {
    return data.serviceEndDate >= data.serviceStartDate;
  }
  return true;
}, {
  message: "End date cannot be before start date",
  path: ["serviceEndDate"],
}).refine(data => {
  if (data.discountEnabled) {
    return data.discountValue !== undefined && data.discountValue > 0;
  }
  return true;
}, {
  message: "Discount value must be greater than 0 if discount is enabled.",
  path: ["discountValue"],
}).refine(data => {
  if (data.discountEnabled && data.discountType === 'percentage') {
    return data.discountValue !== undefined && data.discountValue <= 100;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%.",
  path: ["discountValue"],
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
  paymentTerms: z.string().optional(),
  commitmentPeriod: z.string().optional(),
  serviceStartDate: z.date().optional().nullable(),
  serviceEndDate: z.date().optional().nullable(),
}).refine(data => {
  if (data.serviceStartDate && data.serviceEndDate) {
    return data.serviceEndDate >= data.serviceStartDate;
  }
  return true;
}, {
  message: "End date cannot be before start date",
  path: ["serviceEndDate"],
}).refine(data => {
  if (data.discountEnabled) {
    return data.discountValue !== undefined && data.discountValue > 0;
  }
  return true;
}, {
  message: "Discount value must be greater than 0 if discount is enabled.",
  path: ["discountValue"],
}).refine(data => {
  if (data.discountEnabled && data.discountType === 'percentage') {
    return data.discountValue !== undefined && data.discountValue <= 100;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%.",
  path: ["discountValue"],
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
});
export type BrandingSettingsFormData = z.infer<typeof brandingSettingsSchema>;

export const repositoryItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Item name cannot be empty." }),
  defaultRate: z.number().min(0, {message: "Default rate must be non-negative."}).optional(),
});
export type RepositoryItemFormData = z.infer<typeof repositoryItemSchema>;
