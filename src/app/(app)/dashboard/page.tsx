
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CurrencySummary {
  currencyCode: string;
  totalInCurrency: number;
  totalInUSD: number;
  symbol: string;
}

// Mock conversion rates for prototype. In a real app, fetch this from an API.
const MOCK_CONVERSION_RATES_TO_USD: Record<string, number> = {
  USD: 1,
  EUR: 1.08, // Example rate
  GBP: 1.27, // Example rate
  INR: 0.012, // Example rate
  CAD: 0.73, // Example rate
  AUD: 0.66, // Example rate
  JPY: 0.0067, // Example rate
};


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
  const [currencyBreakdown, setCurrencyBreakdown] = React.useState<CurrencySummary[]>([]);
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
    if (invoices.length === 0 && !loading) { 
        setChartData([]);
        setSummaryStats({ totalSales: 0, received: 0, pending: 0, currencySymbol: '$' });
        setCurrencyBreakdown([]);
        return;
    }

    let filteredInvoices = invoices;
    let currentCurrencySymbol = '$'; 
    let customerNameDisplay;

    if (selectedCustomerId !== 'all') {
      filteredInvoices = invoices.filter(inv => inv.customerId === selectedCustomerId);
      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
      if (selectedCustomer) {
        currentCurrencySymbol = getCurrencySymbol(selectedCustomer.currency);
        customerNameDisplay = selectedCustomer.name;
      }
    } else {
      currentCurrencySymbol = getCurrencySymbol('USD'); 
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

    // Calculate currency breakdown
    const salesByCurrency: Record<string, { total: number, symbol: string }> = {};
    filteredInvoices.forEach(inv => {
      const code = inv.currencyCode || 'USD'; // Default to USD if not specified
      if (!salesByCurrency[code]) {
        salesByCurrency[code] = { total: 0, symbol: getCurrencySymbol(code) };
      }
      salesByCurrency[code].total += inv.total;
    });

    const breakdownResult: CurrencySummary[] = Object.entries(salesByCurrency)
      .map(([code, data]) => {
        const rate = MOCK_CONVERSION_RATES_TO_USD[code] || 1; // Default to 1 if rate not found (for USD or unlisted)
        return {
          currencyCode: code,
          totalInCurrency: data.total,
          totalInUSD: data.total * rate,
          symbol: data.symbol,
        };
      })
      .sort((a, b) => b.totalInUSD - a.totalInUSD); // Sort by USD value descending

    setCurrencyBreakdown(breakdownResult);

  }, [invoices, customers, selectedCustomerId, loading]);

  if (loading) {
    return (
      <>
        <AppHeader title="Dashboard" />
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <Card className="w-full max-w-sm">
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-10 w-full" /></CardContent>
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
            <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
            <CardContent className="h-[350px]"><Skeleton className="h-full w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full" />
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

        <div className="grid gap-6 md:grid-cols-2">
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
            <Card>
                <CardHeader>
                    <CardTitle>Sales by Currency</CardTitle>
                    <CardDescription>Total sales broken down by currency and their USD equivalent (using mock rates).</CardDescription>
                </CardHeader>
                <CardContent>
                {currencyBreakdown.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Currency</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">USD Equivalent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {currencyBreakdown.map(item => (
                            <TableRow key={item.currencyCode}>
                                <TableCell>{item.currencyCode}</TableCell>
                                <TableCell className="text-right">{item.symbol}{item.totalInCurrency.toFixed(2)}</TableCell>
                                <TableCell className="text-right">${item.totalInUSD.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    No sales data for currency breakdown.
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}

