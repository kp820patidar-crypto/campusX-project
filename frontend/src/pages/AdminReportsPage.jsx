import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports/admin');
      if (data?.success) {
        setReports(data.reports || []);
      }
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleModerate = async (reportId, action) => {
    try {
      let body = {};
      if (action === 'takedown') {
        if (!window.confirm('Delete this listing permanently from the campus marketplace?')) return;
        body = { status: 'action_taken', takeDownListing: true };
      } else if (action === 'dismiss') {
        body = { status: 'dismissed' };
      } else {
        body = { status: 'reviewed' };
      }

      const { data } = await api.patch(`/reports/admin/${reportId}`, body);
      toast.success(data.message || 'Report updated');
      fetchReports();
    } catch (err) {
      toast.error(err.message || 'Moderation action failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
            <span>Campus Moderation & Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Admin console: Review student reports regarding inappropriate items, prohibited goods, or scams
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500">Loading moderation reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Campus is Safe & Clean</h3>
            <p className="text-xs text-slate-500">There are currently no active or pending reports from students.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((rep) => {
              const statusColors = {
                pending: 'bg-amber-50 text-amber-700 border-amber-200',
                reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
                action_taken: 'bg-red-50 text-red-700 border-red-200',
                dismissed: 'bg-slate-100 text-slate-600 border-slate-200',
              }[rep.status] || 'bg-slate-100 text-slate-600';

              return (
                <div
                  key={rep._id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusColors}`}>
                        {rep.status.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md">
                        {rep.reason}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Reported {new Date(rep.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    {/* Reporter Details */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <p className="font-bold text-slate-700">Reporter Student:</p>
                      <p className="text-slate-900 font-semibold">{rep.reporterId?.name || 'Student'}</p>
                      <p className="text-slate-500">{rep.reporterId?.email}</p>
                      <p className="text-indigo-600">{rep.reporterId?.college}</p>
                    </div>

                    {/* Reported Listing */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <p className="font-bold text-slate-700">Reported Listing:</p>
                      {rep.listingId ? (
                        <>
                          <Link
                            to={`/listing/${rep.listingId._id}`}
                            className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            <span>{rep.listingId.title}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <p className="text-slate-600">Price: ₹{rep.listingId.price}</p>
                          <p className="text-slate-500">Seller: {rep.listingId.sellerId?.name || 'Seller'}</p>
                        </>
                      ) : (
                        <p className="text-rose-500 font-medium">Listing has already been deleted.</p>
                      )}
                    </div>

                  </div>

                  {/* Reporter note */}
                  {rep.description && (
                    <div className="text-xs text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                      <span className="font-bold text-amber-900">Student Note: </span>
                      {rep.description}
                    </div>
                  )}

                  {/* Actions */}
                  {rep.status === 'pending' && rep.listingId && (
                    <div className="pt-2 flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => handleModerate(rep._id, 'dismiss')}
                        className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Dismiss Report
                      </button>

                      <button
                        onClick={() => handleModerate(rep._id, 'takedown')}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Take Down Listing</span>
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

