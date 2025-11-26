import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Product } from '../../types/product';

interface DeleteConfirmDialogProps {
  product: Product;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  product,
  onConfirm,
  onCancel,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-halloween-dark border-2 border-red-500 rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-red-500/30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={24} />
            <h2 className="text-2xl font-bold text-red-500">Delete Product</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-halloween-gray hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-white">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>

          <div className="p-4 bg-halloween-black rounded-lg border border-halloween-orange/30">
            <div className="flex gap-4">
              <img
                src={product.thumbnail_url}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div>
                <h3 className="text-white font-semibold">{product.name}</h3>
                <p className="text-halloween-gray text-sm">{product.category}</p>
                <p className="text-halloween-orange font-semibold mt-1">
                  ${product.promotional_price || product.price}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete Product'}
            </button>
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="px-6 py-3 bg-halloween-gray hover:bg-halloween-gray/80 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;
