
'use client';

import * as React from 'react';
// All other imports like AppHeader, CustomerForm, useToast, useRouter are removed for this test.

// Define an ultra-minimal server action directly in the page file
async function ultraMinimalServerAction(): Promise<void> {
  'use server';
  console.log("[NewCustomerPage Ultra-Minimal Action] ultraMinimalServerAction called.");
  // Does absolutely nothing.
}

export default function NewCustomerPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      await ultraMinimalServerAction();
      setMessage("Ultra minimal server action called successfully. Check server console.");
    } catch (error: any) {
      console.error("Failed to call ultraMinimalServerAction:", error);
      setMessage(`Error calling action: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', margin: '20px', border: '1px solid black' }}>
      <h1>New Customer Page (Ultra Minimal Server Action Test)</h1>
      <p>This page tests if any server action can be bundled for this route.</p>
      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ padding: '8px 15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isSubmitting ? 'Calling Action...' : 'Call Ultra Minimal Action'}
        </button>
      </form>
      {message && <p style={{ marginTop: '10px', color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}
