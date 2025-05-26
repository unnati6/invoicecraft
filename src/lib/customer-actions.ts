
'use server';

// import { revalidatePath } from 'next/cache'; // Keep commented for diagnostics
// import { updateCustomer as updateCustomerData } from './data'; // Keep commented for diagnostics
import type { CustomerFormData } from './schemas';
import type { Customer } from '@/types';

// Helper function (copied from data.ts for isolation during diagnostics)
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

export async function createNewCustomer(data: CustomerFormData): Promise<Customer | null> {
  console.log("[customer-actions] MOCK createNewCustomer called with data:", data.name);
  
  // Simulate customer creation directly here without calling Data.createCustomer
  const newCustomer: Customer = {
    id: generateId('cust'),
    name: data.name,
    email: data.email,
    phone: data.phone,
    currency: data.currency || 'USD',
    billingAddress: data.billingAddress ? { ...data.billingAddress } : undefined,
    shippingAddress: data.shippingAddress ? { ...data.shippingAddress } : undefined,
    createdAt: new Date()
  };
  
  // RevalidatePath calls remain commented out for this diagnostic step.
  // if (newCustomer) {
    // revalidatePath('/customers');
    // revalidatePath('/(app)/dashboard', 'page');
    // revalidatePath(`/customers/${newCustomer.id}/edit`);
  // }
  
  console.log("[customer-actions] MOCK created customer:", newCustomer.id, newCustomer.name);
  return newCustomer;
}

/*
// Keep updateExistingCustomer commented out for this diagnostic step
export async function updateExistingCustomer(id: string, data: CustomerFormData): Promise<Customer | null> {
  const updatedCustomer = await updateCustomerData(id, data);
  if (updatedCustomer) {
    revalidatePath('/customers');
    revalidatePath(`/customers/${id}/edit`);
    revalidatePath('/(app)/dashboard', 'page');
  }
  return updatedCustomer;
}
*/
