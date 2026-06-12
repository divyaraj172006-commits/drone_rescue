import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?', 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  onConfirm, 
  onCancel,
  isDanger = false 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop blur overlay */}
      <div 
        className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Modal Container */}
      <div className={`relative w-full max-w-md glass-panel p-6 overflow-hidden transform transition-all duration-300 scale-100 ${
        isDanger ? 'border-brand-danger/30 shadow-glow-red' : 'border-brand-glow/30 shadow-glow'
      }`}>
        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${
            isDanger ? 'bg-brand-danger/10 text-brand-danger border border-brand-danger/20' : 'bg-brand-glow/10 text-brand-glow border border-brand-glow/20'
          }`}>
            <AlertTriangle size={20} className={isDanger ? 'animate-pulse' : ''} />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            {title}
          </h3>
        </div>

        {/* Modal Message */}
        <div className="mb-6">
          <p className="text-xs text-slate-400 leading-relaxed font-semibold">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-brand-border/40">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-brand-dark border border-brand-border hover:border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-bold rounded-lg transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-extrabold rounded-lg shadow-glow transition-all ${
              isDanger 
                ? 'bg-brand-danger hover:bg-brand-danger/90 text-white shadow-glow-red' 
                : 'bg-brand-glow hover:bg-brand-glow/90 text-brand-dark'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
