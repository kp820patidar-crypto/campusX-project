import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
        <GraduationCap className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <p className="text-base font-semibold text-slate-700 mt-2">Campus Page Not Found</p>
      <p className="text-xs text-slate-400 mt-1 max-w-sm">
        The item or page you're searching for does not exist or may have been removed from CampusX.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Marketplace</span>
      </Link>
    </div>
  );
};

