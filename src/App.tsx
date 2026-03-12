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
import { CmsRouteWrapper } from './pages/CmsRouteWrapper';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminLogin } from './admin/AdminLogin';
import { AdminProductos } from './admin/AdminProductos';
import { AdminProductoForm } from './admin/AdminProductoForm';
import { AdminPedidos } from './admin/AdminPedidos';
import { AdminCms } from './admin/AdminCms';
import { AdminCmsEditor } from './admin/cms-builder/AdminCmsEditor';
import { AdminCmsPreview } from './admin/AdminCmsPreview';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<CmsRouteWrapper routePath="/" fallback={<HomePage />} />} />
        <Route path="catalogo" element={<CmsRouteWrapper routePath="/catalogo" fallback={<CatalogPage />} />} />
        <Route path="producto/:slug" element={<ProductPage />} />
        <Route path="coleccion/:slug" element={<CollectionPage />} />
        <Route path="buscar" element={<CatalogPage />} />
        <Route path="carrito" element={<CmsRouteWrapper routePath="/carrito" fallback={<CartPage />} />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />
        <Route path="cuenta" element={<AccountPage />} />
        <Route path="nosotros" element={<CmsRouteWrapper routePath="/nosotros" fallback={<CmsPage slug="nosotros" />} />} />
        <Route path="preguntas-frecuentes" element={<CmsRouteWrapper routePath="/preguntas-frecuentes" fallback={<CmsPage slug="preguntas-frecuentes" />} />} />
        <Route path="politicas" element={<CmsRouteWrapper routePath="/politicas" fallback={<CmsPage slug="politicas" />} />} />
        <Route path="tratamiento-de-datos" element={<CmsRouteWrapper routePath="/tratamiento-de-datos" fallback={<CmsPage slug="tratamiento-de-datos" />} />} />
        <Route path="mayoristas" element={<CmsRouteWrapper routePath="/mayoristas" fallback={<CmsPage slug="mayoristas" />} />} />
        <Route path="punto-de-venta" element={<CmsRouteWrapper routePath="/punto-de-venta" fallback={<CmsPage slug="punto-de-venta" />} />} />
        <Route path="contacto" element={<CmsRouteWrapper routePath="/contacto" fallback={<ContactPage />} />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="login" element={<AdminLogin />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="productos" element={<AdminProductos />} />
        <Route path="productos/nuevo" element={<AdminProductoForm />} />
        <Route path="productos/:id/editar" element={<AdminProductoForm />} />
        <Route path="pedidos" element={<AdminPedidos />} />
        <Route path="cms" element={<AdminCms />} />
        <Route path="cms/nuevo" element={<AdminCmsEditor />} />
        <Route path="cms/:id/editar" element={<AdminCmsEditor />} />
        <Route path="cms/:id/preview" element={<AdminCmsPreview />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
