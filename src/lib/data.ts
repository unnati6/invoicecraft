
import { securedApiCall } from './api'; 
import type { Customer, Invoice, InvoiceItem, OrderForm, OrderFormItem, AdditionalChargeItem, TermsTemplate, MsaTemplate, CoverPageTemplate, RepositoryItem, PurchaseOrder, PurchaseOrderItem, User, PlanType } from '@/types';
import type { AdditionalChargeFormData, CoverPageTemplateFormData, MsaTemplateFormData, TermsTemplateFormData, RepositoryItemFormData } from './schemas';

// --- Customer Data Operations ---
export async function getCustomers(): Promise<Customer[]> {
  try {
    const customers = await securedApiCall<Customer[]>('/customers'); // Express.js बैकएंड के '/customers' एंडपॉइंट को कॉल करें
    return customers || [];
  } catch (error) {
    console.error('Error fetching customers:', error);

    throw new Error('Failed to fetch customers.');
  }
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  try {
    const customer = await securedApiCall<Customer>(`/customers/${id}`); // Express.js बैकएंड के '/customers/:id' एंडपॉइंट को कॉल करें
    return customer || undefined; 
  } catch (error) {
    console.error(`Error fetching customer with ID ${id}:`, error);

    return undefined;
  }
}

export async function createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'currency' | 'billingAddress' | 'shippingAddress'> & { currency?: string; billingAddress?: Customer['billingAddress']; shippingAddress?: Customer['shippingAddress']; }): Promise<Customer | null> {
  try {
    const newCustomer = await securedApiCall<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return newCustomer;
  } catch (error) {
    console.error('Error creating customer:', error);
    
    return null;
  }
}

export async function updateCustomer(id: string, data: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<Customer | null> {
  try {
    const updatedCustomer = await securedApiCall<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return updatedCustomer;
  } catch (error) {
    console.error(`Error updating customer with ID ${id}:`, error);

    return null;
  }
}

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    await securedApiCall<null>(`/customers/${id}`, { method: 'DELETE' });
    return true; 
  } catch (error) {
    console.error(`Error deleting customer with ID ${id}:`, error);

    return false;
  }
}


