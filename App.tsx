
/// <reference types="vite/client" />
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Product, CartItem, CategoryDef, OrderDetails, StoreConfig } from './types';
import { HERO_IMAGE, ADMIN_AVATAR } from './constants';
import { generateProductDescription } from './services/geminiService';
import { publicApi, adminApi } from './services/api';

// --- Sub-components (defined outside to avoid re-renders) ---

const formatCOP = (val: number) => new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
}).format(val);

const Header = ({ currentView, setView, cartCount, onPublish, onLogout }: { currentView: View, setView: (v: View) => void, cartCount: number, onPublish?: () => void, onLogout?: () => void }) => (
  <header className="fixed top-0 w-full z-50 bg-dark-chocolate border-none shadow-xl shadow-black/5 transition-all duration-300">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div
        className="text-2xl font-display font-medium tracking-tight text-white cursor-pointer select-none"
        onClick={() => setView(View.LANDING)}
      >
        LA MALTEADERIA
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex space-x-8 text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-white/70">
          <a className="hover:text-caramel transition-colors cursor-pointer" onClick={() => setView(View.LANDING)}>Inicio</a>
          <a className="hover:text-caramel transition-colors cursor-pointer" onClick={() => setView(View.HOME)}>Menú</a>
          {/* Admin access hidden in plain sight or accessible via icons */}
        </div>

        <div className="flex items-center gap-4">
          {currentView === View.HOME && (
            <button
              onClick={() => setView(View.ADMIN_INVENTORY)}
              className="flex items-center justify-center size-8 rounded-full text-white/20 hover:text-caramel hover:bg-caramel/5 transition-all"
              title="Administrador"
            >
              <span className="material-symbols-outlined !text-lg">admin_panel_settings</span>
            </button>
          )}

          {(currentView === View.ADMIN_INVENTORY || currentView === View.ADMIN_ADD_PRODUCT || currentView === View.ADMIN_EDIT_PRODUCT || currentView === View.ADMIN_CATEGORIES || currentView === View.ADMIN_EDIT_CATEGORY || currentView === View.ADMIN_SETTINGS) && (
            <div className="flex items-center gap-3">
              <button
                onClick={onPublish}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-bold text-[10px] transition-all hover:bg-green-500/30"
              >
                <span className="material-symbols-outlined !text-sm">publish</span>
                <span className="hidden sm:inline uppercase tracking-tighter">Publicar</span>
              </button>
              <button
                onClick={() => setView(View.HOME)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-caramel text-white font-bold text-[10px] transition-all shadow-lg shadow-caramel/20"
              >
                <span className="material-symbols-outlined !text-sm">storefront</span>
                <span className="hidden sm:inline uppercase tracking-tighter">Tienda</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center justify-center size-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all font-bold"
                title="Cerrar Sesión"
              >
                <span className="material-symbols-outlined !text-sm">logout</span>
              </button>
            </div>
          )}


        </div>
      </div>
    </nav>
  </header>
);

const AdminSidebar = ({ active, setView }: { active: 'inventory' | 'categories' | 'settings', setView: (v: View) => void }) => (
  <aside className="w-64 fixed left-0 top-20 bottom-0 bg-white border-r border-primary/10 p-6 hidden lg:flex flex-col z-40">
    <div className="flex items-center gap-4 mb-10">
      <img src={ADMIN_AVATAR} className="size-12 rounded-full border-2 border-primary" alt="Admin" />
      <div>
        <h3 className="font-bold text-sm">Administrador</h3>
        <p className="text-[10px] text-primary uppercase font-bold tracking-widest">Administrador</p>
      </div>
    </div>
    <nav className="space-y-2 flex-1">
      <button
        onClick={() => setView(View.ADMIN_INVENTORY)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-full font-bold text-sm transition-all ${active === 'inventory'
          ? 'bg-primary text-white shadow-lg shadow-primary/20'
          : 'text-primary/60 hover:bg-primary/5'
          }`}
      >
        <span className="material-symbols-outlined">inventory_2</span>
        Inventario
      </button>
      <button
        onClick={() => setView(View.ADMIN_CATEGORIES)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-full font-bold text-sm transition-all ${active === 'categories'
          ? 'bg-primary text-white shadow-lg shadow-primary/20'
          : 'text-primary/60 hover:bg-primary/5'
          }`}
      >
        <span className="material-symbols-outlined">category</span>
        Categorías
      </button>
      <button
        onClick={() => setView(View.ADMIN_SETTINGS)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-full font-bold text-sm transition-all ${active === 'settings'
          ? 'bg-primary text-white shadow-lg shadow-primary/20'
          : 'text-primary/60 hover:bg-primary/5'
          }`}
      >
        <span className="material-symbols-outlined">settings</span>
        Configuración
      </button>
    </nav>
  </aside>
);


function LandingView({ onEnter, config }: { onEnter: () => void, config: StoreConfig | null }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center animate-fadeIn overflow-hidden bg-espresso">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={config?.landing_hero_image || "https://lh3.googleusercontent.com/aida-public/AB6AXuBaqjuXy7A9z4VPgBsY5CgsKz6H6Iou2Aj_2FdNfe3qYhzrmbDvTRete_LUpK7_OVEdOB-1J3VaCxg77p4-ac3vf_5khnKwnaugHEJVKi14Jm6Ijsk7qDRInZdnthLGq5k3WVaNlVXdWSEQr2nUNVdvoSkfzAIIjwxnxHuXNmcNSjxQFiPJ7q00ixEd1Fvv6hmGy_7CL9JFSzoMy99U9f6vA1eVeFPEpQ5JA6hsYV5l_yuOLHxCyECjN8G5WKMV5KBK7s8zhkbI9mo6"}
          alt="Gourmet Milkshake"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso via-dark-chocolate/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-espresso/40 via-transparent to-espresso/20"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          {/* Left Column: Content */}
          <div className="w-full lg:w-1/2 animate-slideUp text-left space-y-8 order-2 lg:order-1">
            <span className="inline-block px-4 py-1 bg-caramel text-white text-[10px] font-bold rounded-full tracking-widest uppercase mb-4">
              LA MALTEADERIA
            </span>

            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight text-white font-serif">
              La Experiencia <br />
              <span className="text-[#FFC137] italic font-display">Más Dulce</span> <br />
              de la Ciudad
            </h1>

            <p className="text-lg md:text-xl text-gray-200 font-sans font-light leading-relaxed max-w-xl">
              Descubre el arte de la malteada perfecta. Elaboradas con ingredientes de origen, helado artesanal y el chocolate más fino de la región.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button
                onClick={onEnter}
                className="group relative px-10 py-5 bg-caramel text-white font-black text-lg rounded-full overflow-hidden shadow-2xl shadow-caramel/30 hover:shadow-caramel/50 hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <span className="flex items-center gap-4 relative z-10 uppercase tracking-widest">
                  Ver Menú
                  <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                </span>
              </button>

              <button
                onClick={onEnter}
                className="border-2 border-white/30 hover:border-white text-white px-10 py-5 rounded-full font-bold text-lg transition-all backdrop-blur-sm hover:bg-white/5 active:scale-95 uppercase tracking-widest"
              >
                Nuestra Historia
              </button>
            </div>
          </div>

          {/* Right Column: Logo (Vertically Centered) */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center lg:justify-end animate-fadeIn order-1 lg:order-2" style={{ animationDelay: '0.5s' }}>
            <div className="relative group p-8 flex items-center justify-center min-h-[400px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-caramel/20 rounded-full blur-[100px] group-hover:bg-caramel/30 transition-all duration-700 animate-pulse"></div>
              <img
                src="/logo/Logo.png"
                alt="La Malteadería Logo"
                className="relative z-10 w-full max-w-[450px] lg:max-w-full h-auto object-contain drop-shadow-[0_45px_100px_rgba(0,0,0,0.6)] transition-transform duration-1000 group-hover:scale-105"
              />
            </div>

            {config?.schedule && (
              <div className="relative z-10 bg-black/30 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center animate-slideUp max-w-md mx-auto" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center justify-center gap-2 mb-2 text-[#FFC137]">
                  <span className="material-symbols-outlined">schedule</span>
                  <h3 className="font-display font-bold uppercase tracking-widest text-sm">Horario de Atención</h3>
                </div>
                <p className="text-white font-sans text-lg whitespace-pre-line leading-relaxed">
                  {config.schedule}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 w-full text-center text-white/20 text-[10px] font-sans font-bold uppercase tracking-[0.4em] animate-fadeIn delay-1000">
        &copy; {new Date().getFullYear()} {config?.landing_hero_image ? 'La Malteadería' : 'Malteadería San Rafael'} &bull; Calidad Premium
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>(View.LANDING);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Todas');
  const [categories, setCategories] = useState<CategoryDef[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryDef | null>(null);
  const [config, setConfig] = useState<StoreConfig | null>(null);

  useEffect(() => {
    // Initial fetch (Public data by default)
    fetchData(false);

    // Initial Routing based on Hash
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/menu') {
        setView(View.HOME);
      } else if (hash === '#/home' || hash === '') {
        setView(View.LANDING);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update URL hash when view changes (only for public views)
  useEffect(() => {
    if (view === View.HOME && window.location.hash !== '#/menu') {
      window.location.hash = '#/menu';
    } else if (view === View.LANDING && window.location.hash !== '' && window.location.hash !== '#/home') {
      window.location.hash = '#/home';
    }
  }, [view]);

  // ... (rest of the component logic until return)

  // [Note: using a large context range to ensure correct replacement]

  // Re-fetch when entering/leaving admin mode
  useEffect(() => {
    const isAdmin = [View.ADMIN_INVENTORY, View.ADMIN_ADD_PRODUCT, View.ADMIN_EDIT_PRODUCT, View.ADMIN_CATEGORIES, View.ADMIN_EDIT_CATEGORY, View.ADMIN_SETTINGS].includes(view);
    fetchData(isAdmin);
  }, [view]);

  const fetchData = async (isAdmin: boolean) => {
    try {
      const api = isAdmin ? adminApi : publicApi;
      const [prods, cats, conf] = await Promise.all([
        api.products.list(),
        api.categories.list(),
        api.config.get()
      ]);
      setProducts(prods);
      setCategories(cats);
      if (conf) setConfig(conf);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAdminAuthenticated') === 'true';
  });

  const handleLogin = (password: string) => {
    // Check against env var or fallback
    if (password === (import.meta.env.VITE_ADMIN_PASSWORD || 'admin123')) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('isAdminAuthenticated', 'true');
      setView(View.ADMIN_INVENTORY);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('isAdminAuthenticated');
    setView(View.HOME);
  };

  // Intercept view changes to protect admin routes
  const setViewProtected = (v: View) => {
    if (v.toString().startsWith('ADMIN_') && !isAdminAuthenticated) {
      setView(View.LOGIN);
    } else {
      setView(v);
    }
  };

  const handlePublish = async () => {
    if (confirm('¿Generar nueva versión estática (menu.json)?\n\nEsto actualizará tu archivo local para que puedas subirlo a GitHub.')) {
      try {
        const res = await fetch('/__publish', { method: 'POST' });
        if (res.ok) {
          alert('✅ ¡Éxito! El menú local se ha actualizado.\n\nAhora haz "git push" para subir los cambios.');
          window.location.reload();
        } else {
          alert('❌ Error: No se pudo ejecutar el script de sincronización via Vite.');
        }
      } catch (error) {
        console.error(error);
        alert('❌ Error: Asegúrate de que el servidor de desarrollo esté corriendo y REINÍCIALO si acabas de aplicar cambios.');
      }
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'Todas') return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  const handleCheckout = () => {
    setView(View.CHECKOUT);
  };

  const handleFinishOrder = (details: OrderDetails) => {
    const message = `*Nuevo Pedido de La Malteadería*\n\n` +
      `*Cliente:* ${details.fullName}\n` +
      `*Dirección:* ${details.address}\n` +
      `*WhatsApp:* ${details.phone}\n\n` +
      `*Detalle:*\n` +
      cart.map(item => `- ${item.name} (x${item.quantity}): ${formatCOP(item.price * item.quantity)}`).join('\n') +
      `\n\n*Total:* ${formatCOP(cartTotal)}\n` +
      `*Método de Pago:* ${details.paymentMethod === 'efectivo' ? 'Efectivo al recibir' : 'Transferencia'}\n` +
      (details.instructions ? `*Instrucciones:* ${details.instructions}` : '');

    window.open(`https://wa.me/573155463701?text=${encodeURIComponent(message)}`, '_blank');
    setCart([]);
    setView(View.HOME);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {view !== View.LANDING && (
        <Header currentView={view} setView={setViewProtected} cartCount={cartCount} onPublish={handlePublish} onLogout={handleLogout} />
      )}

      <main className={`flex-1 w-full ${view === View.LANDING ? '' : 'max-w-[1200px] mx-auto px-4 md:px-10 py-8'} ${[View.CHECKOUT, View.ADMIN_INVENTORY, View.ADMIN_ADD_PRODUCT, View.ADMIN_EDIT_PRODUCT, View.ADMIN_CATEGORIES, View.ADMIN_EDIT_CATEGORY, View.ADMIN_SETTINGS].includes(view) ? 'pt-28' : ''}`}>
        {view === View.LANDING && (
          <LandingView onEnter={() => setView(View.HOME)} config={config} />
        )}
        {view === View.HOME && (
          <HomeView
            products={filteredProducts}
            categories={categories}
            onAddToCart={addToCart}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            cartCount={cartCount}
            cartTotal={cartTotal}
            onCheckout={handleCheckout}
            config={config}
          />
        )}
        {view === View.LOGIN && (
          <LoginView onLogin={handleLogin} onBack={() => setView(View.HOME)} />
        )}
        {view === View.CHECKOUT && (
          <CheckoutView
            cart={cart}
            cartTotal={cartTotal}
            onBack={() => setView(View.HOME)}
            onFinish={handleFinishOrder}
          />
        )}
        {view === View.ADMIN_INVENTORY && (
          <AdminInventoryView
            products={products}
            onAdd={() => {
              setEditingProduct(null);
              setViewProtected(View.ADMIN_ADD_PRODUCT);
            }}
            setView={setViewProtected}
            onToggleAvailability={async (id) => {
              const product = products.find(p => p.id === id);
              if (product) {
                await adminApi.products.update(id, { available: !product.available });
                fetchData(true);
              }
            }}
            onEdit={(product) => {
              setEditingProduct(product);
              setViewProtected(View.ADMIN_EDIT_PRODUCT);
            }}
            onDelete={async (id) => {
              if (window.confirm('¿Eliminar producto?')) {
                await adminApi.products.delete(id);
                fetchData(true);
              }
            }}
          />
        )}
        {(view === View.ADMIN_ADD_PRODUCT || view === View.ADMIN_EDIT_PRODUCT) && (
          <AdminProductForm
            initialData={editingProduct}
            onBack={() => setViewProtected(View.ADMIN_INVENTORY)}
            onSave={async (productData) => {
              if (editingProduct) {
                await adminApi.products.update(editingProduct.id, productData);
              } else {
                await adminApi.products.create(productData);
              }
              fetchData(true);
              setViewProtected(View.ADMIN_INVENTORY);
            }}
          />
        )}
        {(view === View.ADMIN_CATEGORIES) && (
          <AdminCategoriesView
            categories={categories}
            setView={setViewProtected}
            onAdd={() => {
              setEditingCategory(null);
              setViewProtected(View.ADMIN_EDIT_CATEGORY);
            }}
            onEdit={(category) => {
              setEditingCategory(category);
              setViewProtected(View.ADMIN_EDIT_CATEGORY);
            }}
            onToggleStatus={async (id) => {
              const cat = categories.find(c => c.id === id);
              if (cat) {
                const newStatus = cat.status === 'Activo' ? 'Inactivo' : 'Activo';
                await adminApi.categories.update(id, { status: newStatus });
                fetchData(true);
              }
            }}
            onDelete={async (id) => {
              if (window.confirm('¿Eliminar categoría?')) {
                await adminApi.categories.delete(id);
                fetchData(true);
              }
            }}
          />
        )}
        {(view === View.ADMIN_EDIT_CATEGORY) && (
          <AdminCategoryForm
            initialData={editingCategory}
            onBack={() => setViewProtected(View.ADMIN_CATEGORIES)}
            onSave={async (categoryData) => {
              if (editingCategory) {
                await adminApi.categories.update(editingCategory.id, categoryData);
              }
              fetchData(true);
              setViewProtected(View.ADMIN_CATEGORIES);
            }}
          />
        )}
        {(view === View.ADMIN_SETTINGS) && (
          <AdminSettingsView
            config={config}
            setView={setViewProtected}
            onPublish={handlePublish}
            onSave={async (updates) => {
              if (config) {
                await adminApi.config.update(config.id, updates);
                fetchData(true);
              }
            }}
          />
        )}
      </main>

      <Footer config={config} />
    </div>
  );
}

// --- Views ---

function HomeView({
  products,
  categories,
  onAddToCart,
  activeCategory,
  setActiveCategory,
  cartCount,
  cartTotal,
  onCheckout,
  config
}: {
  products: Product[],
  categories: CategoryDef[],
  onAddToCart: (p: Product) => void,
  activeCategory: string,
  setActiveCategory: (c: string) => void,
  cartCount: number,
  cartTotal: number,
  onCheckout: () => void,
  config: StoreConfig | null
}) {
  const allCategories = ['Todas', ...categories.map(c => c.name)];

  return (
    <div className="bg-[#F8F7F5] min-h-screen">
      {/* Dynamic Hero Section */}
      <section className="relative h-[55vh] min-h-[500px] flex items-center justify-center overflow-hidden mb-12">
        <div className="absolute inset-0 z-0 scale-105">
          <img
            src={config?.home_hero_image || HERO_IMAGE}
            className="w-full h-full object-cover blur-[2px] brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-chocolate via-transparent to-[#EFE6D5]"></div>
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#3c2510] to-transparent pointer-events-none"></div>
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-dark-chocolate/40 to-transparent pointer-events-none"></div>
        </div>

        <div className="relative z-10 text-center px-6 animate-slideUp mt-8 pt-12">
          <img src="/logo/Logo.png" alt="Logo" className="w-56 h-auto mx-auto mb-6 drop-shadow-2xl" />
          <h2 className="text-5xl md:text-8xl font-display font-bold text-white mb-6">
            Sabores que <br />
            <span className="text-[#FFC137] italic">Enamoran</span>
          </h2>
          <div className="w-32 h-1 bg-[#FFC137] mx-auto rounded-full opacity-40"></div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 md:px-10 pb-20">
        {/* Filters */}
        <div className="flex items-center justify-center gap-4 mb-16 overflow-x-auto pb-4 no-scrollbar">
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-full font-sans font-bold whitespace-nowrap transition-all border ${activeCategory === cat
                ? 'bg-caramel text-white border-transparent shadow-lg shadow-caramel/20'
                : 'bg-white border-gray-200 text-gray-400 hover:text-caramel hover:border-caramel/40'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div id="product-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map(product => (
            <div key={product.id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-caramel/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col shadow-lg shadow-gray-200/50">
              <div className="relative h-72 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  style={{ objectPosition: product.image_position || 'center' }}
                />
                <div className="absolute top-4 right-4 bg-[#FFC137] px-5 py-2 rounded-full text-[#5F2F01] text-lg font-sans font-black shadow-xl border border-white/20 animate-fadeIn tracking-tight">
                  {formatCOP(product.price)}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow text-left">
                <h3 className="text-2xl font-display font-bold mb-2 group-hover:text-caramel transition-colors text-black">{product.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-sans font-medium mb-8 flex-grow line-clamp-3">
                  {product.description}
                </p>
                <button
                  onClick={() => onAddToCart(product)}
                  disabled={!product.available}
                  className={`w-full py-3.5 rounded-full font-bold flex items-center justify-center gap-2 transition-all text-sm ${product.available
                    ? 'bg-[#864503] text-white shadow-lg shadow-black/10 hover:brightness-110 active:scale-95'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    }`}
                >
                  <span className="material-symbols-outlined !text-xl">add_shopping_cart</span>
                  {product.available ? 'Agregar al Pedido' : 'No Disponible'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart */}
      {cartCount > 0 && (
        <div className="fixed bottom-10 right-10 z-[60] animate-fadeIn">
          <button
            onClick={onCheckout}
            className="group relative flex items-center gap-6 bg-[#FFC137] text-[#5F2F01] p-2 pl-8 pr-4 rounded-full shadow-2xl shadow-black/50 hover:scale-105 active:scale-95 transition-all h-24 border border-[#FFC137]/50"
          >
            <div className="flex flex-col items-start leading-tight mr-2">
              <span className="text-xs font-sans font-bold uppercase tracking-[0.2em] opacity-80">Tu Pedido</span>
              <span className="text-3xl font-display font-black">{formatCOP(cartTotal)}</span>
            </div>
            <div className="relative bg-[#5F2F01]/10 p-5 rounded-full">
              <span className="material-symbols-outlined !text-4xl text-[#5F2F01]">shopping_basket</span>
              <div className="absolute -top-1 -right-1 bg-[#5F2F01] text-[#FFC137] text-xs font-black size-7 rounded-full flex items-center justify-center shadow-lg border-2 border-[#FFC137]">
                {cartCount}
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

const Footer = ({ config }: { config: StoreConfig | null }) => (
  <footer className="bg-espresso pt-20 pb-10 border-t border-white/5" id="contacto">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2">
          <div className="text-3xl font-display font-bold text-caramel mb-6">LA MALTEADERIA</div>
          <p className="text-gray-400 max-w-sm leading-relaxed mb-6 font-sans">
            {config?.description || 'Llevando el arte de la repostería líquida a un nuevo nivel de sofisticación y sabor. Visítanos en nuestra boutique insignia.'}
          </p>
          <div className="flex space-x-4">
            <a className="w-10 h-10 rounded-full bg-dark-chocolate flex items-center justify-center hover:bg-caramel transition-colors cursor-pointer">
              <span className="text-[10px] font-bold">FB</span>
            </a>
            <a className="w-10 h-10 rounded-full bg-dark-chocolate flex items-center justify-center hover:bg-caramel transition-colors cursor-pointer">
              <span className="text-[10px] font-bold">IG</span>
            </a>
            <a className="w-10 h-10 rounded-full bg-dark-chocolate flex items-center justify-center hover:bg-caramel transition-colors cursor-pointer">
              <span className="text-[10px] font-bold">TW</span>
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-bold mb-6 text-white uppercase tracking-[0.2em]">Horarios</h4>
          <pre className="text-gray-400 font-sans whitespace-pre-wrap text-sm leading-relaxed">
            {config?.schedule || 'Lunes - Jueves: 12:00 - 21:00\nViernes - Sábado: 11:00 - 23:00\nDomingo: 11:00 - 21:00'}
          </pre>
        </div>
        <div>
          <h4 className="text-sm font-bold mb-6 text-white uppercase tracking-[0.2em]">Ubicación</h4>
          <p className="text-gray-400 font-sans text-sm leading-relaxed">
            {config?.address || 'Calle de los Sabores #123\nColonia San Rafael, CDMX\n+52 (55) 1234 5678'}
          </p>
        </div>
      </div>
      <div className="border-t border-white/5 pt-8 text-center text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
        <p>© {new Date().getFullYear()} LA MALTEADERIA. Todos los derechos reservados. Diseñado con pasión.</p>
      </div>
    </div>
  </footer>
);

function CheckoutView({ cart, cartTotal, onBack, onFinish }: { cart: CartItem[], cartTotal: number, onBack: () => void, onFinish: (details: any) => void }) {
  const nameInputRef = useRef<HTMLInputElement>(null); // Added
  const [form, setForm] = useState<OrderDetails>({
    fullName: '',
    address: '',
    phone: '',
    paymentMethod: 'efectivo',
    email: '',
    instructions: ''
  });

  useEffect(() => { // Added
    // Auto-focus name field on mount
    nameInputRef.current?.focus();
  }, []);

  const isValid = form.fullName && form.address && form.phone;

  return (
    <div className="animate-fadeIn pb-20">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-[#1d0c0f] tracking-tight mb-2">Finaliza tu pedido</h2>
        <p className="text-primary/70 text-lg">Revisa tu orden y completa los datos de entrega para disfrutar de tu malteada.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white p-8 rounded-xl shadow-sm border border-primary/5">
            <div className="flex items-center gap-2 mb-6 text-primary">
              <span className="material-symbols-outlined">person_pin_circle</span>
              <h3 className="text-xl font-bold">Datos de Entrega</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 ml-1">Nombre completo *</label>
                <input
                  ref={nameInputRef} // Added
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-5 py-3 rounded-full border-primary/20 focus:border-primary focus:ring-primary bg-background-light/50 outline-none transition-all"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 ml-1">Dirección de entrega *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-5 py-3 pl-12 rounded-full border-primary/20 focus:border-primary focus:ring-primary bg-background-light/50 outline-none transition-all"
                    placeholder="Calle, número y colonia"
                  />
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50">location_on</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 ml-1">Teléfono (WhatsApp) *</label>
                <div className="relative flex gap-2">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-primary/50">
                    <span className="material-symbols-outlined text-[20px]">smartphone</span>
                  </div>
                  <select className="w-28 pl-10 pr-2 py-3 rounded-full border-primary/20 focus:border-primary focus:ring-primary bg-background-light/50 text-sm outline-none transition-all appearance-none">
                    <option>+57</option>
                  </select>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="flex-1 px-5 py-3 rounded-full border-primary/20 focus:border-primary focus:ring-primary bg-background-light/50 outline-none transition-all"
                    placeholder="300 123 4567"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 ml-1">Método de pago *</label>
                <div className="relative">
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as any })}
                    className="w-full px-5 py-3 pl-12 rounded-full border-primary/20 focus:border-primary focus:ring-primary bg-background-light/50 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="efectivo">Efectivo al recibir</option>
                    <option value="transferencia">Transferencia Bancaria</option>
                  </select>
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50">payments</span>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 ml-1">Instrucciones adicionales <span className="text-primary/50 font-normal">(Opcional)</span></label>
                <textarea
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl border-primary/20 focus:border-primary focus:ring-primary bg-background-light/50 outline-none transition-all resize-none"
                  placeholder="Ej. Tocar el timbre fuerte, dejar en recepción..."
                  rows={3}
                ></textarea>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-28 bg-white p-8 rounded-xl shadow-xl shadow-primary/5 border border-primary/10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">shopping_basket</span>
              Resumen del Pedido
            </h3>
            <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto no-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-background-light rounded-xl">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="size-12 rounded-full object-cover border border-primary/10" />
                    <div>
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-xs text-primary/70">{item.quantity} unidad(es)</p>
                    </div>
                  </div>
                  <p className="font-bold">{formatCOP(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-6 border-t border-dashed border-primary/20">
              <div className="flex justify-between text-sm text-primary/70">
                <span>Subtotal</span>
                <span>{formatCOP(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-primary/70">
                <span>Costo de envío</span>
                <span className="text-primary font-bold uppercase text-[10px] tracking-widest">Por coordinar</span>
              </div>
              <div className="flex justify-between text-xl font-black pt-2">
                <span>Total</span>
                <span className="text-primary">{formatCOP(cartTotal)}</span>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-6 text-center">
                <p className="text-orange-800 font-bold text-sm mb-1 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">info</span>
                  Importante sobre el Domicilio
                </p>
                <p className="text-orange-900/80 text-xs">
                  El costo del domicilio es un <strong>valor adicional</strong> que se acordará contigo vía WhatsApp al confirmar el pedido.
                </p>
              </div>
            </div>
            <div className="mt-8 space-y-4">
              <button
                onClick={() => onFinish(form)}
                disabled={!isValid}
                className={`w-full text-white flex items-center justify-center gap-3 py-4 rounded-full font-bold text-lg transition-all shadow-lg ${isValid ? 'bg-[#25D366] hover:bg-[#128C7E] shadow-[#25D366]/20' : 'bg-gray-300 cursor-not-allowed'
                  }`}
              >
                <span className="material-symbols-outlined">send</span>
                Enviar Pedido por WhatsApp
              </button>
              <button
                onClick={onBack}
                className="w-full bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white flex items-center justify-center gap-2 py-3 rounded-full font-bold transition-all"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Seguir comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 1. Update AdminInventoryView components signature
// 1. Update AdminInventoryView components signature
function AdminInventoryView({ products, onAdd, setView, onToggleAvailability, onDelete, onEdit }: {
  products: Product[],
  onAdd: () => void,
  setView: (v: View) => void,
  onToggleAvailability: (id: string) => void,
  onDelete: (id: string) => void,
  onEdit: (p: Product) => void
}) {
  const [search, setSearch] = useState('');
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fadeIn flex h-full">
      <AdminSidebar active="inventory" setView={setView} />

      <div className="flex-1 lg:ml-64">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <h2 className="text-3xl font-black tracking-tight">Gestión de Productos</h2>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/60">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border-none rounded-full ring-1 ring-primary/10 focus:ring-2 focus:ring-primary transition-all text-sm w-full md:w-64"
                placeholder="Buscar productos..."
              />
            </div>
          </div>
          <button
            onClick={onAdd}
            className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-primary/25 hover:brightness-110 flex items-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined !text-lg">add_circle</span>
            Nuevo
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-primary/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-primary/5 text-primary/80 uppercase text-[11px] font-bold tracking-widest">
                  <th className="px-6 py-4">Imagen</th>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4 text-center">Precio</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4">
                      <img src={p.image} className="size-12 rounded-full object-cover border-2 border-white shadow-sm" alt={p.name} style={{ objectPosition: p.image_position || 'center' }} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm">{p.name}</p>
                      <p className="text-[10px] text-primary/60 font-bold uppercase tracking-tight">{p.category}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-primary">{formatCOP(p.price)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-tight ${p.available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                        {p.available ? 'Disponible' : 'Agotado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(p)}
                          className="size-9 rounded-full bg-background-light text-blue-500 hover:bg-blue-100 flex items-center justify-center transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => onToggleAvailability(p.id)}
                          className="size-9 rounded-full bg-background-light text-primary hover:bg-primary/20 flex items-center justify-center transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">{p.available ? 'visibility_off' : 'visibility'}</span>
                        </button>
                        <button
                          onClick={() => onDelete(p.id)}
                          className="size-9 rounded-full bg-background-light text-red-500 hover:bg-red-100 flex items-center justify-center transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t border-primary/5 text-xs text-primary/40 font-bold">
            Mostrando {filtered.length} de {products.length} productos
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminProductForm({ initialData, onBack, onSave }: { initialData?: Product | null, onBack: () => void, onSave: (p: Omit<Product, 'id'>) => void }) {
  const [form, setForm] = useState<Omit<Product, 'id'>>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    category: initialData?.category || 'Clásicas',
    image: initialData?.image || 'https://picsum.photos/400/400',
    available: initialData?.available ?? true,
    image_position: initialData?.image_position || 'center'
  });
  const [loadingAI, setLoadingAI] = useState(false);
  const [imageFile, setImageFile] = useState<File | undefined>();

  const handleGenerateDescription = async () => {
    if (!form.name) return;
    setLoadingAI(true);
    const aiDesc = await generateProductDescription(form.name, form.category, imageFile);
    setForm(prev => ({ ...prev, description: aiDesc }));
    setLoadingAI(false);
  };

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      <div className="flex flex-col gap-1 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-primary font-bold text-sm mb-2 hover:translate-x-[-4px] transition-transform"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Volver al listado
        </button>
        <h2 className="text-3xl font-black text-[#1d0c0f]">{initialData ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h2>
        <p className="text-gray-500">Configura los detalles del batido para publicarlo en la tienda.</p>
      </div>

      <div className="bg-white rounded-xl shadow-xl shadow-primary/5 border border-primary/10 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#1d0c0f] mb-2">Nombre del Producto</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border-primary/20 bg-background-light px-4 py-3 focus:ring-primary focus:border-primary transition-all"
                placeholder="Ej. Batido Selva Negra"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#1d0c0f] mb-2">Categoría</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full rounded-lg border-primary/20 bg-background-light px-4 py-3 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="Clásicas">Clásicas</option>
                  <option value="Premium">Premium</option>
                  <option value="Especiales">Especiales</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1d0c0f] mb-2">Precio</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border-primary/20 bg-background-light pl-8 pr-4 py-3 focus:ring-primary focus:border-primary transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-[#1d0c0f]">Descripción</label>
                <button
                  onClick={handleGenerateDescription}
                  disabled={loadingAI || !form.name}
                  className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline disabled:opacity-50"
                >
                  {loadingAI ? 'Generando...' : 'AI ✨ Generar Descripción'}
                </button>
              </div>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border-primary/20 bg-background-light px-4 py-3 focus:ring-primary focus:border-primary transition-all resize-none"
                placeholder="Escribe una descripción..."
                rows={4}
              ></textarea>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
              <span className="text-sm font-bold">Disponible en inventario</span>
              <button
                onClick={() => setForm({ ...form, available: !form.available })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.available ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.available ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#1d0c0f] mb-2">Imagen del Producto</label>
              <div className="relative border-2 border-dashed border-primary/30 rounded-lg aspect-square flex flex-col items-center justify-center bg-background-light hover:bg-primary/5 transition-all overflow-hidden group">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    try {
                      // 1. Upload to local server
                      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
                      const res = await fetch(`/__upload?name=${filename}`, {
                        method: 'POST',
                        body: file
                      });

                      if (!res.ok) throw new Error('Upload failed');

                      const data = await res.json();

                      // 2. Update form with new local path
                      setForm({ ...form, image: data.path });
                      setImageFile(file); // Save file for AI
                    } catch (error) {
                      console.error(error);
                      alert('Error al subir imagen. Asegúrate de estar corriendo el servidor local.');
                    }
                  }}
                />
                {form.image ? (
                  <>
                    <img
                      src={form.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: form.image_position || 'center' }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20 pointer-events-none">
                      <span className="text-white font-bold text-sm">Click para cambiar</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setForm({ ...form, image: '' });
                      }}
                      className="absolute top-2 right-2 bg-white p-2 rounded-full text-red-500 shadow-xl z-30 hover:bg-red-50 transition-colors"
                    >
                      <span className="material-symbols-outlined !text-lg">delete</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center p-8 text-center pointer-events-none">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                      <span className="material-symbols-outlined text-4xl text-primary">add_a_photo</span>
                    </div>
                    <p className="text-sm font-bold">Haz clic para subir</p>
                    <p className="text-xs text-gray-500 mt-1">O arrastra una imagen aquí</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1d0c0f] mb-2">Ajuste de Imagen (Foco)</label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary/60">Arriba (0%)</span>
                    <span className="text-xs font-bold text-primary">{form.image_position?.includes('%') ? form.image_position.split(' ')[1] : (form.image_position === 'top' ? '0%' : form.image_position === 'bottom' ? '100%' : '50%')}</span>
                    <span className="text-xs font-medium text-primary/60">Abajo (100%)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={
                      form.image_position?.includes('%')
                        ? parseInt(form.image_position.split(' ')[1])
                        : (form.image_position === 'top' ? 0 : form.image_position === 'bottom' ? 100 : 50)
                    }
                    onChange={(e) => setForm({ ...form, image_position: `50% ${e.target.value}%` })}
                    className="w-full accent-primary h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-2 text-center">Desliza para mover la imagen verticalmente.</p>
              </div>
            </div>
            <div className="bg-primary/5 p-4 rounded-lg">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Consejos Visuales</h4>
              <ul className="text-xs text-gray-600 space-y-2">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> Usa fondos neutros</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> Iluminación brillante</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-8 border-t border-primary/10 mt-8">
          <button onClick={onBack} className="w-full sm:w-auto px-8 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancelar</button>
          <button
            onClick={() => onSave(form)}
            className="w-full sm:w-auto px-10 py-3 rounded-full bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">save</span>
            Guardar Producto
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminCategoriesView({ categories, setView, onAdd, onEdit, onToggleStatus, onDelete }: {
  categories: CategoryDef[],
  setView: (v: View) => void,
  onAdd: () => void,
  onEdit: (c: CategoryDef) => void,
  onToggleStatus: (id: string) => void,
  onDelete: (id: string) => void
}) {
  const [newCategory, setNewCategory] = useState({ name: '', desc: '', color: 'bg-primary' });
  const [showToast, setShowToast] = useState(false);


  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) return;

    try {
      await adminApi.categories.create({
        name: newCategory.name,
        desc: newCategory.desc,
        color: newCategory.color,
        items: 0,
        status: 'Activo'
      });

      setNewCategory({ name: '', desc: '', color: 'bg-primary' });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Force reload to update list as we don't have refresh callback
      window.location.reload();
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error al crear categoría');
    }
  };


  return (
    <div className="animate-fadeIn flex h-full">
      <AdminSidebar active="categories" setView={setView} />

      <div className="flex-1 lg:ml-64 p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black tracking-tight text-[#1d0c0f]">Gestión de Categorías</h1>
            <p className="text-primary/70 text-sm font-medium">Define y organiza el menú de malteadas.</p>
          </div>
        </div>

        {showToast && (
          <div className="fixed top-24 right-10 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg font-bold animate-bounce-in z-50 flex items-center gap-2">
            <span className="material-symbols-outlined">check_circle</span>
            Categoría creada con éxito
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de Creación (Left Side) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/5 sticky top-28">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                Nueva Categoría
              </h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Nombre</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-primary/20 bg-background-light focus:ring-primary focus:border-primary"
                    placeholder="Ej. Malteadas Especiales"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Descripción Corta</label>
                  <textarea
                    value={newCategory.desc}
                    onChange={(e) => setNewCategory({ ...newCategory, desc: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-primary/20 bg-background-light focus:ring-primary focus:border-primary resize-none"
                    rows={2}
                    placeholder="Breve descripción..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Color Distintivo</label>
                  <div className="flex gap-2 flex-wrap">
                    {['bg-primary', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-teal-500'].map(color => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => setNewCategory({ ...newCategory, color })}
                        className={`size-8 rounded-full ${color} ${newCategory.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!newCategory.name}
                  className="w-full bg-primary text-white py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Crear Categoría
                </button>
              </form>
            </div>
          </div>

          {/* Listado (Right Side) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-primary/5 overflow-hidden">
              <div className="p-6 border-b border-primary/5 flex justify-between items-center">
                <h3 className="font-bold text-lg">Categorías Existentes</h3>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">{categories.length} Total</span>
              </div>
              <div className="divide-y divide-primary/5">
                {categories.map(cat => (
                  <div key={cat.id} className="p-6 flex items-center justify-between hover:bg-background-light transition-colors group">
                    <div className="flex items-center gap-6">
                      <div className={`size-20 rounded-full ${cat.color} flex items-center justify-center text-white shadow-md`}>
                        <span className="material-symbols-outlined text-5xl">icecream</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-[#1d0c0f]">{cat.name}</h4>
                        <p className="text-sm text-gray-500">{cat.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${cat.status === 'Activo' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {cat.status}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(cat)}
                          className="size-8 rounded-full hover:bg-blue-50 text-blue-500 flex items-center justify-center"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => onToggleStatus(cat.id)}
                          className="size-8 rounded-full hover:bg-gray-100 text-gray-600 flex items-center justify-center"
                          title={cat.status === 'Activo' ? 'Desactivar' : 'Activar'}
                        >
                          <span className="material-symbols-outlined text-sm">{cat.status === 'Activo' ? 'visibility_off' : 'visibility'}</span>
                        </button>
                        <button
                          onClick={() => onDelete(cat.id)}
                          className="size-8 rounded-full hover:bg-red-50 text-red-500 flex items-center justify-center"
                          title="Eliminar"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminSettingsView({ config, setView, onSave, onPublish }: { config: StoreConfig | null, setView: (v: View) => void, onSave: (data: Partial<StoreConfig>) => void, onPublish: () => void }) {
  const [form, setForm] = useState({
    description: config?.description || '',
    schedule: config?.schedule || '',
    address: config?.address || ''
  });
  const [saving, setSaving] = useState(false);

  // Update form when config loads
  useEffect(() => {
    if (config) {
      setForm({
        description: config.description,
        schedule: config.schedule,
        address: config.address,
        landing_hero_image: config.landing_hero_image,
        home_hero_image: config.home_hero_image
      });
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    if (confirm('Configuración guardada en la base de datos. ¿Deseas publicar los cambios ahora para que sean visibles en la tienda?')) {
      onPublish();
    }
  };

  return (
    <div className="animate-fadeIn flex h-full">
      <AdminSidebar active="settings" setView={setView} />

      <div className="flex-1 lg:ml-64 p-8">
        <h2 className="text-3xl font-black tracking-tight text-[#1d0c0f] mb-2">Configuración de Tienda</h2>
        <p className="text-gray-500 mb-8">Personaliza la información visible en el pie de página. Recuerda <strong>Publicar Cambios</strong> para que se reflejen en el sitio web.</p>

        <div className="bg-white rounded-xl shadow-xl shadow-primary/5 border border-primary/10 p-8 max-w-3xl">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#1d0c0f] mb-2">Descripción del Negocio</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border-primary/20 bg-background-light px-4 py-3 focus:ring-primary focus:border-primary transition-all resize-none"
                placeholder="Ej. Sabor artesanal en cada sorbo..."
                rows={3}
              ></textarea>
              <p className="text-xs text-gray-400 mt-1">Aparece en la columna izquierda del pie de página.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1d0c0f] mb-2">Horarios de Atención</label>
              <textarea
                value={form.schedule}
                onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                className="w-full rounded-lg border-primary/20 bg-background-light px-4 py-3 focus:ring-primary focus:border-primary transition-all resize-none"
                placeholder="Ej. Lunes - Viernes: 9am - 6pm"
                rows={4}
              ></textarea>
              <p className="text-xs text-gray-400 mt-1">Soporta saltos de línea.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1d0c0f] mb-2">Ubicación</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-lg border-primary/20 bg-background-light px-4 py-3 focus:ring-primary focus:border-primary transition-all"
                placeholder="Ej. Calle Principal #123..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1d0c0f] mb-2">Imagen de Fondo (Inicio)</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={form.landing_hero_image || ''}
                  onChange={(e) => setForm({ ...form, landing_hero_image: e.target.value })}
                  className="flex-1 rounded-lg border-primary/20 bg-background-light px-4 py-3 focus:ring-primary focus:border-primary transition-all text-sm"
                  placeholder="URL de la imagen..."
                />
                <label className="cursor-pointer bg-white border border-primary/20 px-4 py-3 rounded-lg hover:bg-primary/5 transition-all flex items-center gap-2 text-sm font-bold shadow-sm">
                  <span className="material-symbols-outlined !text-lg">upload</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const filename = `hero-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
                          const res = await fetch(`/__upload?name=${filename}`, {
                            method: 'POST',
                            body: file
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setForm({ ...form, landing_hero_image: data.path });
                          }
                        } catch (err) {
                          console.error(err);
                          alert('Error al subir imagen');
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1d0c0f] mb-2">Imagen de Fondo (Productos)</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={form.home_hero_image || ''}
                  onChange={(e) => setForm({ ...form, home_hero_image: e.target.value })}
                  className="flex-1 rounded-lg border-primary/20 bg-background-light px-4 py-3 focus:ring-primary focus:border-primary transition-all text-sm"
                  placeholder="URL de la imagen..."
                />
                <label className="cursor-pointer bg-white border border-primary/20 px-4 py-3 rounded-lg hover:bg-primary/5 transition-all flex items-center gap-2 text-sm font-bold shadow-sm">
                  <span className="material-symbols-outlined !text-lg">upload</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const filename = `product-hero-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
                          const res = await fetch(`/__upload?name=${filename}`, {
                            method: 'POST',
                            body: file
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setForm({ ...form, home_hero_image: data.path });
                          }
                        } catch (err) {
                          console.error(err);
                          alert('Error al subir imagen');
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-primary/10 flex justify-end gap-4">
              <button
                onClick={onPublish}
                className="px-6 py-3 rounded-full font-bold text-green-600 bg-green-50 hover:bg-green-100 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">publish</span>
                Publicar ahora
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">save</span>
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminCategoryForm({ initialData, onBack, onSave }: { initialData?: CategoryDef | null, onBack: () => void, onSave: (c: Partial<CategoryDef>) => void }) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    desc: initialData?.desc || '',
    color: initialData?.color || 'bg-primary',
    status: initialData?.status || 'Activo'
  });

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-primary font-bold text-sm mb-6 hover:translate-x-[-4px] transition-transform">
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Volver a Categorías
      </button>

      <div className="bg-white p-8 rounded-xl shadow-xl shadow-primary/5 border border-primary/10">
        <h2 className="text-2xl font-black text-[#1d0c0f] mb-6">Editar Categoría</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-primary/20 bg-background-light focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Descripción</label>
            <textarea
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-primary/20 bg-background-light focus:ring-primary focus:border-primary resize-none"
              rows={3}
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Color Distintivo</label>
            <div className="flex gap-2 flex-wrap">
              {['bg-primary', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-teal-500'].map(color => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  className={`size-10 rounded-full ${color} ${form.color === color ? 'ring-4 ring-offset-2 ring-gray-200' : ''}`}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Estado</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              className="w-full px-4 py-3 rounded-lg border-primary/20 bg-background-light focus:ring-primary focus:border-primary"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <button
            onClick={() => onSave(form)}
            className="w-full bg-primary text-white py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all mt-4"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginView({ onLogin, onBack }: { onLogin: (password: string) => boolean, onBack: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(password);
    if (!success) {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-primary/10">
        <div className="bg-primary/5 p-8 text-center border-b border-primary/10">
          <div className="bg-primary/10 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-primary">lock</span>
          </div>
          <h2 className="text-2xl font-black text-[#1d0c0f]">Acceso Administrativo</h2>
          <p className="text-primary/70 text-sm font-medium mt-1">Ingresa tu clave maestra</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Contraseña</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => { setError(false); setPassword(e.target.value); }}
                className={`w-full bg-background-light border ${error ? 'border-red-500 focus:ring-red-200' : 'border-primary/10 focus:ring-primary/20'} rounded-xl px-4 py-3 outline-none focus:ring-4 transition-all`}
                placeholder="••••••••"
                autoFocus
              />
              {error && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                  <span className="material-symbols-outlined text-lg">error</span>
                </div>
              )}
            </div>
            {error && <p className="text-xs font-bold text-red-500 animate-pulse">Contraseña incorrecta</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white font-black py-4 rounded-xl hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Ingresar al Panel</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>

        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <button onClick={onBack} className="text-sm font-bold text-gray-400 hover:text-primary transition-colors">
            ← Volver a la Tienda
          </button>
        </div>
      </div>
    </div>
  );
}
