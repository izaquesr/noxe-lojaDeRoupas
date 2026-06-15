import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header/Header";
import Cart from "./components/Cart/Cart";
import Footer from "./components/Footer/Footer";
import FloatingButtons from "./components/FloatingButtons/FloatingButtons";
import { ProductGridSkeleton } from "./components/LoadingSkeleton/LoadingSkeleton";
import ProtectedRoute from "./admin/ProtectedRoute";

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
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#0f1117", color:"#94a3b8" }}>
      Carregando...
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Admin routes - no store header/footer */}
          <Route path="/admin/login" element={
            <Suspense fallback={<AdminLoader />}><AdminLogin /></Suspense>
          } />
          <Route path="/admin" element={
            <ProtectedRoute><Suspense fallback={<AdminLoader />}><AdminDashboard /></Suspense></ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute><Suspense fallback={<AdminLoader />}><AdminProducts /></Suspense></ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute><Suspense fallback={<AdminLoader />}><AdminOrders /></Suspense></ProtectedRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedRoute><Suspense fallback={<AdminLoader />}><AdminCustomers /></Suspense></ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute><Suspense fallback={<AdminLoader />}><AdminCategories /></Suspense></ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute><Suspense fallback={<AdminLoader />}><AdminSettings /></Suspense></ProtectedRoute>
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
  );
}
