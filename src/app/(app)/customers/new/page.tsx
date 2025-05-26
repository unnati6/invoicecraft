
'use client';

import * as React from 'react';
// All other imports like AppHeader, CustomerForm, useToast, useRouter are removed for this test.
// Only import what's absolutely necessary for the minimal test.
import { ultraMinimalServerActionForNewCustomerPage } from '../../../../lib/new-customer-page-actions';

export default function NewCustomerPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      await ultraMinimalServerActionForNewCustomerPage();
      setMessage("Ultra minimal server action (from separate file) called successfully. Check server console.");
    } catch (error: any) {
      console.error("Failed to call ultraMinimalServerActionForNewCustomerPage:", error);
      setMessage(`Error calling action: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', margin: '20px', border: '1px solid black' }}>
      <h1>New Customer Page (Ultra Minimal External Server Action Test)</h1>
      <p>This page tests if any server action, when defined in its own dedicated file, can be bundled for this route.</p>
      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ padding: '8px 15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isSubmitting ? 'Calling Action...' : 'Call Ultra Minimal External Action'}
        </button>
      </form>
      {message && <p style={{ marginTop: '10px', color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}
