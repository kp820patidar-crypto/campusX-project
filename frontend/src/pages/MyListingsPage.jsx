import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  Package,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MyListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'available', 'sold'

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/listings/mine');
      if (data?.success) {
        setListings(data.listings);
      }
    } catch (err) {
      toast.error('Could not load your listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  // Quick toggle status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'available' ? 'sold' : 'available';
      const { data } = await api.patch(`/listings/${id}/status`, { status: nextStatus });
      setListings((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: data.status } : item))
      );
      toast.success(data.message || `Listing marked as ${data.status}`);
    } catch (err) {
      toast.error(err.message || 'Status update failed');
    }
  };

  // Delete listing
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing permanently?')) return;
    try {
      await api.delete(`/listings/${id}`);
      setListings((prev) => prev.filter((item) => item._id !== id));
      toast.success('Listing deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete listing');
    }
  };

  const filteredListings = listings.filter((l) => {
    if (activeTab === 'available') return l.status === 'available';
    if (activeTab === 'sold') return l.status === 'sold';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-600" />
              <span>My Campus Listings</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your active products, price updates, and completed sales
            </p>
          </div>

          <Link
            to="/create-listing"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Listing</span>
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'all', label: `All Items (${listings.length})` },
            { id: 'available', label: `Active (${listings.filter((l) => l.status === 'available').length})` },
            { id: 'sold', label: `Sold (${listings.filter((l) => l.status === 'sold').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Listing cards list */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500 font-semibold">Loading listings...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-800">No Listings in this Tab</h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === 'sold'
                  ? 'You have not marked any items as sold yet.'
                  : 'You have no listings here. Start by posting an item you want to sell or exchange!'}
              </p>
            </div>
            <Link
              to="/create-listing"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Listing</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-sm hover:shadow transition-shadow"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'}
                      alt={item.title}
                      className="w-20 h-20 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'sold'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {item.status === 'sold' ? 'SOLD' : 'AVAILABLE'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <Link
                        to={`/listing/${item._id}`}
                        className="text-sm font-bold text-slate-900 hover:text-indigo-600 truncate block"
                      >
                        {item.title}
                      </Link>

                      <p className="text-xs font-extrabold text-indigo-600 mt-0.5">
                        {item.listingType === 'exchange' ? 'Exchange' : `₹${item.price?.toLocaleString('en-IN')}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleStatus(item._id, item.status)}
                    className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    {item.status === 'sold' ? 'Mark Available' : 'Mark Sold'}
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/edit-listing/${item._id}`}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>

                    <Link
                      to={`/listing/${item._id}`}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="View Public"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

