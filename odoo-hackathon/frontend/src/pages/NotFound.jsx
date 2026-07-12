import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 overflow-hidden px-4">
      {/* Background Orbs */}
      <div className="bg-glow-orb w-[300px] h-[300px] bg-primary-500 top-[20%] left-[20%]" />
      
      <div className="w-full max-w-md text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="glass-panel p-8 rounded-3xl flex flex-col items-center gap-5 shadow-2xl border border-white/30 dark:border-slate-800/35"
        >
          <div className="p-4 bg-primary-500/10 text-primary-500 rounded-2xl">
            <AlertCircle className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              404
            </h1>
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-250">
              Page Not Found
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              The page you are looking for doesn't exist or has been relocated to another module folder.
            </p>
          </div>

          <Link to="/" className="w-full">
            <Button variant="primary" className="w-full py-2.5" icon={ArrowLeft}>
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
