import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

export const invoiceItemSchema = z.object({
  id: z.string().optional(), // For existing items
  description: z.string().min(1, { message: "Description cannot be empty." }),
  quantity: z.number().min(0.01, { message: "Quantity must be positive." }),
  rate: z.number().min(0, { message: "Rate must be non-negative." }),
});

export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;

export const invoiceSchema = z.object({
  customerId: z.string().min(1, { message: "Customer is required." }),
  invoiceNumber: z.string().min(1, { message: "Invoice number is required." }),
  issueDate: z.date({ required_error: "Issue date is required." }),
  dueDate: z.date({ required_error: "Due date is required." }),
  items: z.array(invoiceItemSchema).min(1, { message: "At least one item is required." }),
  taxRate: z.number().min(0).max(100).optional().default(0),
  termsAndConditions: z.string().optional(),
  status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue']).default('Draft'),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

export const termsSchema = z.object({
  termsAndConditions: z.string().optional(),
});
export type TermsFormData = z.infer<typeof termsSchema>;
