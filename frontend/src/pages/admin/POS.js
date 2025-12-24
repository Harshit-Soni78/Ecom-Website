import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { productsAPI, posAPI } from '../../lib/api';
import { toast } from 'sonner';
import { Search, Plus, Minus, Trash2, ShoppingCart, User, CreditCard, Banknote, Printer } from 'lucide-react';

export default function AdminPOS() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customer, setCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll({ limit: 100 });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const searchCustomer = async () => {
    if (!customerPhone || customerPhone.length < 10) return;
    try {
      const response = await posAPI.searchCustomer(customerPhone);
      setCustomer(response.data);
      if (response.data) {
        toast.success(`Customer found: ${response.data.name}`);
      }
    } catch (error) {
      setCustomer(null);
    }
  };

  const addToCart = (product) => {
    if (product.stock_qty <= 0) {
      toast.error('Product out of stock');
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_qty) {
          toast.error('Not enough stock');
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const getSubtotal = () => cart.reduce((sum, item) => sum + item.product.selling_price * item.quantity, 0);
  const getGST = () => getSubtotal() * 0.18;
  const getTotal = () => getSubtotal() + getGST();

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        shipping_address: {
          name: customer?.name || 'Walk-in Customer',
          phone: customerPhone || 'N/A',
          line1: 'In-Store',
          city: 'Local',
          state: 'Local',
          pincode: '000000',
        },
        payment_method: paymentMethod,
        is_offline: true,
        customer_phone: customerPhone || null,
      };

      const response = await posAPI.createSale(orderData);
      toast.success(`Sale completed! Order #${response.data.order_number}`);
      
      // Reset
      setCart([]);
      setCustomer(null);
      setCustomerPhone('');
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to complete sale');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6" data-testid="admin-pos">
      {/* Products Section */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Point of Sale</h1>
          <p className="text-slate-400">Create offline sales</p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 input-admin"
            data-testid="pos-search"
          />
        </div>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`bg-slate-800 border-slate-700 cursor-pointer transition-all hover:border-primary ${
                  product.stock_qty <= 0 ? 'opacity-50' : ''
                }`}
                onClick={() => addToCart(product)}
                data-testid={`pos-product-${product.id}`}
              >
                <CardContent className="p-3">
                  <div className="aspect-square bg-slate-700 rounded-lg mb-2 overflow-hidden">
                    {product.images?.[0] && (
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <h4 className="font-medium text-sm truncate">{product.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">{product.sku}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-primary">₹{product.selling_price}</span>
                    <Badge className={product.stock_qty > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}>
                      {product.stock_qty}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <Card className="w-96 bg-slate-800 border-slate-700 flex flex-col">
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Current Sale
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4">
          {/* Customer Search */}
          <div className="mb-4">
            <div className="flex gap-2">
              <Input
                placeholder="Customer phone (optional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="input-admin"
              />
              <Button variant="outline" className="border-slate-600" onClick={searchCustomer}>
                <User className="w-4 h-4" />
              </Button>
            </div>
            {customer && (
              <div className="mt-2 p-2 bg-slate-700/50 rounded text-sm">
                <p className="font-medium">{customer.name}</p>
                {customer.is_wholesale && (
                  <Badge className="mt-1 bg-violet-500/20 text-violet-400">Wholesale Customer</Badge>
                )}
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto space-y-2">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Cart is empty</p>
                <p className="text-sm">Click on products to add</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product.name}</p>
                    <p className="text-xs text-slate-400">₹{item.product.selling_price} each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="w-7 h-7 text-red-400" onClick={() => removeFromCart(item.product.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Section */}
          <div className="border-t border-slate-700 pt-4 mt-4 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal</span>
                <span>₹{getSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GST (18%)</span>
                <span>₹{getGST().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-700">
                <span>Total</span>
                <span className="text-primary">₹{getTotal().toLocaleString()}</span>
              </div>
            </div>

            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="input-admin">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4" />
                    Cash
                  </div>
                </SelectItem>
                <SelectItem value="upi">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    UPI
                  </div>
                </SelectItem>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Card
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              className="w-full bg-emerald-500 hover:bg-emerald-600 h-12 text-lg"
              onClick={handleCheckout}
              disabled={cart.length === 0 || loading}
              data-testid="pos-checkout-btn"
            >
              {loading ? 'Processing...' : `Complete Sale - ₹${getTotal().toLocaleString()}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
