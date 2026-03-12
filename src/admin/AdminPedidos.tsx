import { useState, useEffect } from 'react';
import { adminFetch } from './adminApi';

const ADMIN_ORDERS = `
  query AdminOrders($limit: Float) {
    adminOrders(limit: $limit) {
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

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
};

export function AdminPedidos() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminFetch(ADMIN_ORDERS, { limit: 50 })
      .then((res) => {
        if (res.errors) setError(res.errors[0]?.message || 'Error');
        else setOrders((res.data as { adminOrders?: any[] })?.adminOrders ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Cargando pedidos...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary mb-6">Pedidos</h1>
      <p className="text-sm text-gray-500 mb-4">
        {orders.length} pedido(s)
      </p>
      <div className="bg-white rounded-xl shadow overflow-hidden border border-border-soft">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nº</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-sm">{o.orderNumber}</td>
                <td className="px-4 py-3 text-sm">{o.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    o.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                    o.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {statusLabels[o.status] ?? o.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">
                  ${(o.total / 100).toLocaleString()} {o.currency}
                </td>
                <td className="px-4 py-3 text-sm">{o.items?.length ?? 0} producto(s)</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="p-8 text-center text-gray-500">No hay pedidos aún</p>
        )}
      </div>
    </div>
  );
}
