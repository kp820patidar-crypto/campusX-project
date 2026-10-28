import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ReportModal } from '../components/ReportModal';
import { ListingCard } from '../components/ListingCard';
import {
  Heart,
  MessageSquare,
  MapPin,
  Calendar,
  Eye,
  ShieldAlert,
  Edit3,
  Trash2,
  CheckCircle,
  Share2,
  Repeat,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ListingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [listing, setListing] = useState(null);
  const [relatedListings, setRelatedListings] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [initialContactMessage, setInitialContactMessage] = useState('');
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Fetch listing details
  const fetchListingDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/listings/${id}`);
      if (data?.success) {
        setListing(data.listing);
        setIsWishlisted(data.isWishlisted);
        setRelatedListings(data.relatedListings || []);
        setActiveImageIndex(0);
      }
    } catch (err) {
      setError(err.message || 'Could not load listing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListingDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const isOwner = user && listing && (listing.sellerId?._id === user.id || listing.sellerId === user.id);

  // Toggle wishlist
  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast('Please log in to save items to your wishlist.', { icon: '🔒' });
      navigate('/login');
      return;
    }

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
    } catch (err) {
      setIsWishlisted(prev);
      toast.error('Could not update wishlist');
    }
  };

  // Toggle sold status
  const handleToggleStatus = async () => {
    if (!isOwner && !isAdmin) return;
    setIsTogglingStatus(true);
    try {
      const newStatus = listing.status === 'available' ? 'sold' : 'available';
      const { data } = await api.patch(`/listings/${listing._id}/status`, { status: newStatus });
      setListing((prev) => ({ ...prev, status: data.status }));
      toast.success(data.message || `Listing marked as ${data.status}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Delete listing
  const handleDeleteListing = async () => {
    if (!window.confirm('Are you sure you want to delete this listing permanently?')) return;
    setIsDeleting(true);
    try {
      await api.delete(`/listings/${listing._id}`);
      toast.success('Listing deleted successfully');
      navigate('/my-listings');
    } catch (err) {
      toast.error(err.message || 'Failed to delete listing');
      setIsDeleting(false);
    }
  };

  // Contact seller
  const handleStartConversation = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast('Please log in to message this seller.', { icon: '🔒' });
      navigate('/login');
      return;
    }

    setIsStartingChat(true);
    try {
      const defaultMsg = initialContactMessage.trim() || `Hi ${listing.sellerId?.name?.split(' ')[0] || 'there'}, is this ${listing.title} still available for campus pickup?`;
      const { data } = await api.post('/conversations', {
        listingId: listing._id,
        message: defaultMsg,
      });

      if (data?.success && data?.conversation) {
        navigate(`/messages?conversationId=${data.conversation._id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to contact seller');
    } finally {
      setIsStartingChat(false);
    }
  };

  // Share listing
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Listing link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading campus listing...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Item Unavailable</h2>
        <p className="text-xs text-slate-500">{error || 'This listing may have been deleted or taken down.'}</p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl"
        >
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const images = listing.images?.length > 0 ? listing.images : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'];
  const activeImage = images[activeImageIndex] || images[0];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/" className="hover:text-indigo-600">Marketplace</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to={`/?category=${encodeURIComponent(listing.category)}`} className="hover:text-indigo-600">
            {listing.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold truncate max-w-xs">{listing.title}</span>
        </nav>

        {/* Owner Banner Notice */}
        {isOwner && (
          <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              <span>You are viewing your own listing. You can edit, mark as sold, or delete it anytime.</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/edit-listing/${listing._id}`}
                className="px-3 py-1 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
              >
                Edit Details
              </Link>
            </div>
          </div>
        )}

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Image Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Main Stage Image */}
            <div className="relative aspect-[4/3] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <img
                src={activeImage}
                alt={listing.title}
                className={`w-full h-full object-contain bg-slate-900/5 ${
                  listing.status === 'sold' ? 'opacity-40 grayscale' : ''
                }`}
              />

              {listing.status === 'sold' && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
                  <span className="px-6 py-2 bg-red-600 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg">
                    Item Marked as Sold
                  </span>
                </div>
              )}

              {/* Wishlist Button on image */}
              <button
                onClick={handleToggleWishlist}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-sm text-slate-600 hover:text-red-500 hover:bg-white shadow transition-all"
                title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="absolute top-4 left-4 p-2.5 rounded-full bg-white/90 backdrop-blur-sm text-slate-600 hover:text-indigo-600 hover:bg-white shadow transition-all"
                title="Share link"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImageIndex === idx
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description & Specs Section */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Product Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>

              {listing.listingType === 'exchange' && listing.preferredExchange && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                  <p className="text-xs font-bold text-purple-900 flex items-center gap-1.5 mb-1">
                    <Repeat className="w-4 h-4 text-purple-600" />
                    <span>Preferred Items for Exchange:</span>
                  </p>
                  <p className="text-xs text-purple-700">{listing.preferredExchange}</p>
                </div>
              )}

              {/* Campus Pickup Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span>Designated Campus Pickup Location</span>
                </div>
                <p className="text-xs text-slate-700 pl-6 font-medium">
                  {listing.pickupLocation} ({listing.college})
                </p>
                <p className="text-[11px] text-slate-400 pl-6">
                  Student privacy protected: trades take place in visible campus zones.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Pricing, Seller & CTAs (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Price & Summary Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {listing.category}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  Condition: {listing.condition}
                </span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {listing.title}
                </h1>
                
                <div className="mt-3 flex items-baseline gap-2">
                  {listing.listingType === 'exchange' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-purple-700">Open to Exchange</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-3xl font-extrabold text-slate-900">
                        ₹{listing.price?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">Fixed / Student Price</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Posted {new Date(listing.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{listing.views || 1} views</span>
                </div>
              </div>

              {/* Actions based on Buyer vs Seller */}
              {isOwner ? (
                <div className="pt-2 space-y-2.5">
                  <button
                    onClick={handleToggleStatus}
                    disabled={isTogglingStatus}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      listing.status === 'sold'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {listing.status === 'sold' ? 'Mark as Available Again' : 'Mark Listing as Sold'}
                    </span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/edit-listing/${listing._id}`}
                      className="py-2.5 px-4 text-center border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Listing</span>
                    </Link>

                    <button
                      onClick={handleDeleteListing}
                      disabled={isDeleting}
                      className="py-2.5 px-4 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 space-y-3">
                  {listing.status === 'sold' ? (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold text-center">
                      This item has already been marked as sold.
                    </div>
                  ) : (
                    <form onSubmit={handleStartConversation} className="space-y-2.5">
                      <textarea
                        rows={2}
                        value={initialContactMessage}
                        onChange={(e) => setInitialContactMessage(e.target.value)}
                        placeholder={`Message ${listing.sellerId?.name?.split(' ')[0] || 'seller'} (e.g. Can we meet near library tomorrow?)...`}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                      />

                      <button
                        type="submit"
                        disabled={isStartingChat}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isStartingChat ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4" />
                            <span>Contact Seller & Chat</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleToggleWishlist}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                      <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Report Item</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Seller Information Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Seller Profile
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-base flex items-center justify-center overflow-hidden flex-shrink-0">
                  {listing.sellerId?.profileImage ? (
                    <img src={listing.sellerId.profileImage} alt="Seller" className="w-full h-full object-cover" />
                  ) : (
                    listing.sellerId?.name?.charAt(0).toUpperCase() || 'S'
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{listing.sellerId?.name}</p>
                  <p className="text-xs text-indigo-600 font-medium">{listing.sellerId?.college || listing.college}</p>
                  <p className="text-[11px] text-slate-400">
                    {listing.sellerId?.year} • {listing.sellerId?.department}
                  </p>
                </div>
              </div>
            </div>

            {/* Campus Safety Notice */}
            <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-3xl text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Campus Transaction Checklist</span>
              </div>
              <ul className="text-[11px] text-amber-800 space-y-1 list-disc list-inside">
                <li>Meet in public campus areas (Hostel Gate, Library, Canteen).</li>
                <li>Inspect and turn on electronics before paying.</li>
                <li>Pay via UPI or cash directly at handover.</li>
              </ul>
            </div>

          </div>

        </div>

        {/* Related Campus Listings */}
        {relatedListings.length > 0 && (
          <section className="pt-8 border-t border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              More Items in {listing.category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {relatedListings.map((rel) => (
                <ListingCard key={rel._id} listing={rel} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        listingId={listing._id}
        listingTitle={listing.title}
      />
    </div>
  );
};

