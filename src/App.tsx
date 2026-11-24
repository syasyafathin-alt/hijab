import React, { useCallback, useEffect, useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { ToastContainer } from './components/common/ToastContainer';
import { Navbar } from './components/storefront/Navbar';
import { Footer } from './components/storefront/Footer';
import { HomePage } from './components/storefront/HomePage';
import { CatalogPage } from './components/storefront/CatalogPage';
import { ProductDetailPage } from './components/storefront/ProductDetailPage';
import { AboutPage, ContactPage } from './components/storefront/AboutContactPages';
import { CartDrawer } from './components/storefront/CartDrawer';
import { SearchModal } from './components/storefront/SearchModal';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';

function AppRouter() {
  const { isAdminAuthenticated } = useStore();
  const [currentPath, setCurrentPath] = useState<string>(
    () => window.location.pathname || '/'
  );
  const [catalogCategory, setCatalogCategory] = useState<string>('All');
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Route protection for /admin/dashboard
  useEffect(() => {
    if (currentPath === '/admin/dashboard' && !isAdminAuthenticated) {
      window.history.replaceState({}, '', '/admin/login');
      setCurrentPath('/admin/login');
    } else if (currentPath === '/admin/login' && isAdminAuthenticated) {
      window.history.replaceState({}, '', '/admin/dashboard');
      setCurrentPath('/admin/dashboard');
    }
  }, [currentPath, isAdminAuthenticated]);

  const handleSelectCategory = (categoryName: string) => {
    setCatalogCategory(categoryName);
    setCatalogSearch('');
    navigate('/shop');
  };

  const handleSelectProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleSearchToCatalog = (query: string) => {
    setCatalogSearch(query);
    setCatalogCategory('All');
    navigate('/shop');
  };

  // Admin routes render outside storefront chrome
  if (currentPath === '/admin/login') {
    return (
      <>
        <AdminLoginPage
          onLoginSuccess={() => navigate('/admin/dashboard')}
          onBackToStore={() => navigate('/')}
        />
        <ToastContainer />
      </>
    );
  }

  if (currentPath === '/admin/dashboard') {
    if (!isAdminAuthenticated) {
      return (
        <>
          <AdminLoginPage
            onLoginSuccess={() => navigate('/admin/dashboard')}
            onBackToStore={() => navigate('/')}
          />
          <ToastContainer />
        </>
      );
    }
    return (
      <>
        <AdminDashboard
          onLogout={() => navigate('/admin/login')}
          onViewStorefront={() => navigate('/')}
        />
        <ToastContainer />
      </>
    );
  }

  // Storefront routes
  const productMatch = currentPath.match(/^\/product\/([^/]+)$/);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2E1F1B]">
      <Navbar
        currentPath={currentPath}
        onNavigate={(path) => {
          if (path === '/shop') {
            setCatalogCategory('All');
            setCatalogSearch('');
          }
          navigate(path);
        }}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      <main className="flex-1">
        {currentPath === '/' && (
          <HomePage
            onNavigate={navigate}
            onSelectCategory={handleSelectCategory}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPath === '/shop' && (
          <CatalogPage
            mode="shop"
            initialCategory={catalogCategory}
            initialSearch={catalogSearch}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPath === '/new-collection' && (
          <CatalogPage
            mode="new-collection"
            initialCategory="All"
            initialSearch=""
            onSelectProduct={handleSelectProduct}
          />
        )}

        {productMatch && (
          <ProductDetailPage
            productId={productMatch[1]}
            onBackToCatalog={() => navigate('/shop')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPath === '/about' && <AboutPage onNavigate={navigate} />}

        {currentPath === '/contact' && <ContactPage />}

        {currentPath !== '/' &&
          currentPath !== '/shop' &&
          currentPath !== '/new-collection' &&
          currentPath !== '/about' &&
          currentPath !== '/contact' &&
          !productMatch && (
            <HomePage
              onNavigate={navigate}
              onSelectCategory={handleSelectCategory}
              onSelectProduct={handleSelectProduct}
            />
          )}
      </main>

      <Footer onNavigate={navigate} />

      <CartDrawer />
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectProduct={handleSelectProduct}
        onViewAllResults={handleSearchToCatalog}
      />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppRouter />
    </StoreProvider>
  );
}
