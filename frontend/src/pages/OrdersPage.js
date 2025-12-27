import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ordersAPI } from '../lib/api';
import { getImageUrl } from '../lib/utils';
import { toast } from 'sonner';
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  X, 
  ChevronRight,
  ShoppingBag,
  Calendar,
  MapPin,
  CreditCard
} from 'lucide-react';

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    bgColor: 'bg-yellow-50'
  },
  processing: {
    label: 'Processing',
    icon: Package,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    bgColor: 'bg-blue-50'
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    bgColor: 'bg-purple-50'
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 border-green-200',
    bgColor: 'bg-green-50'
  },
  cancelled: {
    label: 'Cancelled',
    icon: X,
    color: 'bg-red-100 text-red-800 border-red-200',
    bgColor: 'bg-red-50'
  }
};

const OrderCard = ({ order }) => {
  const navigate = useNavigate();
  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  // Calculate total items count
  const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-primary" onClick={() => navigate(`/orders/${order.id}`)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">#{order.order_number}</h3>
              <Badge className={`${status.color} font-medium`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-1">
                <ShoppingBag className="w-4 h-4" />
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              ₹{order.grand_total?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-muted-foreground">Total Amount</div>
          </div>
        </div>

        {/* Product Items */}
        {order.items && order.items.length > 0 && (
          <div className="space-y-3 mb-4">
            {order.items.slice(0, 2).map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                {/* Product Image */}
                <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-border">
                  {item.image_url ? (
                    <img
                      src={getImageUrl(item.image_url)}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop&crop=center';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate mb-1 text-foreground">{item.product_name}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-medium">Qty: {item.quantity}</span>
                      {item.sku && <span className="text-xs bg-muted px-2 py-1 rounded">SKU: {item.sku}</span>}
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      ₹{item.total?.toLocaleString() || (item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Show more items indicator */}
            {order.items.length > 2 && (
              <div className="text-center py-2">
                <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                  +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pt-4 border-t">
          {/* Delivery Address */}
          {order.shipping_address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium">{order.shipping_address.name}</div>
                <div className="text-muted-foreground">
                  {order.shipping_address.city}, {order.shipping_address.state}
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="font-medium capitalize">{order.payment_method}</span>
              <Badge 
                variant={order.payment_status === 'paid' ? 'default' : 'secondary'} 
                className="ml-2 text-xs"
              >
                {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Tracking Info */}
        {order.tracking_number && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-900">Tracking Number</div>
                <div className="text-sm font-mono text-blue-800">{order.tracking_number}</div>
              </div>
              {order.courier_provider && (
                <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                  {order.courier_provider}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
            View Details
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getUserOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = (status) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  const getTabCount = (status) => {
    return filterOrders(status).length;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-40 bg-muted rounded" />
          <div className="h-40 bg-muted rounded" />
          <div className="h-40 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" data-testid="orders-page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Link to="/products">
            <Button className="btn-primary">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tabs Navigation */}
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All
              <Badge variant="secondary" className="ml-1 text-xs">
                {getTabCount('all')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              Pending
              <Badge variant="secondary" className="ml-1 text-xs">
                {getTabCount('pending')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="processing" className="flex items-center gap-2">
              Processing
              <Badge variant="secondary" className="ml-1 text-xs">
                {getTabCount('processing')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="shipped" className="flex items-center gap-2">
              Shipped
              <Badge variant="secondary" className="ml-1 text-xs">
                {getTabCount('shipped')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="delivered" className="flex items-center gap-2">
              Delivered
              <Badge variant="secondary" className="ml-1 text-xs">
                {getTabCount('delivered')}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          {['all', 'pending', 'processing', 'shipped', 'delivered'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {filterOrders(status).length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    No {status === 'all' ? '' : status} orders found
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filterOrders(status).map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}