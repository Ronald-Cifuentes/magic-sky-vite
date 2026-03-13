import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client/core';
import { Navigate } from 'react-router-dom';

const LIST_MY_ORDERS = gql`
  query ListMyOrders {
    listMyOrders {
      id
      orderNumber
      email
      status
      subtotal
      total
      currency
      items {
        id
        productTitle
        variantTitle
        quantity
        unitPrice
        totalPrice
      }
    }
  }
`;

const CUSTOMER_TOKEN_KEY = 'customerToken';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
};

export function AccountOrdersPage() {
  const { data, loading, error } = useQuery(LIST_MY_ORDERS);

  if (!localStorage.getItem(CUSTOMER_TOKEN_KEY)) {
    return <Navigate to="/login" replace />;
  }

  if (loading) return <div className="py-8 px-4 text-center">Cargando pedidos...</div>;
  if (error) return <div className="py-8 px-4 text-red-600">Error al cargar pedidos. Inicia sesión de nuevo.</div>;

  const orders = data?.listMyOrders ?? [];

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/cuenta"
          className="text-primary font-semibold hover:underline"
          style={{ color: '#f04793' }}
        >
          ← Cuenta
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-secondary mb-6">Mis pedidos</h1>
      {orders.length === 0 ? (
        <div className="p-8 rounded-xl bg-background-soft border border-border-soft text-center">
          <p className="text-secondary mb-4">Aún no tienes pedidos.</p>
          <Link
            to="/catalogo"
            className="inline-block px-5 py-3 rounded-xl font-extrabold text-white"
            style={{ background: '#f04793' }}
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: { id: string; orderNumber: string; status: string; total: number; currency: string; items: unknown[] }) => (
            <div
              key={order.id}
              className="p-4 rounded-xl bg-background-soft border border-border-soft"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold">#{order.orderNumber}</span>
                <span className="px-2 py-1 rounded text-xs bg-white border">
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
              <p className="text-sm text-secondary">
                {order.items?.length ?? 0} producto(s) · Total: {order.currency} ${order.total?.toFixed(2) ?? '0'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
