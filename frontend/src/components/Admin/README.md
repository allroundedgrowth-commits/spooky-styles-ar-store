# Admin Product Management UI

## Overview

The Admin Product Management UI provides a comprehensive interface for administrators to manage the product catalog, including creating, editing, and deleting products, as well as monitoring stock levels.

## Features

### 1. Admin Route Protection
- **Component**: `AdminRoute.tsx`
- Restricts access to admin-only pages
- Verifies user authentication and admin status
- Redirects non-admin users with appropriate messaging

### 2. Product List Management
- **Component**: `ProductList.tsx`
- Displays all products in a searchable, filterable table
- Search by product name or description
- Filter by category
- Visual indicators for stock status (out of stock, low stock, in stock)
- Quick access to edit and delete actions

### 3. Product Form
- **Component**: `ProductForm.tsx`
- Create new products or edit existing ones
- Fields: name, description, price, promotional price, category, theme, model URL, thumbnail URL, stock quantity
- Real-time promotional price preview
- Validation for price constraints
- Support for accessory flag

### 4. Delete Confirmation
- **Component**: `DeleteConfirmDialog.tsx`
- Confirmation dialog before deleting products
- Displays product details for verification
- Prevents accidental deletions

### 5. Low Stock Alerts
- **Component**: `LowStockAlerts.tsx`
- Configurable threshold for low stock alerts
- Separate sections for out-of-stock and low-stock products
- Quick access to restock products
- Real-time refresh capability

## Usage

### Accessing Admin Dashboard

1. Log in with an admin account
2. Navigate to `/admin` or click the "Admin" link in the header
3. The admin dashboard will display if you have admin privileges

### Creating a Product

1. Click "Add New Product" button
2. Fill in all required fields:
   - Product Name
   - Price
   - Category
   - Theme
   - 3D Model URL (upload to S3 first)
   - Thumbnail Image URL (upload to S3 first)
   - Stock Quantity
3. Optionally set promotional price and description
4. Check "This is an accessory" if applicable
5. Click "Create Product"

### Editing a Product

1. Find the product in the list
2. Click the edit icon (pencil)
3. Modify the desired fields
4. Click "Update Product"

### Deleting a Product

1. Find the product in the list
2. Click the delete icon (trash)
3. Confirm deletion in the dialog
4. Product will be permanently removed

### Monitoring Stock Levels

1. Switch to the "Stock Alerts" tab
2. Adjust the threshold slider to set low stock alert level
3. View out-of-stock products (red section)
4. View low-stock products (orange section)
5. Click "Restock" or "Update Stock" to edit product quantities

## API Integration

The admin UI uses the `admin.service.ts` which provides:
- `createProduct(input)` - Create new product
- `updateProduct(id, input)` - Update existing product
- `deleteProduct(id)` - Delete product
- `getLowStockProducts(threshold)` - Get products below threshold
- `getOutOfStockProducts()` - Get products with 0 stock
- `addProductColor(productId, colorName, colorHex)` - Add color option
- `deleteProductColor(colorId)` - Remove color option

## Requirements Fulfilled

This implementation satisfies the following requirements from the design document:

- **Requirement 7.1**: Admin can add new products with all required fields
- **Requirement 7.2**: Product updates reflect in catalog within 10 seconds (via cache invalidation)
- **Requirement 7.3**: Low stock alerts with configurable threshold
- **Requirement 7.5**: Promotional price display with visual distinction

## Security

- All admin routes are protected by `AdminRoute` component
- Backend validates admin status via `requireAdmin` middleware
- JWT tokens are required for all admin operations
- Non-admin users receive access denied messages
