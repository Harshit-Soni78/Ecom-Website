# Enhanced Return & Cancellation System

## Overview

This document describes the comprehensive order cancellation and return system implemented for the e-commerce platform. The system provides customers with the ability to cancel orders and request returns with proper evidence submission, while giving administrators full control over the approval process.

## Features

### 🚫 Order Cancellation System

#### Customer Features:
- **Eligibility Check**: Check if an order can be cancelled based on current status
- **Reason-based Cancellation**: Provide specific reasons for cancellation
- **Automatic Refund Processing**: Refunds are processed based on order status
- **Inventory Restoration**: Stock is automatically restored when orders are cancelled

#### Admin Features:
- **Cancellation Management**: View and manage all order cancellations
- **Shipment Cancellation**: Automatically cancel shipments through courier services
- **Refund Tracking**: Track refund status and processing

### 🔄 Return Request System

#### Customer Features:
- **Return Eligibility**: Check if delivered orders can be returned (7-day window)
- **Evidence Upload**: Upload images and videos as evidence for return requests
- **Return Tracking**: Track return shipment status from pickup to completion
- **Multiple Return Types**: Support for defective, wrong item, not satisfied, and damaged returns

#### Admin Features:
- **Return Review**: Review return requests with uploaded evidence
- **Approval/Rejection**: Approve or reject returns with detailed notes
- **Pickup Scheduling**: Automatically schedule return pickups through courier services
- **Refund Processing**: Process refunds after return verification

### 🔔 Comprehensive Notification System

#### Real-time Notifications:
- Order cancellation confirmations
- Return request submissions
- Return approval/rejection notifications
- Pickup scheduling updates
- Refund processing confirmations

#### Admin Notifications:
- New cancellation requests
- New return requests with evidence
- Return status updates
- Refund processing alerts

## API Endpoints

### Order Cancellation

#### Check Cancellation Eligibility
```http
GET /api/orders/{order_id}/can-cancel
Authorization: Bearer {token}
```

**Response:**
```json
{
  "can_cancel": true,
  "order_status": "confirmed",
  "order_number": "ORD20241226001",
  "refund_amount": 1200.00,
  "cancellation_type": "immediate",
  "refund_timeline": "Immediate refund",
  "implications": "Order will be cancelled immediately"
}
```

#### Cancel Order
```http
POST /api/orders/{order_id}/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "order_id": "order_uuid",
  "reason": "Changed my mind about the purchase",
  "cancellation_type": "customer"
}
```

### Return Requests

#### Check Return Eligibility
```http
GET /api/orders/{order_id}/can-return
Authorization: Bearer {token}
```

**Response:**
```json
{
  "can_return": true,
  "order_status": "delivered",
  "order_number": "ORD20241226001",
  "return_window_remaining": "5 days",
  "return_types": [
    {"value": "defective", "label": "Product is defective/damaged"},
    {"value": "wrong_item", "label": "Wrong item received"},
    {"value": "not_satisfied", "label": "Not satisfied with product"},
    {"value": "damaged", "label": "Package was damaged"}
  ],
  "evidence_required": true,
  "refund_timeline": "5-7 business days after return verification"
}
```

#### Create Return Request
```http
POST /api/orders/{order_id}/return
Authorization: Bearer {token}
Content-Type: application/json

{
  "order_id": "order_uuid",
  "items": [
    {
      "product_id": "product_uuid",
      "quantity": 1,
      "reason": "Product arrived damaged"
    }
  ],
  "reason": "Product arrived damaged",
  "return_type": "defective",
  "refund_method": "original",
  "description": "The product packaging was damaged and the item inside was broken"
}
```

#### Upload Return Evidence
```http
POST /api/returns/{return_id}/evidence
Authorization: Bearer {token}
Content-Type: multipart/form-data

files: [image/video files]
evidence_type: "image" | "video"
```

#### Track Return Shipment
```http
GET /api/returns/{return_id}/tracking
Authorization: Bearer {token}
```

### Admin Management

#### Get All Returns
```http
GET /api/admin/returns?status=pending&page=1&limit=20
Authorization: Bearer {admin_token}
```

#### Update Return Status
```http
PUT /api/admin/returns/{return_id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "approved",
  "admin_notes": "Return approved after reviewing evidence",
  "refund_amount": 1200.00
}
```

## Database Schema

