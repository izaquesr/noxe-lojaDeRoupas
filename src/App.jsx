import { Suspense, lazy, Component } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header/Header";
import Cart from "./components/Cart/Cart";
import Footer from "./components/Footer/Footer";
import FloatingButtons from "./components/FloatingButtons/FloatingButtons";
import { ProductGridSkeleton } from "./components/LoadingSkeleton/LoadingSkeleton";
import ProtectedRoute from "./admin/ProtectedRoute";

// Lazy-loaded pages
const Home       = lazy(() => import("./pages/Home/Home"));
const Category   = lazy(() => import("./pages/Category/Category"));
const Product    = lazy(() => import("./pages/Product/Product"));
const Checkout   = lazy(() => import("./pages/Checkout/Checkout"));
const Search     = lazy(() => import("./pages/Search/Search"));

const AdminLogin      = lazy(() => import("./admin/AdminLogin"));
const AdminDashboard  = lazy(() => import("./admin/AdminDashboard"));
const AdminProducts   = lazy(() => import("./admin/AdminProducts"));
const AdminOrders     = lazy(() => import("./admin/AdminOrders"));
const AdminCustomers  = lazy(() => import("./admin/AdminCustomers"));
const AdminCategories = lazy(() => import("./admin/AdminCategories"));
const AdminSettings   = lazy(() => import("./admin/AdminSettings"));

// Error Boundary — prevents full black screen on runtime errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("React Error Boundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", background: "#0f1117", display: "flex",
          alignItems: "center", justifyContent: "center", flexDirection: "column",
          gap: 16, padding: 24, color: "#e2e8f0", fontFamily: "system-ui, sans-serif"
        }}>
          <div style={{ fontSize: "3rem" }}>⚠️</div>
          <h2 style={{ margin: 0, fontSize: "1.4rem" }}>Algo deu errado</h2>
          <p style={{ color: "#94a3b8", textAlign: "center", maxWidth: 480, margin: 0 }}>
            {this.state.error?.message || "Erro inesperado na aplicação."}
          </p>
          <p style={{ color: "#64748b", fontSize: "0.8rem", textAlign: "center", maxWidth: 600 }}>
            Verifique o console do navegador (F12) e confirme que as variáveis
            VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão corretas no arquivo .env
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#7c6aff", color: "#fff", border: "none",
              borderRadius: 8, padding: "10px 24px", cursor: "pointer",
              fontSize: "0.9rem", fontWeight: 600
            }}
          >
            Recarregar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function PageLoader() {
  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 48 }}>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}

function AdminLoader() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "#0f1117", color: "#94a3b8"
    }}>
      Carregando...
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Admin routes */}
            <Route path="/admin/login" element={
              <Suspense fallback={<AdminLoader />}><AdminLogin /></Suspense>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Suspense fallback={<AdminLoader />}><AdminDashboard /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute>
                <Suspense fallback={<AdminLoader />}><AdminProducts /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute>
                <Suspense fallback={<AdminLoader />}><AdminOrders /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/customers" element={
              <ProtectedRoute>
                <Suspense fallback={<AdminLoader />}><AdminCustomers /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/categories" element={
              <ProtectedRoute>
                <Suspense fallback={<AdminLoader />}><AdminCategories /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <Suspense fallback={<AdminLoader />}><AdminSettings /></Suspense>
              </ProtectedRoute>
            } />

            {/* Public store routes */}
            <Route path="/*" element={
              <CartProvider>
                <Header />
                <Cart />
                <main>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/"                element={<Home />} />
                      <Route path="/categoria/:slug" element={<Category />} />
                      <Route path="/produto/:id"     element={<Product />} />
                      <Route path="/checkout"        element={<Checkout />} />
                      <Route path="/busca"           element={<Search />} />
                      <Route path="*" element={
                        <div className="page-wrapper">
                          <div className="container" style={{ paddingTop: 80, textAlign: "center" }}>
                            <h2 style={{ fontSize: "3rem", marginBottom: 12 }}>404</h2>
                            <p style={{ color: "var(--texto-secundario)", marginBottom: 24 }}>Página não encontrada.</p>
                            <a href="/" className="btn btn-primary">Voltar ao início</a>
                          </div>
                        </div>
                      } />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
                <FloatingButtons />
              </CartProvider>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
