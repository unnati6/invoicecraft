
'use server';

import { revalidatePath } from 'next/cache';
import { createCustomer as createCustomerData, getCustomerById as getCustomerByIdData, updateCustomer as updateCustomerData } from './data';
import type { Customer } from '@/types';
import type { CustomerFormData } from './schemas';

export async function createNewCustomer(data: CustomerFormData): Promise<Customer | null> {
  const newCustomer = await createCustomerData(data);
  // if (newCustomer) {
    // console.log(`Revalidating path: /customers for new customer ${newCustomer.id}`);
    // revalidatePath('/customers');
    // console.log(`Revalidating path: /(app)/dashboard for new customer ${newCustomer.id}`);
    // revalidatePath('/(app)/dashboard', 'page');
    // console.log(`Revalidating path: /customers/${newCustomer.id}/edit for new customer`);
    // revalidatePath(`/customers/${newCustomer.id}/edit`);
  // }
  return newCustomer;
}

export async function updateExistingCustomer(id: string, data: CustomerFormData): Promise<Customer | null> {
  const updatedCustomer = await updateCustomerData(id, data);
  if (updatedCustomer) {
    revalidatePath('/customers');
    revalidatePath(`/customers/${id}/edit`);
    revalidatePath('/(app)/dashboard', 'page');
  }
  return updatedCustomer;
}
