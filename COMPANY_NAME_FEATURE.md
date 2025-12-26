# Company Name Feature Implementation

## Overview
Added company name field to settings and integrated it into invoices and shipping labels.

## Changes Made

### 1. Database Schema
- ✅ Company name field already exists in `Settings` model (`company_name` column)
- ✅ Field is properly defined as nullable string in SQLAlchemy model

### 2. Backend API Updates
- ✅ Updated `SettingsUpdate` Pydantic model to include `company_name` field
- ✅ Backend endpoints already handle company_name in settings CRUD operations
- ✅ Added invoice generation endpoint: `GET /api/admin/orders/{order_id}/invoice`
- ✅ Added shipping label generation endpoint: `GET /api/admin/orders/{order_id}/shipping-label`

### 3. PDF Generation Functions
- ✅ `generate_invoice_pdf()` - Creates professional invoice with company name in header
- ✅ `generate_shipping_label_pdf()` - Creates shipping label with company name as sender
- ✅ Both functions use company name from settings, fallback to business name if not set

### 4. Frontend Updates
- ✅ Added company name field to admin settings page
- ✅ Field includes helpful description: "This name will appear on invoices and shipping labels"
- ✅ Updated API client to include `getShippingLabel()` method
- ✅ Updated orders page to use new shipping label endpoint

### 5. Dependencies
- ✅ Added `reportlab==4.0.9` to requirements.txt for PDF generation
- ✅ Added `pillow==10.4.0` for image processing (already installed)

## Usage

### Admin Settings
1. Navigate to Admin → Settings → Business tab
2. Fill in "Company Name" field
3. This name will appear on all invoices and shipping labels
4. Save settings

### Invoice Generation
- From Admin → Orders, click the document icon to generate/download invoice
- Invoice includes company name in header along with business details
- Professional format with itemized billing and GST calculations

### Shipping Label Generation  
- From Admin → Orders, click the printer icon to generate/download shipping label
- Label shows company name as sender information
- Standard 4"x6" shipping label format
- Includes order details and COD amount if applicable

## Technical Details

### Invoice Features
- Company name prominently displayed in header
- Complete business address and contact info
- Customer billing address
- Itemized product list with GST calculations
- Professional invoice numbering with configurable prefix

### Shipping Label Features
- Company name as sender
- Customer address as recipient  
- Order number and date
- COD amount for cash-on-delivery orders
- Standard shipping label dimensions (4"x6")

### API Endpoints
```
GET /api/admin/orders/{order_id}/invoice
- Returns PDF invoice for the specified order
- Requires admin authentication
- Response: application/pdf

GET /api/admin/orders/{order_id}/shipping-label  
- Returns PDF shipping label for the specified order
- Requires admin authentication
- Response: application/pdf
```

## Testing
- ✅ PDF generation tested and working
- ✅ Company name properly displayed in both invoice and label
- ✅ Settings page updated and functional
- ✅ API endpoints responding correctly

## Files Modified
1. `backend/server.py` - Added PDF generation functions and endpoints
2. `backend/requirements.txt` - Added reportlab dependency
3. `frontend/src/pages/admin/Settings.js` - Added company name field
4. `frontend/src/lib/api.js` - Added shipping label API method
5. `frontend/src/pages/admin/Orders.js` - Updated to use new shipping label endpoint

The feature is now fully implemented and ready for use!