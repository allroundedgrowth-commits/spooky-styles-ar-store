# Admin Dashboard Quick Start Guide

## Setup

### 1. Create Admin User

Run the admin creation script:

```bash
cd backend
npm run ts-node src/db/create-admin.ts
```

This creates an admin user with:
- **Email**: admin@spookystyles.com
- **Password**: Admin123!

### 2. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Login as Admin

1. Navigate to http://localhost:5173
2. Click "Account" in the header
3. Login with admin credentials
4. You should see an "⚙️ Admin" link appear in the header

## Using the Admin Dashboard

### Accessing the Dashboard

Click the "⚙️ Admin" link in the header or navigate to `/admin`

### Product Management Tab

**Create a Product:**
1. Click "Add New Product" button
2. Fill in required fields:
   - Product Name
   - Price (must be > 0)
   - Category (Wigs, Hats, Masks, Accessories, Makeup)
   - Theme (witch, zombie, vampire, skeleton, ghost)
   - 3D Model URL (S3/CloudFront URL)
   - Thumbnail Image URL (S3/CloudFront URL)
   - Stock Quantity
3. Optional: Set promotional price (must be < regular price)
4. Optional: Check "This is an accessory" if applicable
5. Click "Create Product"

**Edit a Product:**
1. Find the product in the list
2. Use search or category filter to narrow results
3. Click the pencil icon (Edit)
4. Modify fields as needed
5. Click "Update Product"

**Delete a Product:**
1. Find the product in the list
2. Click the trash icon (Delete)
3. Review product details in confirmation dialog
4. Click "Delete Product" to confirm

**Search & Filter:**
- Use the search box to find products by name or description
- Use the category dropdown to filter by category
- Results update in real-time

### Stock Alerts Tab

**Monitor Stock Levels:**
1. Switch to "Stock Alerts" tab
2. Adjust threshold slider (default: 10 items)
3. View two sections:
   - **Out of Stock** (red) - Products with 0 stock
   - **Low Stock** (orange) - Products at or below threshold

**Restock Products:**
1. Find the product in alerts
2. Click "Restock" or "Update Stock" button
3. Update the stock quantity in the form
4. Click "Update Product"

**Refresh Alerts:**
- Click the refresh icon to reload stock data
- Alerts update automatically when threshold changes

## Visual Indicators

### Stock Status in Product List
- 🟢 **Green number** - Good stock (> 10 items)
- 🟠 **Orange with warning** - Low stock (≤ 10 items)
- 🔴 **Red "Out of Stock"** - No stock available

### Price Display
- **Green price** - Promotional price (if set)
- **Gray strikethrough** - Original price (when promotional active)
- **Orange savings** - Amount saved with promotion

## Tips

1. **Upload Assets First**: Upload 3D models and images to S3 before creating products
2. **Use CloudFront URLs**: Paste CloudFront CDN URLs for better performance
3. **Set Promotional Prices**: Use promotional pricing to highlight sales
4. **Monitor Stock**: Check alerts regularly to avoid stockouts
5. **Test Products**: After creating, view them in the main product catalog

## Troubleshooting

**Can't see Admin link?**
- Ensure you're logged in with admin account
- Check that is_admin flag is true in database

**Access Denied message?**
- Your account doesn't have admin privileges
- Run create-admin script to create/update admin user

**Product not appearing?**
- Check that all required fields are filled
- Verify URLs are valid and accessible
- Check browser console for errors

**Stock alerts not showing?**
- Adjust threshold slider
- Click refresh icon to reload data
- Ensure products have stock_quantity set

## Security Notes

- Only users with `is_admin = true` can access admin routes
- All admin operations require valid JWT token
- Backend validates admin status on every request
- Non-admin users see "Access Denied" message

## Next Steps

After setting up products:
1. Test AR try-on with your products
2. Create costume inspirations
3. Test the complete purchase flow
4. Monitor stock levels and sales

For detailed documentation, see:
- `frontend/src/components/Admin/README.md`
- `frontend/src/ADMIN_IMPLEMENTATION_SUMMARY.md`
