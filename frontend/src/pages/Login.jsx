import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, ShieldAlert, Truck, ChevronRight } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login submit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to prefill and submit demo roles
  const handleDemoLogin = (email, password) => {
    setValue('email', email);
    setValue('password', password);
    handleSubmit(onSubmit)();
  };

  const demoAccounts = [
    { role: 'Fleet Manager', email: 'manager@transitops.com', color: 'from-blue-500 to-indigo-600' },
    { role: 'Dispatcher', email: 'dispatcher@transitops.com', color: 'from-emerald-500 to-teal-600' },
    { role: 'Safety Officer', email: 'safety@transitops.com', color: 'from-orange-500 to-red-600' },
    { role: 'Financial Analyst', email: 'finance@transitops.com', color: 'from-purple-500 to-pink-600' },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 overflow-hidden px-4">
      {/* Background Orbs */}
      <div className="bg-glow-orb w-[400px] h-[400px] bg-primary-500 top-[-100px] left-[-100px]" />
      <div className="bg-glow-orb w-[500px] h-[500px] bg-pink-500 bottom-[-150px] right-[-150px]" />
      
      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 items-center relative z-10 py-12">
        {/* Left Side: Brand Introduction */}
        <div className="md:col-span-6 flex flex-col gap-6 text-left md:pr-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-600 rounded-2xl text-white shadow-xl dark:bg-primary-500">
              <Truck className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest text-primary-600 dark:text-primary-400 uppercase">
                Enterprise Suite
              </span>
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 leading-none">
                TransitOps Pro
              </h1>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
              Smart Fleet <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">Intelligence</span> Platform
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Consolidate operations, dispatch logs, driver safety scores, and financial expenditures in a unified enterprise control center.
            </p>
          </div>

          {/* Quick Demo Selector */}
          <div className="space-y-3 mt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Instant Demo Workspaces
            </span>
            <div className="grid grid-cols-2 gap-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleDemoLogin(account.email, 'password123')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-dark-900/10 backdrop-blur-sm transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white/60 text-left group"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {account.role}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[120px]">
                      {account.email}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Box */}
        <div className="md:col-span-6 w-full max-w-md mx-auto">
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-indigo-600" />
            
            <div className="mb-6.5 text-center md:text-left">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Secure Sign In
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter credentials to access your organization dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Corporate Email Address"
                name="email"
                type="email"
                icon={Mail}
                placeholder="name@company.com"
                error={errors.email}
                required
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />

              <Input
                label="System Password"
                name="password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                error={errors.password}
                required
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />

              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 dark:border-slate-800 text-primary-600 focus:ring-primary-500/25 bg-transparent"
                  />
                  Remember session
                </label>
                <a href="#forgot" className="text-primary-600 hover:underline dark:text-primary-400">
                  Forgot Password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full py-3 mt-2"
                isLoading={isLoading}
              >
                Sign In to Platform
              </Button>
            </form>

            <div className="flex gap-2 items-center p-3.5 mt-6 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-600 dark:text-amber-400/90 text-xs">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <p className="leading-snug">
                Authorized personnel access only. System sessions are fully monitored and audited.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
