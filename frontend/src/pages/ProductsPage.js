import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Star, Filter, Grid3X3, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../lib/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductCard = ({ product, view }) => {
  const { addItem } = useCart();
  const { isWholesale } = useAuth();
  const navigate = useNavigate();

  const discount = Math.round(((product.mrp - product.selling_price) / product.mrp) * 100);
  const showWholesale = isWholesale && product.wholesale_price;

  if (view === 'list') {
    return (
      <Card 
        className="flex gap-4 p-4 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => navigate(`/products/${product.id}`)}
        data-testid={`product-card-${product.id}`}
      >
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1624927637280-f033784c1279?w=500'}
          alt={product.name}
          className="w-32 h-32 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className="font-semibold hover:text-primary transition-colors">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm">4.5 (120 reviews)</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold price-tag text-primary">
              ₹{(showWholesale ? product.wholesale_price : product.selling_price).toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground line-through">₹{product.mrp.toLocaleString()}</span>
            {discount > 0 && <Badge className="discount-badge">{discount}% OFF</Badge>}
          </div>
        </div>
        <Button 
          className="self-center btn-primary"
          onClick={(e) => { e.stopPropagation(); addItem(product); }}
        >
          Add to Cart
        </Button>
      </Card>
    );
  }

  return (
    <Card 
      className="card-product group cursor-pointer"
      onClick={() => navigate(`/products/${product.id}`)}
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1624927637280-f033784c1279?w=500'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 discount-badge">{discount}% OFF</Badge>
        )}
        {showWholesale && (
          <Badge className="absolute top-2 right-2 wholesale-badge">Wholesale</Badge>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs text-muted-foreground">4.5 (120)</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold price-tag text-primary">
            ₹{(showWholesale ? product.wholesale_price : product.selling_price).toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground line-through">₹{product.mrp.toLocaleString()}</span>
        </div>
        <Button 
          className="w-full mt-3 btn-primary opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => { e.stopPropagation(); addItem(product); }}
        >
          Add to Cart
        </Button>
      </div>
    </Card>
  );
};

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState('grid');

  const page = parseInt(searchParams.get('page') || '1');
  const categoryId = searchParams.get('category');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sort') || 'created_at';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, categoryId, search, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAll({
        page,
        category_id: categoryId,
        search,
        sort_by: sortBy.split('-')[0],
        sort_order: sortBy.includes('asc') ? 'asc' : 'desc',
        limit: 20,
      });
      setProducts(response.data.products || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-3">Categories</h4>
        <div className="space-y-2">
          <div 
            className={`cursor-pointer px-3 py-2 rounded-lg transition-colors ${!categoryId ? 'bg-primary text-white' : 'hover:bg-muted'}`}
            onClick={() => updateFilters('category', '')}
          >
            All Categories
          </div>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`cursor-pointer px-3 py-2 rounded-lg transition-colors ${categoryId === cat.id ? 'bg-primary text-white' : 'hover:bg-muted'}`}
              onClick={() => updateFilters('category', cat.id)}
            >
              {cat.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" data-testid="products-page">
      <div className="flex gap-8">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <FilterSidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {search ? `Search: "${search}"` : categoryId ? categories.find(c => c.id === categoryId)?.name || 'Products' : 'All Products'}
              </h1>
              <p className="text-muted-foreground">{products.length} products found</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value) => updateFilters('sort', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="selling_price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="selling_price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A-Z</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="hidden sm:flex border rounded-lg">
                <Button
                  variant={view === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setView('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={view === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setView('list')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className={`grid ${view === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-4`}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`${view === 'grid' ? 'aspect-square' : 'h-40'} bg-muted rounded-2xl animate-pulse`} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className={`grid ${view === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-4`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} view={view} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => updateFilters('page', String(page - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-4">Page {page} of {totalPages}</span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => updateFilters('page', String(page + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