// --- Invoice Functions ---
export async function getInvoices(): Promise<Invoice[]> {
  try {
    const invoices = await securedApiCall<Invoice[]>('/invoices');
    return invoices || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  try {
    const invoice = await securedApiCall<Invoice>(`/invoices/${id}`);
    return invoice || undefined;
  } catch (error) {
    console.error(`Error fetching invoice with ID ${id}:`, error);
    return undefined;
  }
}

type CreateInvoiceInputData = Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'customerName' | 'additionalCharges' | 'currencyCode' | 'discountAmount'> &
                             { items: Omit<InvoiceItem, 'id' | 'amount'>[], additionalCharges?: AdditionalChargeFormData[] };

export async function createInvoice(data: CreateInvoiceInputData): Promise<Invoice | null> {
  try {
    const newInvoice = await securedApiCall<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return newInvoice;
  } catch (error) {
    console.error('Error creating invoice:', error);
    return null;
  }
}


type UpdateInvoiceInputData = Partial<Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'customerName' | 'additionalCharges' | 'currencyCode' | 'discountAmount'>> &
                             { items?: Omit<InvoiceItem, 'id' | 'amount'>[], additionalCharges?: AdditionalChargeFormData[] };

export async function updateInvoice(id: string, data: UpdateInvoiceInputData): Promise<Invoice | null> {
  try {
      const updatedInvoice = await securedApiCall<Invoice>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return updatedInvoice;
  } catch (error) {
    console.error(`Error updating invoice with ID ${id}:`, error);
    return null;
  }
}

export async function deleteInvoice(id: string): Promise<boolean> {
  try {
    await securedApiCall<null>(`/invoices/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error(`Error deleting invoice with ID ${id}:`, error);
    return false;
  }
}

export async function getNextInvoiceNumber(): Promise<string> {
  try {
    const response = await securedApiCall<{ nextNumber: string }>('/invoices/next-number'); // मान लें कि आपका बैकएंड यह एंडपॉइंट प्रदान करता है
    return response?.nextNumber || 'INV-0001';
  } catch (error) {
    console.error('Error fetching next invoice number:', error);
    return 'INV-ERROR'; // या कोई डिफ़ॉल्ट/एरर वैल्यू
  }
}

// --- OrderForm Functions ---
export async function getOrderForms(): Promise<OrderForm[]> {
  try {
    const orderForms = await securedApiCall<OrderForm[]>('/order-forms');
    return orderForms || [];
  } catch (error) {
    console.error('Error fetching order forms:', error);
    throw new Error('Failed to fetch order forms.');
  }
}

export async function getOrderFormById(id: string): Promise<OrderForm | undefined> {
  try {
    const orderForm = await securedApiCall<OrderForm>(`/order-forms/${id}`);
    return orderForm || undefined;
  } catch (error) {
    console.error(`Error fetching order form with ID ${id}:`, error);
    return undefined;
  }
}

type CreateOrderFormInputData = Omit<OrderForm, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'customerName' | 'additionalCharges' | 'currencyCode' | 'discountAmount'> &
                                { items: Omit<OrderFormItem, 'id' | 'amount' | 'procurementPrice' | 'vendorName'>[], additionalCharges?: AdditionalChargeFormData[] };

export async function createOrderForm(data: CreateOrderFormInputData): Promise<OrderForm | null> {
  try {
    const newOrderForm = await securedApiCall<OrderForm>('/order-forms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return newOrderForm;
  } catch (error) {
    console.error('Error creating order form:', error);
    return null;
  }
}

type UpdateOrderFormInputData = Partial<Omit<OrderForm, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'customerName' | 'additionalCharges' | 'currencyCode' | 'discountAmount'>> &
                                { items?: Omit<OrderFormItem, 'id' | 'amount' | 'procurementPrice' | 'vendorName'>[], additionalCharges?: AdditionalChargeFormData[] };

export async function updateOrderForm(id: string, data: UpdateOrderFormInputData): Promise<OrderForm | null> {
  try {
    const updatedOrderForm = await securedApiCall<OrderForm>(`/order-forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return updatedOrderForm;
  } catch (error) {
    console.error(`Error updating order form with ID ${id}:`, error);
    return null;
  }
}

export async function deleteOrderForm(id: string): Promise<boolean> {
  try {
    await securedApiCall<null>(`/order-forms/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error(`Error deleting order form with ID ${id}:`, error);
    return false;
  }
}

export async function getNextOrderFormNumber(): Promise<string> {
  try {
    const response = await securedApiCall<{ nextNumber: string }>('/order-forms/next-number'); // मान लें कि आपका बैकएंड यह एंडपॉइंट प्रदान करता है
    return response?.nextNumber || 'OF-0001';
  } catch (error) {
    console.error('Error fetching next order form number:', error);
    return 'OF-ERROR';
  }
}
// --- TermsTemplate Functions ---
export async function getTermsTemplates(): Promise<TermsTemplate[]> {
  try {
    const templates = await securedApiCall<TermsTemplate[]>('/terms-templates');
    return templates || [];
  } catch (error) {
    console.error('Error fetching terms templates:', error);
    throw new Error('Failed to fetch terms templates.');
  }
}

export async function getTermsTemplateById(id: string): Promise<TermsTemplate | undefined> {
  try {
    const template = await securedApiCall<TermsTemplate>(`/terms-templates/${id}`);
    return template || undefined;
  } catch (error) {
    console.error(`Error fetching terms template with ID ${id}:`, error);
    return undefined;
  }
}

export async function createTermsTemplate(data: Omit<TermsTemplate, 'id' | 'createdAt'>): Promise<TermsTemplate | null> {
  try {
    const newTemplate = await securedApiCall<TermsTemplate>('/terms-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return newTemplate;
  } catch (error) {
    console.error('Error creating terms template:', error);
    return null;
  }
}

export async function updateTermsTemplate(id: string, data: Partial<Omit<TermsTemplate, 'id' | 'createdAt'>>): Promise<TermsTemplate | null> {
  try {
    const updatedTemplate = await securedApiCall<TermsTemplate>(`/terms-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return updatedTemplate;
  } catch (error) {
    console.error(`Error updating terms template with ID ${id}:`, error);
    return null;
  }
}

export async function deleteTermsTemplate(id: string): Promise<boolean> {
  try {
    await securedApiCall<null>(`/terms-templates/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error(`Error deleting terms template with ID ${id}:`, error);
    return false;
  }
}

// --- MSA Template Functions ---
export async function getMsaTemplates(): Promise<MsaTemplate[]> {
  try {
    const templates = await securedApiCall<MsaTemplate[]>('/msa-templates');
    return templates || [];
  } catch (error) {
    console.error('Error fetching MSA templates:', error);
    throw new Error('Failed to fetch MSA templates.');
  }
}

export async function getMsaTemplateById(id: string): Promise<MsaTemplate | undefined> {
  try {
    const template = await securedApiCall<MsaTemplate>(`/msa-templates/${id}`);
    return template || undefined;
  } catch (error) {
    console.error(`Error fetching MSA template with ID ${id}:`, error);
    return undefined;
  }
}

export async function createMsaTemplate(data: Omit<MsaTemplate, 'id' | 'createdAt'>): Promise<MsaTemplate | null> {
  try {
    const newTemplate = await securedApiCall<MsaTemplate>('/msa-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return newTemplate;
  } catch (error) {
    console.error('Error creating MSA template:', error);
    return null;
  }
}

export async function updateMsaTemplate(id: string, data: Partial<Omit<MsaTemplate, 'id' | 'createdAt'>>): Promise<MsaTemplate | null> {
  try {
    const updatedTemplate = await securedApiCall<MsaTemplate>(`/msa-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return updatedTemplate;
  } catch (error) {
    console.error(`Error updating MSA template with ID ${id}:`, error);
    return null;
  }
}

export async function deleteMsaTemplate(id: string): Promise<boolean> {
  try {
    await securedApiCall<null>(`/msa-templates/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error(`Error deleting MSA template with ID ${id}:`, error);
    return false;
  }
}

// --- Cover Page Template Functions ---
export async function getCoverPageTemplates(): Promise<CoverPageTemplate[]> {
  try {
    const templates = await securedApiCall<CoverPageTemplate[]>('/cover-page-templates');
    return templates || [];
  } catch (error) {
    console.error('Error fetching cover page templates:', error);
    throw new Error('Failed to fetch cover page templates.');
  }
}

export async function getCoverPageTemplateById(id: string): Promise<CoverPageTemplate | undefined> {
  try {
    const template = await securedApiCall<CoverPageTemplate>(`/cover-page-templates/${id}`);
    return template || undefined;
  } catch (error) {
    console.error(`Error fetching cover page template with ID ${id}:`, error);
    return undefined;
  }
}

export async function createCoverPageTemplate(data: Omit<CoverPageTemplate, 'id' | 'createdAt'>): Promise<CoverPageTemplate | null> {
  try {
    const newTemplate = await securedApiCall<CoverPageTemplate>('/cover-page-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return newTemplate;
  } catch (error) {
    console.error('Error creating cover page template:', error);
    return null;
  }
}

export async function updateCoverPageTemplate(id: string, data: Partial<Omit<CoverPageTemplate, 'id' | 'createdAt'>>): Promise<CoverPageTemplate | null> {
  try {
    const updatedTemplate = await securedApiCall<CoverPageTemplate>(`/cover-page-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return updatedTemplate;
  } catch (error) {
    console.error(`Error updating cover page template with ID ${id}:`, error);
    return null;
  }
}

export async function deleteCoverPageTemplate(id: string): Promise<boolean> {
  try {
    await securedApiCall<null>(`/cover-page-templates/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error(`Error deleting cover page template with ID ${id}:`, error);
    return false;
  }
}

// --- Repository Item Functions ---
export async function getRepositoryItems(): Promise<RepositoryItem[]> {
  try {
    const items = await securedApiCall<RepositoryItem[]>('/repository-items');
    return items || [];
  } catch (error) {
    console.error('Error fetching repository items:', error);
    throw new Error('Failed to fetch repository items.');
  }
}

export async function getRepositoryItemById(id: string): Promise<RepositoryItem | undefined> {
  try {
    const item = await securedApiCall<RepositoryItem>(`/repository-items/${id}`);
    return item || undefined;
  } catch (error) {
    console.error(`Error fetching repository item with ID ${id}:`, error);
    return undefined;
  }
}

export async function createRepositoryItem(data: Omit<RepositoryItem, 'id' | 'createdAt'>): Promise<RepositoryItem | null> {
  try {
    const newItem = await securedApiCall<RepositoryItem>('/repository-items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return newItem;
  } catch (error) {
    console.error('Error creating repository item:', error);
    return null;
  }
}

export async function updateRepositoryItem(id: string, data: Partial<Omit<RepositoryItem, 'id' | 'createdAt'>>): Promise<RepositoryItem | null> {
  try {
    const updatedItem = await securedApiCall<RepositoryItem>(`/repository-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return updatedItem;
  } catch (error) {
    console.error(`Error updating repository item with ID ${id}:`, error);
    return null;
  }
}

export async function deleteRepositoryItem(id: string): Promise<boolean> {
  try {
    await securedApiCall<null>(`/repository-items/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error(`Error deleting repository item with ID ${id}:`, error);
    return false;
  }
}

export async function upsertRepositoryItemFromOrderFormItem(item: any, customerId?: string, customerName?: string): Promise<any | null> {
  const itemToSave = {
    name: item.name,
    defaultRate: item.unitPrice,
    defaultProcurementPrice: item.procurementPrice,
    defaultVendorName: item.vendorName,
    currencyCode: item.currencyCode,
    customerId,
    customerName,
  };
  try {
    const result = await securedApiCall<any>('/repository-items/upsert', { // Assuming your backend has an upsert endpoint
      method: 'POST',
      body: JSON.stringify(itemToSave),
    });
    return result;
  } catch (error) {
    console.error('Error upserting repository item from order form item:', error);
    return null;
  }
}


// --- Purchase Order Functions ---
export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  try {
    const orders = await securedApiCall<PurchaseOrder[]>('/purchase-orders');
    return orders || [];
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    throw new Error('Failed to fetch purchase orders.');
  }
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined> {
  try {
    const order = await securedApiCall<PurchaseOrder>(`/purchase-orders/${id}`);
    return order || undefined;
  } catch (error) {
    console.error(`Error fetching purchase order with ID ${id}:`, error);
    return undefined;
  }
}

type CreatePurchaseOrderInputData = Omit<PurchaseOrder, 'id' | 'createdAt' | 'items' | 'grandTotalVendorPayable'> &
                                    { items: Omit<PurchaseOrderItem, 'id' | 'totalVendorPayable'>[] };

export async function createPurchaseOrder(data: CreatePurchaseOrderInputData): Promise<PurchaseOrder | null> {
  try {
    const newOrder = await securedApiCall<PurchaseOrder>('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return newOrder;
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return null;
  }
}

type UpdatePurchaseOrderInputData = Partial<Omit<PurchaseOrder, 'id' | 'createdAt' | 'items' | 'grandTotalVendorPayable'>> &
                                    { items?: Omit<PurchaseOrderItem, 'id' | 'totalVendorPayable'>[] };

export async function updatePurchaseOrder(id: string, data: UpdatePurchaseOrderInputData): Promise<PurchaseOrder | null> {
  try {
    const updatedOrder = await securedApiCall<PurchaseOrder>(`/purchase-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return updatedOrder;
  } catch (error) {
    console.error(`Error updating purchase order with ID ${id}:`, error);
    return null;
  }
}

export async function deletePurchaseOrder(id: string): Promise<boolean> {
  try {
    await securedApiCall<null>(`/purchase-orders/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error(`Error deleting purchase order with ID ${id}:`, error);
    return false;
  }
}
export async function deletePurchaseOrdersByOrderFormId(orderFormId: string): Promise<boolean> {
  try {
      // यह आपके बैकएंड पर एक नया एंडपॉइंट होगा
      // उदाहरण: DELETE /api/purchase-orders/by-order-form/:orderFormId
      // सुनिश्चित करें कि आपका Express.js बैकएंड इस एंडपॉइंट को हैंडल करता है।
      await securedApiCall<null>(`/purchase-orders/by-order-form/${orderFormId}`, { method: 'DELETE' });
      return true;
  } catch (error) {
      console.error(`Error deleting purchase orders for order form ID ${orderFormId}:`, error);
      // यदि आप विस्तृत त्रुटि संदेश चाहते हैं, तो आप इसे थ्रो भी कर सकते हैं
      // throw new Error(`Failed to delete purchase orders for order form ID ${orderFormId}.`);
      return false;
  }
}

export async function getNextPoNumber(): Promise<string> {
  try {
      // यह आपके बैकएंड पर एक नया एंडपॉइंट होगा
      // उदाहरण: GET /api/purchase-orders/next-number
      // सुनिश्चित करें कि आपका Express.js बैकएंड इस एंडपॉइंट को हैंडल करता है और { nextNumber: string } ऑब्जेक्ट लौटाता है।
      const response = await securedApiCall<{ nextNumber: string }>('/purchase-orders/next-number');
      return response?.nextNumber || 'PO-0001'; // यदि बैकएंड कोई नंबर नहीं देता है तो एक डिफ़ॉल्ट प्रदान करें
  } catch (error) {
      console.error('Error fetching next PO number:', error);
      // आप यहाँ एक उचित त्रुटि हैंडलिंग रणनीति लागू करना चाहेंगे, जैसे उपयोगकर्ता को एक त्रुटि संदेश दिखाना
      throw new Error('Failed to fetch next PO number.');
  }
}

// --- User Data Operations ---
export async function getUsers(): Promise<User[]> {
  try {
    const users = await securedApiCall<User[]>('/users');
    return users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users.');
  }
}

export async function getUserById(id: string): Promise<User | undefined> {
  try {
    const user = await securedApiCall<User>(`/users/${id}`);
    return user || undefined;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    return undefined;
  }
}

export async function createUser(data: Omit<User, 'id' | 'signupDate'>): Promise<User | null> {
  try {
    const newUser = await securedApiCall<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function updateUser(id: string, data: Partial<Omit<User, 'id' | 'signupDate'>>): Promise<User | null> {
  try {
    const updatedUser = await securedApiCall<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return updatedUser;
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    return null;
  }
}

export async function toggleUserActiveStatus(userId: string, isActive: boolean): Promise<User | null> {
  try {
    const updatedUser = await securedApiCall<User>(`/users/${userId}/toggle-active`, {
      method: 'PATCH', // या PUT, आपके बैकएंड API पर निर्भर करता है
      body: JSON.stringify({ isActive }),
    });
    return updatedUser;
  } catch (error) {
    console.error(`Error toggling user active status for ID ${userId}:`, error);
    return null;
  }
}

// Dummy function for branding settings, as your backend handles this now.
export async function updateBrandingSettings(id: string, data: any): Promise<any | null> {
  try {
    const updatedSettings = await securedApiCall<any>(`/branding-settings/${id}`, { // Assuming a specific ID for branding settings or a singleton endpoint
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return updatedSettings;
  } catch (error) {
    console.error('Error updating branding settings:', error);
    return null;
  }
}

export async function getBrandingSettings(id: string = 'default-settings-id'): Promise<any | null> {
  try {
    const settings = await securedApiCall<any>(`/branding-settings/${id}`);
    return settings;
  } catch (error) {
    console.error('Error fetching branding settings:', error);
    return null;
  }
}
export async function upsertRepositoryItemFromOrderForm(
  item: {
      description: string;
      unitPrice?: number;
      procurementPrice?: number;
      vendorName?: string;
      currencyCode?: string; // इसे यहाँ शामिल किया गया है
  },
  customerId?: string,
  customerName?: string,
  // currencyCode?: string // यदि आप इसे आइटम ऑब्जेक्ट के बाहर पास करना चाहते हैं तो इसे अनकमेंट करें
): Promise<RepositoryItem | null> {
  try {
      const itemToSave = {
          name: item.description, // आमतौर पर, विवरण को नाम के रूप में उपयोग करें
          defaultRate: item.unitPrice,
          defaultProcurementPrice: item.procurementPrice,
          defaultVendorName: item.vendorName,
          customerId: customerId,
          customerName: customerName,
          currencyCode: item.currencyCode, // आइटम ऑब्जेक्ट से मुद्रा कोड का उपयोग करें
          // यदि आप `currencyCode` को एक अलग पैरामीटर के रूप में पास करते हैं: currencyCode: currencyCode,
      };

      // पहले से मौजूद आइटम को खोजने का प्रयास करें
      // यह मानकर कि आपके पास एक API एंडपॉइंट है जो नाम और ग्राहक आईडी से आइटम खोज सकता है।
      // उदाहरण: GET /api/repository-items?name=itemName&customerId=customerId
      const existingItems = await securedApiCall<RepositoryItem[]>(
          `/repository-items?name=${encodeURIComponent(item.description)}&customerId=${customerId || ''}`
      );

      if (existingItems && existingItems.length > 0) {
          // आइटम पहले से मौजूद है, इसे अपडेट करें
          const existingItem = existingItems[0];
          const updatedItem = await securedApiCall<RepositoryItem>(
              `/repository-items/${existingItem.id}`,
              {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(itemToSave),
              }
          );
          return updatedItem;
      } else {
          // आइटम मौजूद नहीं है, इसे बनाएं
          const newItem = await securedApiCall<RepositoryItem>(
              '/repository-items',
              {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(itemToSave),
              }
          );
          return newItem;
      }
  } catch (error) {
      console.error("Error in upsertRepositoryItemFromOrderForm:", error);
      // एक अधिक विशिष्ट त्रुटि फेंकने पर विचार करें
      return null;
  }
}