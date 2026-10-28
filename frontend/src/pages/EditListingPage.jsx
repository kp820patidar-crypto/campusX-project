import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { ImageUploader } from '../components/ImageUploader';
import { Save, Loader2, ArrowLeft, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Books & Study Materials',
  'Electronics',
  'Calculators & Lab Equipment',
  'Cycles & Transport',
  'Hostel Essentials',
  'Furniture',
  'Clothing & Accessories',
  'Sports & Fitness',
  'Other',
];

const CONDITIONS = ['Like New', 'Good', 'Fair'];

export const EditListingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    listingType: 'sale',
    preferredExchange: '',
    category: CATEGORIES[0],
    condition: CONDITIONS[0],
    college: '',
    pickupLocation: '',
    status: 'available',
  });

  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [directUrls, setDirectUrls] = useState([]);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await api.get(`/listings/${id}`);
        if (data?.success && data?.listing) {
          const l = data.listing;
          // Verify owner
          if (l.sellerId?._id !== user?.id && l.sellerId !== user?.id && !isAdmin) {
            toast.error('You can only edit your own listings.');
            navigate('/');
            return;
          }

          setFormData({
            title: l.title || '',
            description: l.description || '',
            price: l.price !== undefined ? l.price : '',
            listingType: l.listingType || 'sale',
            preferredExchange: l.preferredExchange || '',
            category: l.category || CATEGORIES[0],
            condition: l.condition || CONDITIONS[0],
            college: l.college || '',
            pickupLocation: l.pickupLocation || '',
            status: l.status || 'available',
          });
          setExistingImages(l.images || []);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load listing');
        navigate('/my-listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const removeExistingImage = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('price', formData.listingType === 'exchange' ? '0' : formData.price);
      submitData.append('listingType', formData.listingType);
      submitData.append('preferredExchange', formData.preferredExchange.trim());
      submitData.append('category', formData.category);
      submitData.append('condition', formData.condition);
      submitData.append('college', formData.college.trim());
      submitData.append('pickupLocation', formData.pickupLocation.trim());
      submitData.append('status', formData.status);

      // Remaining existing images
      const allWebUrls = [...existingImages, ...directUrls];
      submitData.append('existingImages', JSON.stringify(allWebUrls));

      // New binary files
      selectedFiles.forEach((file) => {
        submitData.append('images', file);
      });

      const { data } = await api.patch(`/listings/${id}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Listing updated successfully!');
      navigate(`/listing/${id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-semibold">Loading listing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Edit Listing
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Update product information, price, or item status
              </p>
            </div>

            {/* Status toggle pill */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Status:</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                  formData.status === 'sold'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Item Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Condition *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
                >
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Listing Type
                </label>
                <select
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
                >
                  <option value="sale">For Sale (₹)</option>
                  <option value="exchange">Exchange</option>
                </select>
              </div>

              {formData.listingType === 'sale' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Price in INR (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    min="1"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Preferred Exchange Item
                  </label>
                  <input
                    type="text"
                    name="preferredExchange"
                    value={formData.preferredExchange}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  College
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pickup Location
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description *
              </label>
              <textarea
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl resize-none"
              />
            </div>

            {/* Existing Images Management */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Current Photos ({existingImages.length})
                </label>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {existingImages.map((url, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 group">
                      <img src={url} alt="Current" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100"
                        title="Delete photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Additional Images */}
            <div className="pt-2">
              <ImageUploader
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                directUrls={directUrls}
                setDirectUrls={setDirectUrls}
                maxFiles={5 - existingImages.length}
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

