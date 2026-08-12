import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, X } from 'lucide-react';

export default function ToastContainer({ toasts = [], onCloseToast }) {
  return (
    <div className="fixed bottom-16 right-6 z-50 flex flex-col gap-2 font-mono text-xs max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3 rounded-xl border backdrop-blur-md shadow-2xl flex items-start justify-between gap-3 animate-slide-in ${
            toast.type === 'critical'
              ? 'bg-red-950/90 border-red-500/50 text-red-100 shadow-red-500/20'
              : 'bg-slate-900/90 border-blue-500/50 text-blue-100'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">{toast.title}</div>
              <div className="text-[11px] text-gray-300">{toast.message}</div>
            </div>
          </div>
          <button
            onClick={() => onCloseToast(toast.id)}
            className="text-gray-400 hover:text-white shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
