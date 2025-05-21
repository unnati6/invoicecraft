
'use client';

import type { Invoice, Customer } from '@/types';
import { format } from 'date-fns';

interface InvoicePreviewContentProps {
  document: Invoice; // Changed from 'invoice' to 'document' for consistency
  customer?: Customer;
}

export function InvoicePreviewContent({ document: invoice, customer }: InvoicePreviewContentProps) {
  const customerToDisplay = customer || { 
    name: invoice.customerName || 'N/A', 
    email: 'N/A', // Assuming customer object might be minimal
    address: undefined 
  };

  // If customer object is passed, use its details more directly
  if (customer) {
    customerToDisplay.name = customer.name;
    customerToDisplay.email = customer.email;
    // customerToDisplay.address = customer.address; // This is already covered
  }


  return (
    <div className="p-6 bg-card text-foreground font-sans text-sm"> {/* Added base font styles */}
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
          <p className="text-muted-foreground">Invoice #: {invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold">InvoiceCraft Inc.</h2>
          <p className="text-sm text-muted-foreground">123 App Street, Suite 4B</p>
          <p className="text-sm text-muted-foreground">DevCity, ST 54321</p>
          <p className="text-sm text-muted-foreground">contact@invoicecraft.com</p>
        </div>
      </div>

      {/* Bill To and Dates */}
      <div className="grid grid-cols-2 gap-8 mb-8"> {/* Changed to grid-cols-2 for consistency */}
        <div>
          <h3 className="font-semibold mb-1 text-muted-foreground">BILL TO:</h3>
          <p className="font-medium">{customerToDisplay.name}</p>
          {customerToDisplay.address && (
            <>
              <p className="text-sm">{customerToDisplay.address.street}</p>
              <p className="text-sm">{customerToDisplay.address.city}, {customerToDisplay.address.state} {customerToDisplay.address.zip}</p>
              <p className="text-sm">{customerToDisplay.address.country}</p>
            </>
          )}
          <p className="text-sm">{customerToDisplay.email}</p>
        </div>
        <div className="text-left md:text-right"> {/* Ensure text-right on larger screens */}
          <p><span className="font-semibold text-muted-foreground">Issue Date:</span> {format(new Date(invoice.issueDate), 'PPP')}</p>
          <p><span className="font-semibold text-muted-foreground">Due Date:</span> {format(new Date(invoice.dueDate), 'PPP')}</p>
          <p className="mt-2"><span className="font-semibold text-muted-foreground">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'Paid' ? 'bg-green-100 text-green-700' : invoice.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{invoice.status}</span></p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse"> {/* Added border-collapse */}
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left font-semibold border border-border">Description</th>
              <th className="p-2 text-right font-semibold border border-border">Quantity</th>
              <th className="p-2 text-right font-semibold border border-border">Rate</th>
              <th className="p-2 text-right font-semibold border border-border">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-border">
                <td className="p-2 border border-border">{item.description}</td>
                <td className="p-2 text-right border border-border">{item.quantity.toFixed(2)}</td>
                <td className="p-2 text-right border border-border">${item.rate.toFixed(2)}</td>
                <td className="p-2 text-right border border-border">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax ({invoice.taxRate}%):</span>
            <span>${invoice.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 mt-2">
            <span className="font-bold text-lg">Total:</span>
            <span className="font-bold text-lg">${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      {invoice.termsAndConditions && (
        <div className="mb-8">
          <h3 className="font-semibold mb-2 text-muted-foreground">Terms & Conditions:</h3>
          <p className="text-sm whitespace-pre-wrap">{invoice.termsAndConditions}</p>
        </div>
      )}

      {/* Footer Note */}
      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
}

InvoicePreviewContent.displayName = "InvoicePreviewContent";
