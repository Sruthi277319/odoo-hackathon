import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  Truck,
  Percent,
  Wrench,
  Users,
  Navigation,
  Clock,
  AlertTriangle,
  CheckCircle,
  Shield,
  ShieldAlert,
  Gauge,
  ClipboardCheck,
  DollarSign,
  CreditCard,
  TrendingDown,
  PieChart,
  RefreshCw,
  TrendingUp,
  CircleAlert
} from 'lucide-react';
import Card from '../components/common/Card';

// Map icon string names to components
const IconMap = {
  Truck,
  Percent,
  Wrench,
  Users,
  Navigation,
  Clock,
  AlertTriangle,
  CheckCircle,
  Shield,
  ShieldAlert,
  Gauge,
  ClipboardCheck,
  DollarSign,
  CreditCard,
  TrendingDown,
  PieChart,
};

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Fetch stats error:', err);
        setError('Failed to fetch dashboard metrics. Please verify backend connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [refreshKey]);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  // Loading skeleton screen
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Welcome Banner Skeleton */}
        <div className="h-32 rounded-3xl bg-slate-200/50 dark:bg-dark-900/35 animate-pulse border border-white/20 dark:border-slate-800/30" />
        
        {/* Grid Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200/50 dark:bg-dark-900/35 animate-pulse border border-white/20 dark:border-slate-800/30 p-5 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-slate-300 dark:bg-slate-700/60 rounded" />
                <div className="h-8 w-8 bg-slate-300 dark:bg-slate-700/60 rounded-lg" />
              </div>
              <div className="h-6 w-16 bg-slate-300 dark:bg-slate-700/60 rounded" />
              <div className="h-3.5 w-32 bg-slate-300 dark:bg-slate-700/60 rounded" />
            </div>
          ))}
        </div>

        {/* Lower body skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-80 rounded-2xl bg-slate-200/50 dark:bg-dark-900/35 animate-pulse border border-white/20 dark:border-slate-800/30" />
          <div className="lg:col-span-4 h-80 rounded-2xl bg-slate-200/50 dark:bg-dark-900/35 animate-pulse border border-white/20 dark:border-slate-800/30" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-red-500/20 bg-red-500/5 backdrop-blur-sm max-w-2xl mx-auto my-12">
        <CircleAlert className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Service Offline</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{error}</p>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-primary-500/10"
        >
          <RefreshCw className="w-4 h-4" /> Retry Connection
        </button>
      </div>
    );
  }

  // Animation variants for container cascading entry
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <div className="space-y-7">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6.5 bg-gradient-to-r from-primary-600 to-indigo-700 text-white shadow-xl dark:from-primary-650 dark:to-indigo-850">
        {/* Glow shape */}
        <div className="absolute right-[-100px] top-[-100px] w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-200 block mb-1">
              Active Control Center
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}
            </h2>
            <p className="text-xs text-primary-100 mt-1 leading-normal max-w-xl">
              TransitOps Pro has logged 0 critical delays. All safety checklists for the morning shift are validated.
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 self-start md:self-auto px-4 py-2 bg-white/10 hover:bg-white/20 active:bg-white/35 text-white font-semibold text-xs rounded-xl backdrop-blur-sm transition-all border border-white/10"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Metrics
          </button>
        </div>
      </div>

      {/* Animated KPI Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {stats?.kpis?.map((kpi, idx) => {
          const IconComponent = IconMap[kpi.icon] || Truck;
          const isSuccess = kpi.status === 'success';
          const isWarning = kpi.status === 'warning';
          const isDanger = kpi.status === 'danger';

          return (
            <motion.div key={idx} variants={cardVariants}>
              <Card className="flex flex-col justify-between h-full !p-5 relative overflow-hidden group">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {kpi.title}
                  </span>
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    isSuccess
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : isWarning
                      ? 'bg-amber-500/10 text-amber-500'
                      : isDanger
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-primary-500/10 text-primary-500'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">
                    {kpi.value}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                    {kpi.change.includes('+') || kpi.change.includes('reduction') ? (
                      <span className="text-emerald-500 font-bold flex items-center">
                        <TrendingUp className="w-3 h-3 mr-0.5 shrink-0" />
                        {kpi.change}
                      </span>
                    ) : kpi.change.includes('-') ? (
                      <span className="text-red-500 font-bold flex items-center">
                        <TrendingDown className="w-3 h-3 mr-0.5 shrink-0" />
                        {kpi.change}
                      </span>
                    ) : (
                      <span>{kpi.change}</span>
                    )}
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Dynamic Activity Log & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Log Component */}
        <div className="lg:col-span-8">
          <Card title="Operational Logs" subtitle="Live security events and database entries">
            <div className="divide-y divide-slate-150/40 dark:divide-slate-800/40 mt-1">
              {stats?.activityLog?.map((log) => (
                <div key={log.id} className="py-3.5 flex justify-between items-center gap-4 text-xs">
                  <div className="flex gap-3 items-center">
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {log.action}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                        Logged by <span className="font-medium">{log.user}</span>
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium shrink-0">
                    {log.time}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* System Alerts Side-Drawer */}
        <div className="lg:col-span-4">
          <Card title="System Priority Alerts" subtitle="Requires action or acknowledgment">
            <div className="space-y-3 mt-1.5">
              {stats?.systemAlerts?.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border flex gap-2.5 items-start text-xs ${
                    alert.type === 'critical'
                      ? 'bg-red-500/5 border-red-500/15 text-red-650 dark:text-red-400'
                      : alert.type === 'warning'
                      ? 'bg-amber-500/5 border-amber-500/15 text-amber-650 dark:text-amber-400'
                      : 'bg-primary-500/5 border-primary-500/15 text-primary-650 dark:text-primary-400'
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                    alert.type === 'critical' ? 'text-red-500' : alert.type === 'warning' ? 'text-amber-500' : 'text-primary-500'
                  }`} />
                  <div>
                    <p className="leading-relaxed font-medium">{alert.message}</p>
                    <span className="text-[9px] opacity-60 mt-1 block font-semibold">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default DashboardHome;
