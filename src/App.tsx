import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductPage } from './pages/ProductPage';
import { CollectionPage } from './pages/CollectionPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountPage } from './pages/AccountPage';
import { CmsPage } from './pages/CmsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminLogin } from './admin/AdminLogin';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="catalogo" element={<CatalogPage />} />
        <Route path="producto/:slug" element={<ProductPage />} />
        <Route path="coleccion/:slug" element={<CollectionPage />} />
        <Route path="buscar" element={<CatalogPage />} />
        <Route path="carrito" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />
        <Route path="cuenta" element={<AccountPage />} />
        <Route path="nosotros" element={<CmsPage slug="nosotros" />} />
        <Route path="preguntas-frecuentes" element={<CmsPage slug="preguntas-frecuentes" />} />
        <Route path="politicas" element={<CmsPage slug="politicas" />} />
        <Route path="tratamiento-de-datos" element={<CmsPage slug="tratamiento-de-datos" />} />
        <Route path="mayoristas" element={<CmsPage slug="mayoristas" />} />
        <Route path="punto-de-venta" element={<CmsPage slug="punto-de-venta" />} />
        <Route path="contacto" element={<CmsPage slug="contacto" />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="login" element={<AdminLogin />} />
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
