import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Repeat, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const ListingCard = ({ listing, initialWishlisted = false, onWishlistToggle }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fallbackImage = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80';
  const displayImage = imageError || !listing?.images?.[0] ? fallbackImage : listing.images[0];

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast('Please log in to save items to your wishlist.', { icon: '🔒' });
      navigate('/login');
      return;
    }

    if (isTogglingWishlist) return;
    setIsTogglingWishlist(true);

    const prev = isWishlisted;
    setIsWishlisted(!prev);

    try {
      if (prev) {
        await api.delete(`/wishlist/${listing._id}`);
        toast.success('Removed from wishlist');
      } else {
        await api.post(`/wishlist/${listing._id}`);
        toast.success('Saved to wishlist!');
      }
      if (onWishlistToggle) {
        onWishlistToggle(listing._id, !prev);
      }
    } catch (err) {
      setIsWishlisted(prev);
      toast.error('Could not update wishlist');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  // Format relative date
  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      return hours <= 1 ? 'Just now' : `${hours}h ago`;
    }
    return days === 1 ? 'Yesterday' : `${days}d ago`;
  };

  // Condition styling
  const conditionBadgeColor = {
    'Like New': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Good': 'bg-blue-50 text-blue-700 border-blue-200',
    'Fair': 'bg-amber-50 text-amber-700 border-amber-200',
  }[listing?.condition] || 'bg-slate-50 text-slate-700 border-slate-200';

  const isSold = listing?.status === 'sold';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative">
      
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <Link to={`/listing/${listing._id}`}>
          <img
            src={displayImage}
            alt={listing.title}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              isSold ? 'opacity-40 grayscale' : ''
            }`}
          />
        </Link>

        {/* Sold Overlay Banner */}
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
            <span className="px-4 py-1.5 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-lg shadow-lg">
              SOLD OUT
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label="Save to wishlist"
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 backdrop-blur-sm text-slate-600 hover:text-red-500 hover:bg-white shadow-sm transition-all"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-red-500 text-red-500' : ''
            }`}
          />
        </button>

        {/* Listing Type Tag */}
        {listing.listingType === 'exchange' ? (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-600/95 backdrop-blur-sm text-white text-[10px] font-bold shadow-sm">
            <Repeat className="w-3 h-3" />
            <span>Exchange</span>
          </div>
        ) : (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold shadow-sm">
            For Sale
          </div>
        )}

        {/* Condition Tag */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${conditionBadgeColor}`}>
            {listing.condition}
          </span>
        </div>
      </div>

      {/* Details Body */}
      <div className="p-4 flex flex-col flex-1">
        
        {/* Price & Category */}
        <div className="flex items-baseline justify-between mb-1">
          {listing.listingType === 'exchange' ? (
            <span className="text-base font-extrabold text-purple-700">
              Open to Exchange
            </span>
          ) : (
            <div className="flex items-baseline">
              <span className="text-xl font-extrabold text-slate-900">
                ₹{listing.price?.toLocaleString('en-IN')}
              </span>
            </div>
          )}
          <span className="text-[11px] font-medium text-slate-400 truncate max-w-[120px]">
            {listing.category?.split('&')[0]}
          </span>
        </div>

        {/* Title */}
        <Link to={`/listing/${listing._id}`} className="block mb-2 group/title">
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug group-hover/title:text-indigo-600 transition-colors">
            {listing.title}
          </h3>
        </Link>

        {/* Preferred Exchange Note if Exchange */}
        {listing.listingType === 'exchange' && listing.preferredExchange && (
          <p className="text-[11px] text-purple-600 bg-purple-50 p-1.5 rounded-lg mb-2 line-clamp-1">
            Exchange: {listing.preferredExchange}
          </p>
        )}

        {/* Location & Time Footer */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1 truncate max-w-[150px]" title={listing.pickupLocation}>
            <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span className="truncate">{listing.college || 'Campus'}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 flex-shrink-0">
            <Clock className="w-3 h-3" />
            <span>{getRelativeTime(listing.createdAt)}</span>
          </div>
        </div>

      </div>

    </div>
  );
};

