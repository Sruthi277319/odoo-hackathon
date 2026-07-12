import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  title = 'No data available',
  description = 'There are no items to show in this view.',
  icon: Icon = Inbox,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-dark-900/5 ${className}`}>
      <div className="p-4 bg-slate-100 dark:bg-dark-900 rounded-full text-slate-400 dark:text-slate-500 mb-4.5">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-normal">
        {description}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
