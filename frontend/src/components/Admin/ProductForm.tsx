import React, { useState, useEffect } from 'react';
import { Product } from '../../types/product';
import { X, Image as ImageIcon } from 'lucide-react';
import uploadService from '../../services/upload.service';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  promotional_price?: number;
  category: string;
  theme: string;
  thumbnail_url: string;
  image_url: string;
  image_url_secondary?: string;
  image_url_tertiary?: string;
  image_alt_text?: string;
  image_alt_text_secondary?: string;
  image_alt_text_tertiary?: string;
  ar_image_url: string;
  stock_quantity: number;
  is_accessory: boolean;
}

const CATEGORIES = ['Wigs', 'Hats', 'Masks', 'Accessories', 'Makeup'];
const THEMES = ['witch', 'zombie', 'vampire', 'skeleton', 'ghost'];

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    promotional_price: undefined,
    category: 'Wigs',
    theme: 'witch',
    thumbnail_url: '',
    image_url: '',
    image_url_secondary: '',
    image_url_tertiary: '',
    image_alt_text: '',
    image_alt_text_secondary: '',
    image_alt_text_tertiary: '',
    ar_image_url: '',
    stock_quantity: 0,
    is_accessory: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingDetail, setUploadingDetail] = useState(false);
  const [uploadingDetail2, setUploadingDetail2] = useState(false);
  const [uploadingDetail3, setUploadingDetail3] = useState(false);
  const [uploadingAR, setUploadingAR] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        promotional_price: product.promotional_price,
        category: product.category,
        theme: product.theme,
        thumbnail_url: product.thumbnail_url,
        image_url: (product as any).image_url || product.thumbnail_url,
        image_url_secondary: product.image_url_secondary || '',
        image_url_tertiary: product.image_url_tertiary || '',
        image_alt_text: product.image_alt_text || '',
        image_alt_text_secondary: product.image_alt_text_secondary || '',
        image_alt_text_tertiary: product.image_alt_text_tertiary || '',
        ar_image_url: (product as any).ar_image_url || product.thumbnail_url,
        stock_quantity: product.stock_quantity,
        is_accessory: product.is_accessory,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (formData.promotional_price && formData.promotional_price >= formData.price) {
      setError('Promotional price must be less than regular price');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = uploadService.validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file');
      return;
    }

    setUploadingThumbnail(true);
    setError(null);

    try {
      const result = await uploadService.uploadImage(file);
      setFormData((prev) => ({ ...prev, thumbnail_url: result.webp.url }));
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to upload thumbnail');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleDetailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = uploadService.validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file');
      return;
    }

    setUploadingDetail(true);
    setError(null);

    try {
      const result = await uploadService.uploadImage(file);
      setFormData((prev) => ({ ...prev, image_url: result.webp.url }));
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to upload detail image');
    } finally {
      setUploadingDetail(false);
    }
  };

  const handleDetail2Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = uploadService.validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file');
      return;
    }

    setUploadingDetail2(true);
    setError(null);

    try {
      const result = await uploadService.uploadImage(file);
      setFormData((prev) => ({ ...prev, image_url_secondary: result.webp.url }));
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to upload second image');
    } finally {
      setUploadingDetail2(false);
    }
  };

  const handleDetail3Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = uploadService.validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file');
      return;
    }

    setUploadingDetail3(true);
    setError(null);

    try {
      const result = await uploadService.uploadImage(file);
      setFormData((prev) => ({ ...prev, image_url_tertiary: result.webp.url }));
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to upload third image');
    } finally {
      setUploadingDetail3(false);
    }
  };

  const handleARUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate PNG for AR
    if (file.type !== 'image/png') {
      setError('AR image must be PNG format with transparent background');
      return;
    }

    const validation = uploadService.validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file');
      return;
    }

    setUploadingAR(true);
    setError(null);

    try {
      const result = await uploadService.uploadImage(file);
      // Use original PNG, not WebP conversion
      setFormData((prev) => ({ ...prev, ar_image_url: result.original.url }));
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to upload AR image');
    } finally {
      setUploadingAR(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-halloween-dark border-2 border-halloween-orange rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-halloween-orange/30 flex-shrink-0">
          <h2 className="text-2xl font-bold text-halloween-orange">
            {product ? 'Edit Product' : 'Create New Product'}
          </h2>
          <button
            onClick={onCancel}
            className="text-halloween-gray hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-halloween-orange mb-2">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-halloween-black border border-halloween-orange/30 rounded-lg text-white focus:outline-none focus:border-halloween-orange"
            />
          </div>

          <div>
            <label className="block text-halloween-orange mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-halloween-black border border-halloween-orange/30 rounded-lg text-white focus:outline-none focus:border-halloween-orange"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-halloween-orange mb-2">Price ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-2 bg-halloween-black border border-halloween-orange/30 rounded-lg text-white focus:outline-none focus:border-halloween-orange"
              />
            </div>

            <div>
              <label className="block text-halloween-orange mb-2">
                Promotional Price ($)
                <span className="text-sm text-halloween-gray ml-2">(optional)</span>
              </label>
              <input
                type="number"
                name="promotional_price"
                value={formData.promotional_price || ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 bg-halloween-black border border-halloween-orange/30 rounded-lg text-white focus:outline-none focus:border-halloween-orange"
              />
            </div>
          </div>

          {formData.promotional_price && formData.promotional_price > 0 && (
            <div className="p-3 bg-halloween-purple/20 border border-halloween-purple rounded-lg">
              <div className="text-halloween-gray text-sm mb-1">Price Preview:</div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-halloween-green">
                  ${Number(formData.promotional_price).toFixed(2)}
                </span>
                <span className="text-lg text-halloween-gray line-through">
                  ${Number(formData.price).toFixed(2)}
                </span>
                <span className="text-sm text-halloween-orange">
                  Save ${(Number(formData.price) - Number(formData.promotional_price)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-halloween-orange mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-halloween-black border border-halloween-orange/30 rounded-lg text-white focus:outline-none focus:border-halloween-orange"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-halloween-orange mb-2">Theme *</label>
              <select
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-halloween-black border border-halloween-orange/30 rounded-lg text-white focus:outline-none focus:border-halloween-orange"
              >
                {THEMES.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-halloween-orange mb-2">Thumbnail Image (400x400px) *</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  name="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={handleChange}
                  required
                  placeholder="https://cdn.example.com/images/wig-thumb.webp"
                  className="flex-1 px-4 py-2 bg-halloween-black border border-halloween-orange/30 rounded-lg text-white focus:outline-none focus:border-halloween-orange"
                />
                <label className="relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleThumbnailUpload}
                    disabled={uploadingThumbnail}
                    className="hidden"
                  />
                  <div className="px-4 py-2 bg-halloween-purple hover:bg-halloween-purple/80 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                    {uploadingThumbnail ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={16} />
                        <span>Upload</span>
                      </>
                    )}
                  </div>
                </label>
              </div>
              {formData.thumbnail_url && (
                <div className="relative w-32 h-32 border border-halloween-orange/30 rounded-lg overflow-hidden">
                  <img
                    src={formData.thumbnail_url}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-sm text-halloween-gray">
                Square image for product grid. Upload (max 5MB) or paste URL.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-halloween-orange mb-2">Detail Image (800x800px) *</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  required
                  placeholder="https://cdn.example.com/images/wig-detail.webp"
                  className="flex-1 px-4 py-2 bg-halloween-black border border-halloween-orange/30 rounded-lg text-white focus:outline-none focus:border-halloween-orange"
                />
                <label className="relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleDetailUpload}
                    disabled={uploadingDetail}
                    className="hidden"
                  />
                  <div className="px-4 py-2 bg-halloween-purple hover:bg-halloween-purple/80 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                    {uploadingDetail ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={16} />
                        <span>Upload</span>
                      </>
                    )}
                  </div>
                </label>
              </div>
              {formData.image_url && (
                <div className="relative w-32 h-32 border border-halloween-orange/30 rounded-lg overflow-hidden">
                  <img
                    src={formData.image_url}
                    alt="Detail preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <input
                type="text"
                name="image_alt_text"
                value={formData.image_alt_text || ''}
                onChange={handleChange}
                placeholder="Alt text for accessibility"
                className="w-full px-4 py-2 bg-halloween-black border border-halloween-orange/30 rounded-lg text-white text-sm focus:outline-none focus:border-halloween-orange"
              />
              <p className="text-sm text-halloween-gray">
                Square image for product page (400x400px recommended). Upload (max 5MB) or paste URL.
              </p>
            </div>
          </div>

          {/* Second Detail Image */}
          <div>
            <label className="block text-halloween-orange mb-2">
              Second Detail Image (400x400px)
              <span className="text-sm text-halloween-gray ml-2">(optional)</span>
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  name="image_url_secondary"
                  value={formData.image_url_secondary || ''}
                  onChange={handleChange}
                  placeholder="https://cdn.example.com/images/wig-detail-2.webp"
                  className="flex-1 px-4 py-2 bg-halloween-black border border-halloween-orange/30 rounded-lg text-white focus:outline-none focus:border-halloween-orange"
                />
                <label className="relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleDetail2Upload}
                    disabled={uploadingDetail2}
                    className="hidden"
                  />
                  <div className="px-4 py-2 bg-halloween-purple hover:bg-halloween-purple/80 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                    {uploadingDetail2 ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={16} />
                        <span>Upload</span>
                      </>
                    )}
                  </div>
                </label>
              </div>
              {formData.image_url_secondary && (
                <div className="relative w-32 h-32 border border-halloween-orange/30 rounded-lg overflow-hidden">
                  <img
                    src={formData.image_url_secondary}
                    alt="Second image preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <input
                type="text"
                name="image_alt_text_secondary"
                value={formData.image_alt_text_secondary || ''}
                onChange={handleChange}
                placeholder="Alt text for accessibility"
                className="w-full px-4 py-2 bg-halloween-black border border-halloween-orange/30 rounded-lg text-white text-sm focus:outline-none focus:border-halloween-orange"
              />
              <p className="text-sm text-halloween-gray">
                Additional product angle (400x400px recommended).
              </p>
            </div>
          </div>

          {/* Third Detail Image */}
          <div>
            <label className="block text-halloween-orange mb-2">
              Third Detail Image (400x400px)
              <span className="text-sm text-halloween-gray ml-2">(optional)</span>
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  name="image_url_tertiary"
                  value={formData.image_url_tertiary || ''}
                  onChange={handleChange}
                  placeholder="https://cdn.example.com/images/wig-detail-3.webp"
                  className="flex-1 px-4 py-2 bg-halloween-black border border-halloween-orange/30 rounded-lg text-white focus:outline-none focus:border-halloween-orange"
                />
                <label className="relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleDetail3Upload}
                    disabled={uploadingDetail3}
                    className="hidden"
                  />
                  <div className="px-4 py-2 bg-halloween-purple hover:bg-halloween-purple/80 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                    {uploadingDetail3 ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={16} />
                        <span>Upload</span>
                      </>
                    )}
                  </div>
                </label>
              </div>
              {formData.image_url_tertiary && (
                <div className="relative w-32 h-32 border border-halloween-orange/30 rounded-lg overflow-hidden">
                  <img
                    src={formData.image_url_tertiary}
                    alt="Third image preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <input
                type="text"
                name="image_alt_text_tertiary"
                value={formData.image_alt_text_tertiary || ''}
                onChange={handleChange}
                placeholder="Alt text for accessibility"
                className="w-full px-4 py-2 bg-halloween-black border border-halloween-orange/30 rounded-lg text-white text-sm focus:outline-none focus:border-halloween-orange"
              />
              <p className="text-sm text-halloween-gray">
                Additional product angle (400x400px recommended).
              </p>
            </div>
          </div>

          <div>
            <label className="block text-halloween-orange mb-2">AR Overlay Image (1200x1200px PNG) *</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  name="ar_image_url"
                  value={formData.ar_image_url}
                  onChange={handleChange}
                  required
                  placeholder="https://cdn.example.com/images/wig-ar.png"
                  className="flex-1 px-4 py-2 bg-halloween-black border border-halloween-orange/30 rounded-lg text-white focus:outline-none focus:border-halloween-orange"
                />
                <label className="relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/png"
                    onChange={handleARUpload}
                    disabled={uploadingAR}
                    className="hidden"
                  />
                  <div className="px-4 py-2 bg-halloween-purple hover:bg-halloween-purple/80 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                    {uploadingAR ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={16} />
                        <span>Upload</span>
                      </>
                    )}
                  </div>
                </label>
              </div>
              {formData.ar_image_url && (
                <div className="relative w-32 h-32 border border-halloween-orange/30 rounded-lg overflow-hidden bg-gray-800">
                  <img
                    src={formData.ar_image_url}
                    alt="AR preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-sm text-halloween-gray">
                PNG with transparent background for AR try-on. Upload (max 5MB) or paste URL.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-halloween-orange mb-2">Stock Quantity *</label>
            <input
              type="number"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-4 py-2 bg-halloween-black border border-halloween-orange/30 rounded-lg text-white focus:outline-none focus:border-halloween-orange"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_accessory"
              id="is_accessory"
              checked={formData.is_accessory}
              onChange={handleChange}
              className="w-4 h-4 text-halloween-purple bg-halloween-black border-halloween-orange/30 rounded focus:ring-halloween-purple"
            />
            <label htmlFor="is_accessory" className="text-white">
              This is an accessory (can be layered with other products)
            </label>
          </div>

          </div>

          <div className="flex gap-4 p-6 border-t border-halloween-orange/30 flex-shrink-0 bg-halloween-dark">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-halloween-orange hover:bg-halloween-orange/80 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-halloween-gray hover:bg-halloween-gray/80 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
