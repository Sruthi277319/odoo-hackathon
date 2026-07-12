import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { MonthlyBarChart, BreakdownPieChart } from '../components/AnalyticsCharts';
import { Calendar, Download, RefreshCw, FileText, BarChart, PieChart } from 'lucide-react';

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Date filter states
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3); // default 3 months
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [summaryData, setSummaryData] = useState({
    totalSpent: 0,
    pieData: [],
    barData: [],
  });

  const fetchReportsSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/summary?startDate=${startDate}&endDate=${endDate}`);
      setSummaryData(res);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch reports dashboard summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsSummary();
  }, [startDate, endDate]);

  // Utility to convert flat JSON array into download-ready CSV strings
  const downloadCSV = (data, filename) => {
    if (data.length === 0) {
      alert('No record history found in the chosen date range to export.');
      return;
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(fieldName => {
          // Escape quotes/commas
          const val = row[fieldName] !== undefined && row[fieldName] !== null ? row[fieldName] : '';
          const cleanVal = typeof val === 'string' 
            ? `"${val.replace(/"/g, '""')}"` 
            : val;
          return cleanVal;
        }).join(',')
      )
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (category) => {
    try {
      const res = await api.get(`/reports/export?startDate=${startDate}&endDate=${endDate}`);
      if (category === 'expenses') {
        downloadCSV(res.expenses, 'TransitOps_Expenses_Report');
      } else if (category === 'fuel') {
        downloadCSV(res.fuelLogs, 'TransitOps_Fuel_Report');
      } else if (category === 'maintenance') {
        downloadCSV(res.maintenance, 'TransitOps_Maintenance_Report');
      }
    } catch (err) {
      console.error('CSV Export failed:', err);
      alert('Failed to retrieve export datasets. Ensure backend is running.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }} className="text-gradient-primary">
          Executive Reports
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Query custom timelines, analyze category percentages, and download formatted spreadsheet reports.
        </p>
      </div>

      {/* Date Range Picker Filters */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '13px', fontWeight: 500 }}>Date Range:</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
                style={{ padding: '8px 12px', fontSize: '13px', width: '150px' }}
              />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input"
                style={{ padding: '8px 12px', fontSize: '13px', width: '150px' }}
              />
            </div>
          </div>

          <Button onClick={fetchReportsSummary} variant="secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <RefreshCw size={14} /> Refresh Query
          </Button>
        </div>
      </div>

      {/* Export Action Card Grid */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Spreadsheet Data Exports</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <Card title="Expenses Report" subtitle="Download raw operational invoices (Fuel + Repairs + Tolls)" action={<FileText size={18} style={{ color: 'rgb(var(--color-primary))' }} />}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '15px', minHeight: '36px' }}>
              Includes date stamp, transaction categories, linked vehicle details, and reference descriptions.
            </p>
            <Button onClick={() => handleExport('expenses')} style={{ width: '100%' }}>
              <Download size={14} /> Export Expenses CSV
            </Button>
          </Card>

          <Card title="Fuel Refuels Report" subtitle="Download fleet gasoline and diesel consumption data" action={<FileText size={18} style={{ color: 'rgb(var(--color-success))' }} />}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '15px', minHeight: '36px' }}>
              Contains filled liters, mileage cost, calculated distance traveled, and exact KM/L efficiency parameters.
            </p>
            <Button onClick={() => handleExport('fuel')} style={{ width: '100%' }} variant="primary">
              <Download size={14} /> Export Fuel Logs CSV
            </Button>
          </Card>

          <Card title="Maintenance History" subtitle="Download structural repair and tuneup timelines" action={<FileText size={18} style={{ color: 'rgb(var(--color-warning))' }} />}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '15px', minHeight: '36px' }}>
              Includes start/end logs, specific maintenance types, description text, priority levels, and repair fees.
            </p>
            <Button onClick={() => handleExport('maintenance')} style={{ width: '100%' }}>
              <Download size={14} /> Export Maintenance CSV
            </Button>
          </Card>
        </div>
      </div>

      {/* Visual Analytics Summary in Range */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Visual Summary Metrics (Selected Range)</h3>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <Skeleton height="300px" />
            <Skeleton height="300px" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>
            <Card title="Overhead Cost Trend" subtitle="Monthly cost changes across the selected period">
              {summaryData.barData.length > 0 ? (
                <MonthlyBarChart data={summaryData.barData} />
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '50px' }}>
                  No expenditures detected within the selected date range.
                </div>
              )}
            </Card>

            <Card title="Category Breakdown" subtitle="Distribution of invoices in range">
              {summaryData.totalSpent > 0 ? (
                <BreakdownPieChart data={summaryData.pieData} />
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '50px' }}>
                  No expenses found for this date range.
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
