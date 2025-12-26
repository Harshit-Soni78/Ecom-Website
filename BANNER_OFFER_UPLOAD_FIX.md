# Banner & Offer Upload Fix

## Issue Identified
The banner and offer pages were unable to upload images because the backend was missing:
1. Upload endpoints (`/upload/image`, `/upload/multiple`, `/upload/delete`)
2. Banner CRUD endpoints (`/admin/banners/*`)
3. Offer CRUD endpoints (`/admin/offers/*`)

## Solution Implemented

### 1. Added Upload Endpoints
```python
# Single image upload
POST /api/upload/image
- Accepts: file, folder, image_type
- Returns: { url, filename }
- Requires: admin authentication

# Multiple image upload  
POST /api/upload/multiple
- Accepts: files[], folder, image_type
- Returns: { files: [{ url, filename }] }
- Requires: admin authentication

# Delete uploaded file
DELETE /api/upload/delete?file_url=<url>
- Removes file from server
- Requires: admin authentication
```

### 2. Added Banner Endpoints
```python
# Public banner list
GET /api/banners
- Returns active banners for homepage

# Admin banner management
GET /api/admin/banners
POST /api/admin/banners
PUT /api/admin/banners/{id}
DELETE /api/admin/banners/{id}
- Full CRUD operations
- Requires: admin authentication
```

### 3. Added Offer Endpoints
```python
# Public offer list
GET /api/offers
- Returns active offers

# Admin offer management
GET /api/admin/offers
POST /api/admin/offers
PUT /api/admin/offers/{id}
DELETE /api/admin/offers/{id}
- Full CRUD operations
- Requires: admin authentication
```

## Features Included

### Upload Functionality
- **File Validation**: Only image files accepted
- **Image Optimization**: Automatic resizing and compression
- **Folder Organization**: Images saved to appropriate folders (banners, offers, etc.)
- **Security**: Admin authentication required
- **Error Handling**: Comprehensive error messages

### Banner Management
- **Image Upload**: Direct integration with upload system
- **Position Control**: Order banners by position
- **Active/Inactive**: Toggle banner visibility
- **Link Support**: Optional links for banner clicks
- **Image Optimization**: Banners automatically resized to 1200x400px

### Offer Management
- **Discount Types**: Percentage or flat amount discounts
- **Coupon Codes**: Optional coupon code generation
- **Order Minimums**: Set minimum order values
- **Maximum Discounts**: Cap discount amounts
- **Product/Category Targeting**: Apply to specific items

## Testing Results

### Backend Endpoints
✅ **Upload Endpoints**: All responding with proper authentication
✅ **Banner Endpoints**: CRUD operations working
✅ **Offer Endpoints**: CRUD operations working
✅ **Public Endpoints**: Banner/offer lists accessible
✅ **Authentication**: Admin protection working

### Frontend Integration
✅ **Image Upload Component**: SingleImageUpload working
✅ **API Integration**: bannersAPI and offersAPI configured
✅ **Form Handling**: Banner and offer forms functional
✅ **File Management**: Upload, display, and delete working

## Usage Instructions

### For Banners:
1. Go to Admin → Banners
2. Click "Add Banner"
3. Fill in title and upload image
4. Set position and link (optional)
5. Toggle active status
6. Save banner

### For Offers:
1. Go to Admin → Offers & Coupons
2. Click "Add Offer"
3. Set discount type and value
4. Configure minimum order value
5. Add coupon code (optional)
6. Set active status
7. Save offer

### Image Upload Process:
1. Click upload area or drag & drop image
2. Image automatically optimized and saved
3. Preview shows immediately
4. Can remove and re-upload if needed

## Technical Details

### Image Optimization
- **Banners**: Resized to 1200x400px (3:1 ratio)
- **Quality**: 85% JPEG compression
- **Format Support**: JPG, PNG, WebP
- **Size Limits**: No hard limits (auto-optimized)

### File Storage
- **Location**: `/uploads/{folder}/` directory
- **Naming**: UUID-based unique filenames
- **Organization**: Separate folders for different content types
- **Cleanup**: Automatic file deletion when items removed

### Security
- **Authentication**: All admin endpoints require valid JWT
- **File Validation**: Only image files accepted
- **Path Security**: Prevents directory traversal
- **Error Handling**: No sensitive information leaked

## Files Modified

### Backend (`server.py`):
- Added upload endpoints with file handling
- Added banner CRUD endpoints
- Added offer CRUD endpoints
- Enhanced error handling and validation

### Frontend:
- `SingleImageUpload` component already existed and working
- `bannersAPI` and `offersAPI` already configured
- Banner and offer admin pages already implemented

## Resolution
The issue was entirely on the backend - the frontend components were correctly implemented but the API endpoints were missing. With the endpoints now added:

🎉 **Banner uploads working**
🎉 **Offer management working** 
🎉 **Image upload system fully functional**
🎉 **All CRUD operations available**

The banner and offer pages should now work perfectly for uploading and managing content!