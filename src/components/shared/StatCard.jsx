import React from 'react';

export default function StatCard({ title, value, icon, sub, bg = "bg-white dark:bg-[#2c2e36]", text = "text-gray-900 dark:text-white" }) {
  return (
    <div className={`${bg} p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between h-28`}>
      <div className="flex justify-between items-start">
        <div>
          <div className={`text-sm font-medium ${text === 'text-white' ? 'text-blue-100' : 'text-gray-500'}`}>{title}</div>
          <div className={`text-2xl font-extrabold ${text}`}>{value}</div>
        </div>
        <div className="opacity-80">{icon}</div>
      </div>
      {sub && <div className="text-xs mt-auto opacity-75">{sub}</div>}
    </div>
  );
}
