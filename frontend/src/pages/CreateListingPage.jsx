import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { ImageUploader } from '../components/ImageUploader';
import { PlusCircle, Loader2, ArrowLeft, Info, HelpCircle } from 'lucide-react';
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

export const CreateListingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    listingType: 'sale',
    preferredExchange: '',
    category: CATEGORIES[0],
    condition: CONDITIONS[0],
    college: user?.college || '',
    pickupLocation: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [directUrls, setDirectUrls] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.pickupLocation.trim()) {
      toast.error('Please fill in title, description, and pickup location.');
      return;
    }

    if (formData.listingType === 'sale' && (!formData.price || Number(formData.price) <= 0)) {
      toast.error('Sale listings require a price greater than ₹0.');
      return;
    }

    setSubmitting(true);

    try {
      // Use FormData to send multipart binary files + fields
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('price', formData.listingType === 'exchange' ? '0' : formData.price);
      submitData.append('listingType', formData.listingType);
      submitData.append('preferredExchange', formData.preferredExchange.trim());
      submitData.append('category', formData.category);
      submitData.append('condition', formData.condition);
      submitData.append('college', formData.college.trim() || user?.college || 'Campus');
      submitData.append('pickupLocation', formData.pickupLocation.trim());

      // Append local image files
      selectedFiles.forEach((file) => {
        submitData.append('images', file);
      });

      // Append direct image URLs as JSON
      if (directUrls.length > 0) {
        submitData.append('directImageUrls', JSON.stringify(directUrls));
      }

      const { data } = await api.post('/listings', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Listing created successfully!');
      navigate(`/listing/${data.listing._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

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
          
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create New Campus Listing
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              List textbooks, gadgets, cycle, or hostel essentials for fellow students
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Item Title *
              </label>
              <input
                type="text"
                name="title"
                required
                maxLength={100}
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Casio fx-991EX ClassWiz Scientific Calculator"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* Category and Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Listing Type & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Listing Type *
                </label>
                <select
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="sale">For Sale (Fixed Price in ₹)</option>
                  <option value="exchange">Exchange with another item</option>
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
                    placeholder="e.g. 350"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Looking to exchange for:
                  </label>
                  <input
                    type="text"
                    name="preferredExchange"
                    value={formData.preferredExchange}
                    onChange={handleChange}
                    placeholder="e.g. Mini-drafter or CS textbooks"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              )}
            </div>

            {/* Campus & Pickup Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  College / Campus *
                </label>
                <input
                  type="text"
                  name="college"
                  required
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="e.g. IIT Bombay"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Campus Pickup Spot *
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  required
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  placeholder="e.g. Hostel 12 Foyer or Library Quad"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Detailed Description *
              </label>
              <textarea
                name="description"
                rows={4}
                required
                minLength={10}
                value={formData.description}
                onChange={handleChange}
                placeholder="Include details about item age, wear and tear, included accessories, or semester relevance..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
            </div>

            {/* Image Uploader */}
            <div className="pt-2">
              <ImageUploader
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                directUrls={directUrls}
                setDirectUrls={setDirectUrls}
                maxFiles={5}
              />
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Listing...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Publish Listing</span>
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

