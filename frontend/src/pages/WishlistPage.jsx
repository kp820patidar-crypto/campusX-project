import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Heart, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/wishlist');
      if (data?.success) {
        setWishlist(data.wishlist || []);
      }
    } catch (err) {
      toast.error('Could not load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (listingId) => {
    try {
      await api.delete(`/wishlist/${listingId}`);
      setWishlist((prev) => prev.filter((item) => item.listing?._id !== listingId));
      toast.success('Item removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <span>Saved Items & Wishlist</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Keep track of campus items you're interested in purchasing
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500 font-semibold">Loading wishlist...</p>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Your Wishlist is Empty</h3>
              <p className="text-xs text-slate-500 mt-1">
                Explore second-hand books, electronics, calculators, and hostel essentials, and tap the heart icon to save them for later!
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition-all"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {wishlist.map(({ listing }) => (
              <div
                key={listing._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between group"
              >
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <Link to={`/listing/${listing._id}`}>
                    <img
                      src={listing.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </Link>

                  <button
                    onClick={() => handleRemove(listing._id)}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 text-red-500 hover:bg-white shadow transition-all"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <span className="absolute bottom-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-md text-slate-700">
                    {listing.condition}
                  </span>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-base font-extrabold text-slate-900">
                      {listing.listingType === 'exchange' ? 'Exchange' : `₹${listing.price?.toLocaleString('en-IN')}`}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                      {listing.category?.split('&')[0]}
                    </span>
                  </div>

                  <Link
                    to={`/listing/${listing._id}`}
                    className="text-xs font-semibold text-slate-800 hover:text-indigo-600 line-clamp-2 mb-2"
                  >
                    {listing.title}
                  </Link>

                  <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate">{listing.college}</span>
                    <Link
                      to={`/listing/${listing._id}`}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      View
                    </Link>
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

