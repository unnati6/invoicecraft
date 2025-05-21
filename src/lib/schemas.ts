
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
  currency: z.string().optional(), // Added currency
  billingAddress: addressSchema, // Renamed from address
  shippingAddress: addressSchema, // Added shipping address
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

// Schema for the form input for additional charges
export const additionalChargeFormSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, { message: "Description cannot be empty." }),
  valueType: z.enum(['fixed', 'percentage'], { required_error: "Type is required."}).default('fixed'),
  value: z.number().min(0.01, { message: "Value must be positive." }),
});
export type AdditionalChargeFormData = z.infer<typeof additionalChargeFormSchema>;

export const invoiceSchema = z.object({
  customerId: z.string().min(1, { message: "Customer is required." }),
  invoiceNumber: z.string().min(1, { message: "Invoice number is required." }),
  issueDate: z.date({ required_error: "Issue date is required." }),
  dueDate: z.date({ required_error: "Due date is required." }),
  items: z.array(invoiceItemSchema).min(1, { message: "At least one item is required." }),
  additionalCharges: z.array(additionalChargeFormSchema).optional(), // Use the form schema here
  taxRate: z.number().min(0).max(100).optional().default(0),
  termsAndConditions: z.string().optional(),
  status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue']).default('Draft'),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

export const termsSchema = z.object({
  termsAndConditions: z.string().optional(),
});
export type TermsFormData = z.infer<typeof termsSchema>;

export const quoteItemSchema = baseItemSchema; 
export type QuoteItemFormData = z.infer<typeof quoteItemSchema>;

export const quoteSchema = z.object({
  customerId: z.string().min(1, { message: "Customer is required." }),
  quoteNumber: z.string().min(1, { message: "Quote number is required." }),
  issueDate: z.date({ required_error: "Issue date is required." }),
  expiryDate: z.date({ required_error: "Expiry date is required." }),
  items: z.array(quoteItemSchema).min(1, { message: "At least one item is required." }),
  additionalCharges: z.array(additionalChargeFormSchema).optional(), // Use the form schema here
  taxRate: z.number().min(0).max(100).optional().default(0),
  termsAndConditions: z.string().optional(),
  status: z.enum(['Draft', 'Sent', 'Accepted', 'Declined', 'Expired']).default('Draft'),
});
export type QuoteFormData = z.infer<typeof quoteSchema>;
