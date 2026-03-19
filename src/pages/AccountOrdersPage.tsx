import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
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

const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: String!) {
    cancelOrder(orderId: $orderId) {
      id
      status
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

const CANCELABLE_STATUSES = ['PENDING'];

export function AccountOrdersPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(LIST_MY_ORDERS);
  const [cancelOrder, { loading: cancelling }] = useMutation(CANCEL_ORDER, {
    refetchQueries: [{ query: LIST_MY_ORDERS }],
  });

  if (!localStorage.getItem(CUSTOMER_TOKEN_KEY)) {
    return <Navigate to="/login" replace />;
  }

  const errMsg = (error?.graphQLErrors?.[0]?.message ?? error?.message ?? '').toLowerCase();
  const isAuthError =
    error?.graphQLErrors?.some(
      (e) =>
        e?.extensions?.code === 'UNAUTHENTICATED' ||
        e?.message?.toLowerCase().includes('unauthorized') ||
        e?.message?.toLowerCase().includes('jwt')
    ) ||
    errMsg.includes('unauthorized') ||
    errMsg.includes('jwt') ||
    errMsg.includes('token');

  if (loading) return <div className="py-8 px-4 text-center">Cargando pedidos...</div>;
  if (error) {
    return (
      <div className="py-8 px-4 max-w-4xl mx-auto">
        <div className="p-6 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <p className="font-semibold mb-2">Error al cargar pedidos.</p>
          <p className="text-sm mb-4">
            {isAuthError
              ? 'Tu sesión ha expirado o no es válida. Inicia sesión de nuevo.'
              : error?.graphQLErrors?.[0]?.message || error?.message || 'Intenta de nuevo más tarde.'}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                if (isAuthError) {
                  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
                  navigate('/login');
                } else {
                  window.location.reload();
                }
              }}
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
            >
              {isAuthError ? 'Iniciar sesión' : 'Reintentar'}
            </button>
            <Link
              to="/cuenta"
              className="px-4 py-2 rounded-lg border border-red-300 text-red-700 font-semibold hover:bg-red-100"
            >
              Volver a cuenta
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              <p className="text-sm text-secondary mb-3">
                {order.items?.length ?? 0} producto(s) · Total: {order.currency} ${order.total?.toFixed(2) ?? '0'}
              </p>
              {CANCELABLE_STATUSES.includes(order.status) && (
                <button
                  type="button"
                  onClick={async () => {
                    if (cancelling) return;
                    try {
                      await cancelOrder({ variables: { orderId: order.id } });
                    } catch (e) {
                      alert((e as Error)?.message ?? 'Error al cancelar');
                    }
                  }}
                  disabled={cancelling}
                  className="px-3 py-1.5 text-sm rounded-lg border border-red-300 text-red-700 hover:bg-red-50 font-medium disabled:opacity-50"
                >
                  Cancelar pedido
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
