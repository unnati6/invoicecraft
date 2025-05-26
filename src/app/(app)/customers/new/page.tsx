
'use client';

import * as React from 'react';
// Removed AppHeader, CustomerForm, useRouter, useToast, CustomerFormData
// Removed import of createNewCustomer from '../../../../lib/customer-actions'

// Define an ultra-minimal server action directly in the page file
async function minimalTestAction(formData: FormData): Promise<void> {
  'use server';
  const name = formData.get('name') as string;
  console.log("[NewCustomerPage Ultra-Minimal Action] minimalTestAction called. Name:", name);
  // Does nothing else for diagnostic purposes.
}

export default function NewCustomerPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      await minimalTestAction(formData);
      alert("Minimal test action called. Check server console.");
    } catch (error) {
      console.error("Failed to call minimalTestAction:", error);
      alert("Error calling minimal test action. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', margin: '20px', border: '1px solid black' }}>
      <h1>New Customer Page (Minimal Diagnostic)</h1>
      <p>This page has been stripped down to test a very basic server action.</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="nameInput" style={{ marginRight: '10px' }}>Test Name: </label>
          <input type="text" id="nameInput" name="name" defaultValue="Test Name Input" style={{ padding: '5px', border: '1px solid #ccc' }} />
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting} 
          style={{ padding: '8px 15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isSubmitting ? 'Calling Action...' : 'Call Minimal Test Action'}
        </button>
      </form>
      {isSubmitting && <p style={{ marginTop: '10px' }}>Submitting...</p>}
    </div>
  );
}
