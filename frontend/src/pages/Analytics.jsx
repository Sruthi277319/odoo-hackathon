import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Card from '../components/Card';
import { CardSkeleton, Skeleton } from '../components/Skeleton';
import {
  CostTrendChart,
  BreakdownPieChart,
  EfficiencyBarChart
} from '../components/AnalyticsCharts';
import {
  TrendingUp,
  Activity,
  Award,
  DollarSign,
  TrendingDown,
  Navigation,
  Compass,
  AlertTriangle
} from 'lucide-react';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    fuelEfficiency: [],
    fleetUtilization: {},
    expenseBreakdown: [],
    monthlyTrend: [],
    vehicleROI: [],
    driverPerformance: [],
    topVehicles: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/overview');
        setData(res);
        setError(null);
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError('Failed to fetch analytics statistics. Ensure backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <Skeleton width="180px" height="28px" style={{ marginBottom: '8px' }} />
          <Skeleton width="300px" height="16px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Skeleton height="350px" borderRadius="var(--border-radius-lg)" />
          <Skeleton height="350px" borderRadius="var(--border-radius-lg)" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ borderLeft: '4px solid rgb(var(--color-danger))', padding: '24px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <AlertTriangle style={{ color: 'rgb(var(--color-danger))' }} size={32} />
        <div>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Backend Offline</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>{error}</p>
        </div>
      </div>
    );
  }

  // Calculate aggregated stats
  const totalCost = data.expenseBreakdown.reduce((sum, item) => sum + item.value, 0);
  const avgEfficiency = data.fuelEfficiency.length > 0
    ? (data.fuelEfficiency.reduce((sum, item) => sum + item.efficiency, 0) / data.fuelEfficiency.length).toFixed(2)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }} className="text-gradient-primary">
          Operations Analytics
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Real-time fleet efficiency, expenses, and asset return on investment profiles.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <Card title="Operational Cost" subtitle="Total expenses captured" action={<DollarSign size={20} style={{ color: 'rgb(var(--color-primary))' }} />}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800 }}>${totalCost.toLocaleString()}</span>
            <span style={{ color: 'rgb(var(--color-danger))', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <TrendingUp size={14} style={{ marginRight: '2px' }} /> +4.2%
            </span>
          </div>
        </Card>

        <Card title="Fleet Utilization" subtitle="Percentage of active vehicles" action={<Activity size={20} style={{ color: 'rgb(var(--color-success))' }} />}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800 }}>{data.fleetUtilization?.utilizationRate || 0}%</span>
            <span style={{ color: 'rgb(var(--color-success))', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <Compass size={14} style={{ marginRight: '2px' }} /> Optimal
            </span>
          </div>
        </Card>

        <Card title="Fuel Efficiency" subtitle="Fleet average index" action={<Navigation size={20} style={{ color: 'rgb(var(--color-info))' }} />}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800 }}>{avgEfficiency} <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-muted)' }}>KM/L</span></span>
            <span style={{ color: 'rgb(var(--color-success))', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <TrendingUp size={14} style={{ marginRight: '2px' }} /> +1.8%
            </span>
          </div>
        </Card>

        <Card title="Safety Score" subtitle="Driver behavior average" action={<Award size={20} style={{ color: 'rgb(var(--color-warning))' }} />}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800 }}>
              {data.driverPerformance?.length > 0
                ? Math.round(data.driverPerformance.reduce((sum, d) => sum + d.safetyScore, 0) / data.driverPerformance.length)
                : 90}/100
            </span>
            <span style={{ color: 'rgb(var(--color-success))', fontSize: '12px', fontWeight: 600 }}>Excellent</span>
          </div>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '25px' }}>
        <Card title="Operational Cost Trend" subtitle="Monthly fuel vs maintenance expenditures">
          <CostTrendChart data={data.monthlyTrend} />
        </Card>

        <Card title="Expense Category Breakdown" subtitle="Distribution of overall logged payments">
          <div style={{ display: 'flex', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
            {data.expenseBreakdown.some(d => d.value > 0) ? (
              <BreakdownPieChart data={data.expenseBreakdown} />
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '50px' }}>
                No expense data logged yet. Create fuel or maintenance records first.
              </div>
            )}
          </div>
        </Card>

        <Card title="Fuel Efficiency Index" subtitle="Kilometers traveled per liter by vehicle">
          {data.fuelEfficiency.length > 0 ? (
            <EfficiencyBarChart data={data.fuelEfficiency} />
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '50px' }}>
              No fuel logs logged yet. Create logs in the Fuel module.
            </div>
          )}
        </Card>

        {/* Vehicle ROI Summary */}
        <Card title="Vehicle Operational Return (ROI)" subtitle="Calculated vehicle revenue vs accumulated costs">
          <div className="table-container" style={{ maxHeight: '300px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>License</th>
                  <th>Expenses</th>
                  <th>Est. Revenue</th>
                  <th>ROI Index</th>
                </tr>
              </thead>
              <tbody>
                {data.vehicleROI.map((v) => (
                  <tr key={v.vehicleId}>
                    <td style={{ fontWeight: 600 }}>{v.vehicleName}</td>
                    <td><span className="badge badge-info">{v.licensePlate}</span></td>
                    <td style={{ color: 'rgb(var(--color-danger))' }}>${v.expenses.toLocaleString()}</td>
                    <td style={{ color: 'rgb(var(--color-success))' }}>${v.revenue.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${v.roi >= 120 ? 'badge-success' : v.roi >= 90 ? 'badge-warning' : 'badge-danger'}`}>
                        {v.roi}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Top Drivers & Top Vehicles Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>
        <Card title="Safety Leaderboard" subtitle="Top drivers ranked by safety rating & fuel economy">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Safety Score</th>
                  <th>Rating</th>
                  <th>Eco Score</th>
                </tr>
              </thead>
              <tbody>
                {data.driverPerformance.slice(0, 4).map((d) => (
                  <tr key={d._id}>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                          <div style={{ width: `${d.safetyScore}%`, height: '100%', background: 'rgb(var(--color-success))' }} />
                        </div>
                        <span style={{ fontSize: '12px' }}>{d.safetyScore}%</span>
                      </div>
                    </td>
                    <td>★ {d.rating.toFixed(1)}</td>
                    <td><span className="badge badge-success">{d.fuelEfficiencyScore}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Fleet Status Summary" subtitle="Top reliable vehicles by health score">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>License</th>
                  <th>Health</th>
                  <th>Expenses</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.topVehicles.slice(0, 4).map((v) => (
                  <tr key={v._id}>
                    <td style={{ fontWeight: 600 }}>{v.name}</td>
                    <td><span className="badge badge-info">{v.licensePlate}</span></td>
                    <td>
                      <span style={{ fontWeight: 700, color: v.healthScore >= 90 ? 'rgb(var(--color-success))' : v.healthScore >= 75 ? 'rgb(var(--color-warning))' : 'rgb(var(--color-danger))' }}>
                        {v.healthScore}%
                      </span>
                    </td>
                    <td>${v.expenses.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${v.status === 'Available' ? 'badge-success' : v.status === 'In Shop' ? 'badge-warning' : 'badge-danger'}`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
