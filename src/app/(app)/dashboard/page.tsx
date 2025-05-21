
'use client';

import * as React from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { Invoice, Customer } from '@/types';
import { getAllInvoices, getAllCustomers } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { DashboardChart, type ChartData } from '@/components/dashboard-chart';
import { getCurrencySymbol } from '@/lib/currency-utils';

export default function DashboardPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string>('all');
  const [chartData, setChartData] = React.useState<ChartData[]>([]);
  const [summaryStats, setSummaryStats] = React.useState<{ totalSales: number; received: number; pending: number; currencySymbol: string; customerName?: string }>({
    totalSales: 0,
    received: 0,
    pending: 0,
    currencySymbol: '$',
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [invoiceData, customerData] = await Promise.all([
          getAllInvoices(),
          getAllCustomers(),
        ]);
        setInvoices(invoiceData);
        setCustomers(customerData);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch dashboard data.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  React.useEffect(() => {
    if (invoices.length === 0 && !loading) { // Don't process if no invoices or still loading initial data
        setChartData([]);
        setSummaryStats({ totalSales: 0, received: 0, pending: 0, currencySymbol: '$' });
        return;
    }

    let filteredInvoices = invoices;
    let currentCurrencySymbol = '$'; // Default
    let customerNameDisplay;


    if (selectedCustomerId !== 'all') {
      filteredInvoices = invoices.filter(inv => inv.customerId === selectedCustomerId);
      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
      if (selectedCustomer) {
        currentCurrencySymbol = getCurrencySymbol(selectedCustomer.currency);
        customerNameDisplay = selectedCustomer.name;
      }
    } else {
      // For "All Customers", we might need a more sophisticated currency handling 
      // if invoices can have different currencies. For simplicity, let's assume a primary currency (e.g., USD) 
      // or if all customers use the same currency.
      // This example will just use the default symbol if "All" is selected.
      // A better approach would be to convert all amounts to a base currency for "All Customers" view.
      currentCurrencySymbol = getCurrencySymbol('USD'); // Or your app's base currency
      customerNameDisplay = "All Customers";
    }

    const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const paymentsReceived = filteredInvoices
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    const paymentsPending = filteredInvoices
      .filter(inv => inv.status === 'Sent' || inv.status === 'Overdue')
      .reduce((sum, inv) => sum + inv.total, 0);

    setChartData([
      { name: 'Total Sales', value: totalSales, fill: 'hsl(var(--chart-1))' },
      { name: 'Payments Received', value: paymentsReceived, fill: 'hsl(var(--chart-2))' },
      { name: 'Payments Pending', value: paymentsPending, fill: 'hsl(var(--chart-3))' },
    ]);
    
    setSummaryStats({
        totalSales,
        received: paymentsReceived,
        pending: paymentsPending,
        currencySymbol: currentCurrencySymbol,
        customerName: customerNameDisplay
    });

  }, [invoices, customers, selectedCustomerId, loading]);

  if (loading) {
    return (
      <>
        <AppHeader title="Dashboard" />
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <div className="grid gap-6 md:grid-cols-3">
            {[1,2,3].map(i => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-5 w-24 mb-1"/>
                        <Skeleton className="h-8 w-32"/>
                    </CardHeader>
                </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="h-[350px]">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Dashboard" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-semibold">
                Sales Overview {summaryStats.customerName && summaryStats.customerName !== "All Customers" ? `for ${summaryStats.customerName}` : `(All Customers)`}
            </h2>
            <Card className="w-full sm:w-auto sm:min-w-[250px]">
                <CardContent className="p-3">
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Customer" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Total Sales</CardDescription>
              <CardTitle className="text-3xl">{summaryStats.currencySymbol}{summaryStats.totalSales.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Payments Received</CardDescription>
              <CardTitle className="text-3xl">{summaryStats.currencySymbol}{summaryStats.received.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Payments Pending</CardDescription>
              <CardTitle className="text-3xl">{summaryStats.currencySymbol}{summaryStats.pending.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Metrics Overview</CardTitle>
            <CardDescription>
              Bar chart showing sales, received, and pending amounts.
              {selectedCustomerId === 'all' && invoices.length > 0 && (
                 <span className="text-xs block text-muted-foreground/80 mt-1">
                    Note: "All Customers" view uses {getCurrencySymbol('USD')} as the default currency for aggregated totals. Individual customer views will use their specific currency.
                 </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] p-2 sm:p-6">
            {chartData.length > 0 ? (
              <DashboardChart data={chartData} currencySymbol={summaryStats.currencySymbol} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data to display for the current selection.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
