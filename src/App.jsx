import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Header/Header";
import Cart from "./components/Cart/Cart";
import Footer from "./components/Footer/Footer";
import { ProductGridSkeleton } from "./components/LoadingSkeleton/LoadingSkeleton";

const Home     = lazy(() => import("./pages/Home/Home"));
const Category = lazy(() => import("./pages/Category/Category"));
const Product  = lazy(() => import("./pages/Product/Product"));
const Checkout = lazy(() => import("./pages/Checkout/Checkout"));
const Search   = lazy(() => import("./pages/Search/Search"));

function PageLoader() {
  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 48 }}>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Header />
        <Cart />
        <main>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"                  element={<Home />} />
              <Route path="/categoria/:slug"   element={<Category />} />
              <Route path="/produto/:id"       element={<Product />} />
              <Route path="/checkout"          element={<Checkout />} />
              <Route path="/busca"             element={<Search />} />
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
      </CartProvider>
    </BrowserRouter>
  );
}
