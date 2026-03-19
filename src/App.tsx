import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductPage } from './pages/ProductPage';
import { CollectionPage } from './pages/CollectionPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CheckoutCompletePage } from './pages/CheckoutCompletePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountPage } from './pages/AccountPage';
import { AccountOrdersPage } from './pages/AccountOrdersPage';
import { AccountDataPage } from './pages/AccountDataPage';
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
import { AdminCategorias } from './admin/AdminCategorias';
import { AdminCmsEditor } from './admin/cms-builder/AdminCmsEditor';
import { AdminCmsPreview } from './admin/AdminCmsPreview';
import { AdminBorradores } from './admin/AdminBorradores';
import { AdminPedidosAbandonados } from './admin/AdminPedidosAbandonados';
import { AdminPlaceholder } from './admin/AdminPlaceholder';
import { AdminColecciones } from './admin/AdminColecciones';
import { AdminInventario } from './admin/AdminInventario';
import { AdminOrdenesCompra } from './admin/AdminOrdenesCompra';
import { AdminClientes } from './admin/AdminClientes';
import { AdminMarcas } from './admin/AdminMarcas';

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
        <Route path="checkout/complete" element={<CheckoutCompletePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />
        <Route path="cuenta">
          <Route index element={<AccountPage />} />
          <Route path="pedidos" element={<AccountOrdersPage />} />
          <Route path="datos" element={<AccountDataPage />} />
        </Route>
        <Route path="nosotros" element={<CmsRouteWrapper routePath="/nosotros" fallback={<CmsPage slug="nosotros" />} />} />
        <Route path="preguntas-frecuentes" element={<CmsRouteWrapper routePath="/preguntas-frecuentes" fallback={<CmsPage slug="preguntas-frecuentes" />} />} />
        <Route path="politicas" element={<CmsRouteWrapper routePath="/politicas" fallback={<CmsPage slug="politicas" />} />} />
        <Route path="tratamiento-de-datos" element={<CmsRouteWrapper routePath="/tratamiento-de-datos" fallback={<CmsPage slug="tratamiento-de-datos" />} />} />
        <Route path="mayoristas" element={<CmsRouteWrapper routePath="/mayoristas" fallback={<CmsPage slug="mayoristas" />} />} />
        <Route path="punto-de-venta" element={<CmsRouteWrapper routePath="/punto-de-venta" fallback={<CmsPage slug="punto-de-venta" />} />} />
        <Route path="contacto" element={<ContactPage />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="login" element={<AdminLogin />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="productos" element={<AdminProductos />} />
        <Route path="categorias" element={<AdminCategorias />} />
        <Route path="productos/nuevo" element={<AdminProductoForm />} />
        <Route path="productos/:id/editar" element={<AdminProductoForm />} />
        <Route path="pedidos" element={<AdminPedidos />} />
        <Route path="pedidos/borradores" element={<AdminBorradores />} />
        <Route path="pedidos/abandonados" element={<AdminPedidosAbandonados />} />
        <Route path="productos/colecciones" element={<AdminColecciones />} />
        <Route path="productos/inventario" element={<AdminInventario />} />
        <Route path="productos/ordenes-compra" element={<AdminOrdenesCompra />} />
        <Route path="productos/tarjetas-regalo" element={<AdminPlaceholder title="Tarjetas de regalo" />} />
        <Route path="clientes" element={<AdminClientes />} />
        <Route path="marcas" element={<AdminMarcas />} />
        <Route path="marketing" element={<AdminPlaceholder title="Marketing" />} />
        <Route path="descuentos" element={<AdminPlaceholder title="Descuentos" />} />
        <Route path="mercados" element={<AdminPlaceholder title="Mercados" />} />
        <Route path="informes" element={<AdminPlaceholder title="Informes y estadísticas" />} />
        <Route path="canales" element={<AdminPlaceholder title="Canales de ventas" />} />
        <Route path="apps" element={<AdminPlaceholder title="Apps" />} />
        <Route path="configuracion" element={<AdminPlaceholder title="Configuración" />} />
        <Route path="cms" element={<AdminCms />} />
        <Route path="cms/nuevo" element={<AdminCmsEditor />} />
        <Route path="cms/:id/editar" element={<AdminCmsEditor />} />
        <Route path="cms/:id/preview" element={<AdminCmsPreview />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
