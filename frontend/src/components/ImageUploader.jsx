import React, { useState } from 'react';
import { UploadCloud, X, Link as LinkIcon, Plus, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export const ImageUploader = ({
  selectedFiles,
  setSelectedFiles,
  directUrls,
  setDirectUrls,
  maxFiles = 5
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);

  const totalImages = selectedFiles.length + directUrls.length;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (totalImages + files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images in total.`);
      return;
    }

    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" is not an image file.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the 5MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    e.target.value = '';
  };

  const handleAddDirectUrl = () => {
    if (!urlInput.trim()) return;
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
      toast.error('Please enter a valid image URL (starting with http:// or https://)');
      return;
    }

    if (totalImages >= maxFiles) {
      toast.error(`Maximum limit of ${maxFiles} images reached.`);
      return;
    }

    setDirectUrls((prev) => [...prev, urlInput.trim()]);
    setUrlInput('');
    setShowUrlField(false);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeUrl = (index) => {
    setDirectUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">
          Product Images ({totalImages}/{maxFiles})
        </label>
        <button
          type="button"
          onClick={() => setShowUrlField(!showUrlField)}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>{showUrlField ? 'Hide URL Input' : 'Add Image URL'}</span>
        </button>
      </div>

      {showUrlField && (
        <div className="flex gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image link (e.g. Unsplash URL)..."
            className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="button"
            onClick={handleAddDirectUrl}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      )}

      {/* Grid of uploaded images and upload button */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Render Local Files */}
        {selectedFiles.map((file, idx) => (
          <div key={`file-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeFile(idx)}
              className="absolute top-1.5 right-1.5 p-1 bg-slate-900/70 hover:bg-red-600 text-white rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-slate-900/60 text-white text-[9px] rounded">
              Local File
            </span>
          </div>
        ))}

        {/* Render Direct URLs */}
        {directUrls.map((url, idx) => (
          <div key={`url-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
            <img
              src={url}
              alt="URL Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400';
              }}
            />
            <button
              type="button"
              onClick={() => removeUrl(idx)}
              className="absolute top-1.5 right-1.5 p-1 bg-slate-900/70 hover:bg-red-600 text-white rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-indigo-900/60 text-white text-[9px] rounded">
              Web Link
            </span>
          </div>
        ))}

        {/* Upload Button */}
        {totalImages < maxFiles && (
          <label className="aspect-square border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:bg-indigo-50/30 transition-all">
            <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 mb-1" />
            <span className="text-[11px] font-semibold text-slate-700">Upload Photo</span>
            <span className="text-[9px] text-slate-400">PNG, JPG up to 5MB</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}

      </div>
    </div>
  );
};

