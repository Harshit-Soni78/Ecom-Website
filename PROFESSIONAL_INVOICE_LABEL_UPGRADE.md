# Professional Invoice & Label Format Upgrade

## Overview
The invoice and shipping label generation has been upgraded to match professional e-commerce standards, similar to major platforms like Amazon, Flipkart, and other professional courier services.

## New Features Implemented

### 📄 Professional Invoice Format

#### Layout & Design
- **A4 page size** for standard printing
- **Professional header** with company branding
- **Tax invoice format** compliant with GST regulations
- **Structured sections** for better readability

#### Key Sections
1. **Company Header**
   - Company name prominently displayed
   - Business name and address
   - GST number (GSTIN)
   - Contact information

2. **Invoice Details**
   - Purchase Order Number
   - Invoice Number (with prefix)
   - Order Date and Invoice Date
   - Professional formatting

3. **Customer Information**
   - Bill To / Ship To section
   - Complete customer address
   - Place of Supply for GST compliance

4. **Product Details Table**
   - Description with proper truncation
   - HSN codes for tax compliance
   - Quantity, Gross Amount, Discount
   - Taxable Value and Tax calculations
   - Individual item totals

5. **Tax Summary**
   - IGST/CGST/SGST breakdown
   - Professional tax disclaimer
   - Grand total with proper formatting

### 🏷️ Professional Shipping Label Format

#### Layout & Design
- **6" x 4" standard shipping label size**
- **Professional courier service layout**
- **Multiple information sections**
- **Barcode and QR code areas**

#### Key Sections
1. **Customer Address Section**
   - Clear "Customer Address" header
   - Complete delivery address
   - Proper formatting for courier scanning

2. **COD & Service Information**
   - Prominent COD amount display
   - Company/service name branding
   - Pickup indicator
   - Professional color coding

3. **Destination Codes**
   - State and city codes (S46 PSA format)
   - Return codes for failed deliveries
   - Courier routing information

4. **QR Code & Tracking**
   - QR code for digital scanning
   - Tracking number generation
   - Barcode representation

5. **Return Address**
   - "If undelivered, return to:" section
   - Complete company address
   - Professional formatting

6. **Product Details**
   - SKU, Size, Quantity, Color
   - Order number reference
   - Product summary table

## Technical Implementation

### Dependencies Added
```
qrcode==8.0  # For QR code generation
```

### New Functions
- `generate_invoice_pdf()` - Creates professional tax invoice
- `generate_shipping_label_pdf()` - Creates professional shipping label

### Updated Endpoints
- `/admin/orders/{order_id}/invoice` - Now uses professional format
- `/courier/label/{order_id}` - Now uses professional format
- `/admin/orders/{order_id}/shipping-label` - Professional download endpoint

### Enhanced Features
1. **Dynamic Company Information**
   - Pulls from settings database
   - Fallback to default values
   - GST number integration

2. **Professional Formatting**
   - Proper fonts and sizing
   - Color coding for sections
   - Border and layout structure

3. **Tax Compliance**
   - HSN code support
   - GST rate calculations
   - Tax invoice format

4. **Courier Integration**
   - Tracking number generation
   - Destination code mapping
   - Return address handling

## Usage Examples

### Generate Professional Invoice
```python
# API endpoint
GET /admin/orders/{order_id}/invoice

# Direct function call
pdf_buffer = generate_invoice_pdf(order_id, db)
```

### Generate Professional Shipping Label
```python
# API endpoint
GET /courier/label/{order_id}

# Direct function call
pdf_buffer = generate_shipping_label_pdf(order_id, db)
```

## Configuration

### Company Settings
Ensure your settings include:
- `company_name` - For invoice header
- `business_name` - For detailed information
- `gst_number` - For tax compliance
- `address` - Complete business address
- `phone` and `email` - Contact information

### HSN Codes
Products should have HSN codes for proper tax invoice generation:
```python
product.hsn_code = "960390"  # Example HSN code
```

## Testing

Run the test script to verify functionality:
```bash
./venv/bin/python test_professional_invoice_label.py
```

## Benefits

1. **Professional Appearance** - Matches industry standards
2. **Tax Compliance** - Proper GST invoice format
3. **Courier Compatibility** - Standard shipping label format
4. **Better Scanning** - QR codes and barcodes for automation
5. **Customer Trust** - Professional documentation builds confidence
6. **Regulatory Compliance** - Meets e-commerce documentation requirements

## Future Enhancements

1. **QR Code Integration** - Full QR code image embedding
2. **Barcode Generation** - Real barcode generation for tracking
3. **Multi-language Support** - Regional language options
4. **Custom Branding** - Logo integration
5. **Batch Printing** - Multiple labels/invoices at once

---

*This upgrade brings the invoice and label generation to professional e-commerce standards, ensuring compliance and improving customer experience.*