import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { User, Sun, Moon, Shield, Save } from 'lucide-react';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSave = (e) => {
    e.preventDefault();
    // In a real application, update user profile here
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal preferences, display modes, and security configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Profile Details Card */}
        <div className="md:col-span-8">
          <Card title="Account Profile" subtitle="General corporate profile credentials">
            <form onSubmit={handleSave} className="space-y-4 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  value={user?.name || ''}
                  disabled
                  icon={User}
                />
                <Input
                  label="System Role"
                  name="role"
                  type="text"
                  value={user?.role || ''}
                  disabled
                  icon={Shield}
                />
              </div>

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={user?.email || ''}
                disabled
              />

              <div className="flex gap-2 items-center p-3.5 rounded-xl bg-slate-100/50 dark:bg-dark-900/10 border border-slate-200/50 dark:border-slate-850 text-slate-500 dark:text-slate-400 text-xs">
                <span>
                  Profile modifications are restricted by network administrative policies. Contact IT support to request edits.
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled icon={Save}>
                  Save Settings
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Preferences / Theme Card */}
        <div className="md:col-span-4">
          <Card title="Preferences" subtitle="Customize display options">
            <div className="space-y-5.5 mt-2">
              <div>
                <span className="text-xs font-bold text-slate-650 dark:text-slate-405 block mb-2.5">
                  Visual Interface Theme
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={theme === 'dark' ? toggleTheme : undefined}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-1.5 ${
                      theme === 'light'
                        ? 'border-primary-500 bg-primary-500/5 text-primary-650 dark:text-primary-400 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-dark-900/50 text-slate-500'
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    <span className="text-xs">Light Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={theme === 'light' ? toggleTheme : undefined}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-1.5 ${
                      theme === 'dark'
                        ? 'border-primary-500 bg-primary-500/5 text-primary-400 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-dark-900/50 text-slate-500'
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    <span className="text-xs">Dark Mode</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-150/40 dark:border-slate-800/40 pt-4 text-xs text-slate-500 dark:text-slate-400">
                <p>System configurations are applied in real-time. Preferences are saved automatically to your browser cache.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