### Enhanced Returns Table
```sql
CREATE TABLE returns (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    items JSON,
    reason TEXT,
    return_type VARCHAR(20) DEFAULT 'defective',
    refund_method VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending',
    refund_amount FLOAT,
    notes TEXT,
    
    -- Evidence fields
    evidence_images JSON DEFAULT '[]',
    evidence_videos JSON DEFAULT '[]',
    
    -- Tracking fields
    return_awb VARCHAR(50),
    courier_provider VARCHAR(50),
    pickup_scheduled_date DATETIME,
    pickup_completed_date DATETIME,
    received_date DATETIME,
    
    -- Admin fields
    admin_notes TEXT,
    processed_by VARCHAR(36),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Order Cancellations Table
```sql
CREATE TABLE order_cancellations (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36),
    reason TEXT,
    cancellation_type VARCHAR(20) DEFAULT 'customer',
    cancelled_by VARCHAR(36),
    refund_amount FLOAT,
    refund_status VARCHAR(20) DEFAULT 'pending',
    shipment_cancelled BOOLEAN DEFAULT 0,
    shipment_cancel_response JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Return Process Flow

### Customer Journey

1. **Check Eligibility**: Customer checks if order can be returned
2. **Submit Request**: Customer submits return request with reason
3. **Upload Evidence**: Customer uploads photos/videos of defective items
4. **Wait for Review**: Admin reviews request and evidence (24 hours)
5. **Approval/Rejection**: Customer receives notification of decision
6. **Pickup Scheduling**: If approved, return pickup is scheduled
7. **Item Verification**: Admin verifies returned items
8. **Refund Processing**: Refund is processed to original payment method

### Admin Workflow

1. **Review Request**: Admin reviews return request and evidence
2. **Make Decision**: Approve or reject based on return policy
3. **Schedule Pickup**: If approved, schedule return pickup
4. **Verify Items**: Verify condition of returned items
5. **Process Refund**: Process refund after verification
6. **Update Status**: Update return status throughout process

## Cancellation Process Flow

### Immediate Cancellation (Pending/Confirmed Orders)
1. Customer requests cancellation
2. Order status updated to "cancelled"
3. Inventory restored automatically
4. Immediate refund processed
5. Notifications sent to customer and admin

### Return-based Cancellation (Shipped Orders)
1. Customer requests cancellation
2. Return request created automatically
3. Shipment cancellation attempted via courier API
4. Return pickup scheduled
5. Refund processed after return verification

## Notification Types

### Customer Notifications
- `order_cancelled`: Order cancellation confirmation
- `return_request`: Return request submission confirmation
- `return_approved`: Return request approved
- `return_rejected`: Return request rejected
- `return_completed`: Return completed and refund processed

### Admin Notifications
- `order_cancelled`: New order cancellation
- `return_request`: New return request submitted
- `return_evidence`: New evidence uploaded for return
- `return_status_update`: Return status changes

## Configuration

### Return Policy Settings
- **Return Window**: 7 days from delivery
- **Evidence Required**: Yes for all return types
- **Maximum File Size**: 10MB for images, 50MB for videos
- **Maximum Files**: 5 files per evidence upload
- **Supported Formats**: JPG, PNG, MP4, MOV

### Refund Processing
- **Immediate Cancellation**: Instant refund
- **Processing Cancellation**: 1-2 business days
- **Return-based**: 5-7 business days after verification

## Testing

Run the comprehensive test suite:

```bash
cd backend
python test_return_cancellation_system.py
```

This will test:
- Order cancellation flow
- Return request creation
- Evidence upload
- Admin approval process
- Notification system
- Tracking functionality

## Migration

To add the enhanced return system to existing database:

```bash
cd backend
python migrate_return_system.py
```

This migration adds:
- New fields to returns table
- Order cancellations table
- Proper indexes for performance
- Default values for existing data

## Security Considerations

- **Access Control**: Users can only cancel/return their own orders
- **File Validation**: Uploaded evidence files are validated for type and size
- **Evidence Storage**: Evidence files are stored securely with unique names
- **Admin Authorization**: Return management requires admin privileges
- **Audit Trail**: All cancellations and returns are logged with timestamps

## Integration with Courier Services

The system integrates with Delhivery courier service for:
- Automatic shipment cancellation
- Return pickup scheduling
- Return tracking
- Delivery confirmation

## Future Enhancements

- **Partial Returns**: Support for returning individual items from multi-item orders
- **Return Labels**: Generate printable return labels
- **Quality Control**: Photo analysis for automatic return approval
- **Return Analytics**: Dashboard for return trends and reasons
- **Customer Return History**: Track customer return patterns
- **Automated Refunds**: Integration with payment gateways for automatic refunds