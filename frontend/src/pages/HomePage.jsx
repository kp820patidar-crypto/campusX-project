import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { ListingCard } from '../components/ListingCard';
import { CategoryBar } from '../components/CategoryBar';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  PlusCircle,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Query state derived from searchParams
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const condition = searchParams.get('condition') || '';
  const listingType = searchParams.get('listingType') || '';
  const college = searchParams.get('college') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Wishlist set for active student
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Show / hide advanced filter modal on mobile
  const [showFilters, setShowFilters] = useState(false);

  // Fetch listings
  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (condition) params.append('condition', condition);
      if (listingType) params.append('listingType', listingType);
      if (college) params.append('college', college);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sort) params.append('sort', sort);
      params.append('page', page);
      params.append('limit', 12);

      const { data } = await api.get(`/listings?${params.toString()}`);
      if (data?.success) {
        setListings(data.listings);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load campus listings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch student wishlist to show filled hearts
  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      if (data?.success && data?.wishlist) {
        const ids = new Set(data.wishlist.map((w) => w.listing?._id));
        setWishlistIds(ids);
      }
    } catch (err) {
      // not logged in, ignore
    }
  };

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const updateFilters = (updates) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === '' || val === null || val === 'All') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, val);
      }
    });
    // reset to page 1 on filter change unless page itself was updated
    if (!updates.page) {
      nextParams.delete('page');
    }
    setSearchParams(nextParams);
  };

  const resetAllFilters = () => {
    setSearchParams({});
  };

  const handleCategorySelect = (selectedCat) => {
    updateFilters({ category: selectedCat });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Banner Section */}
      <section className="bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/60 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-4 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Campus Marketplace exclusively for College Students</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Buy smarter. Sell faster. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-amber-200">
                Trade within your campus.
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Find textbooks, engineering calculators, cycles, lab gear, and hostel essentials from students across Indian universities. Meet on campus, inspect in person, pay securely.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Link
                to="/create-listing"
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Sell an Item on Campus</span>
              </Link>
              <a
                href="#listings-feed"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-slate-200 text-xs sm:text-sm font-semibold rounded-full border border-white/20 transition-all"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-3xl max-w-sm w-full space-y-3.5 text-xs text-slate-200">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              <span className="font-bold text-white text-sm">Supported Indian Campuses</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['IIT Bombay', 'Delhi University', 'BITS Pilani', 'NIT Trichy', 'VIT Vellore', 'IIT Delhi'].map((c) => (
                <button
                  key={c}
                  onClick={() => updateFilters({ college: c })}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-indigo-500/40 text-[11px] font-medium transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Currency in INR (₹) • Verified campus pickups
            </p>
          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <CategoryBar
        selectedCategory={category}
        onSelectCategory={handleCategorySelect}
      />

      {/* Main Content Area */}
      <main id="listings-feed" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filter & Sort Controls Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Active search keyword badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                {search ? `Search results for "${search}"` : 'Marketplace Listings'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                {totalCount} {totalCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Sort Dropdown & Mobile filter toggle */}
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="hidden sm:inline font-medium">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>

          </div>

          {/* Filter Row: Condition, Type, College, Min/Max Price */}
          <div className={`pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-2.5 ${showFilters ? 'block' : 'hidden sm:grid'}`}>
            
            {/* Condition */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => updateFilters({ condition: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
              >
                <option value="All">All Conditions</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            {/* Listing Type */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Type
              </label>
              <select
                value={listingType}
                onChange={(e) => updateFilters({ listingType: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
              >
                <option value="All">All Types</option>
                <option value="sale">For Sale (₹)</option>
                <option value="exchange">Exchange</option>
              </select>
            </div>

            {/* College */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                College
              </label>
              <select
                value={college}
                onChange={(e) => updateFilters({ college: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
              >
                <option value="All">All Campuses</option>
                <option value="IIT Bombay">IIT Bombay</option>
                <option value="Delhi University">Delhi University</option>
                <option value="BITS Pilani">BITS Pilani</option>
                <option value="NIT Trichy">NIT Trichy</option>
                <option value="VIT Vellore">VIT Vellore</option>
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Min Price (₹)
              </label>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => updateFilters({ minPrice: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
              />
            </div>

            {/* Max Price & Reset */}
            <div className="flex items-end gap-1.5">
              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="5000"
                  value={maxPrice}
                  onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
                />
              </div>

              {(category || condition || listingType || college || minPrice || maxPrice || search) && (
                <button
                  onClick={resetAllFilters}
                  title="Reset all filters"
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors flex-shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Listings Display Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-3 space-y-3 animate-pulse">
                <div className="aspect-[4/3] bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center max-w-md mx-auto space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800">{error}</p>
            <button
              onClick={fetchListings}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
            >
              Retry Loading
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Search className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No Listings Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                We couldn't find any items matching your selected campus filters or search keywords.
              </p>
            </div>
            <button
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All Filters</span>
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {listings.map((item) => (
                <ListingCard
                  key={item._id}
                  listing={item}
                  initialWishlisted={wishlistIds.has(item._id)}
                  onWishlistToggle={(id, isAdded) => {
                    const next = new Set(wishlistIds);
                    if (isAdded) next.add(id);
                    else next.delete(id);
                    setWishlistIds(next);
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => updateFilters({ page: page - 1 })}
                  className="p-2 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-600 px-3">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => updateFilters({ page: page + 1 })}
                  className="p-2 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

      </main>

    </div>
  );
};

