
'use server';

import type { CustomerFormData } from './schemas';
import type { Customer } from '@/types';
import { 
  createCustomer as createCustomerData, 
  updateCustomer as updateCustomerData 
} from './data';
import { revalidatePath } from 'next/cache';

const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

export async function createNewCustomer(data: CustomerFormData): Promise<Customer | null> {
  console.log("[customer-actions] createNewCustomer called with data name:", data.name);
  
  const newCustomerData = {
    ...data,
    id: generateId('cust'),
    createdAt: new Date(),
  };

try {
  const newCustomer = await createCustomerData(newCustomerData);
  if (newCustomer) {
      revalidatePath('/customers');
      revalidatePath('/(app)/dashboard', 'page');
      return newCustomer;
  } else {
    
      throw new Error("Failed to create customer in data layer.");
  }
} catch (error) {
  console.error("Error creating new customer:", error);
  throw new Error("Failed to create customer: " + (error instanceof Error ? error.message : "Unknown error"));
}
  return null;
}

export async function updateExistingCustomer(id: string, data: CustomerFormData): Promise<Customer | null> {
  console.log("[customer-actions] updateExistingCustomer called for ID:", id, "with data name:", data.name);
  const updatedCustomer = await updateCustomerData(id, data);

  if (updatedCustomer) {
    revalidatePath('/customers');
    revalidatePath(`/customers/${id}/edit`);
    revalidatePath('/(app)/dashboard', 'page');
    return updatedCustomer;
  }
  return null;
}
