import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client/core';

const ORDER_BY_ID = gql`
  query OrderById($id: String!) {
    orderById(id: $id) {
      id
      orderNumber
      total
      currency
      status
      paymentStatus
    }
  }
`;

export function CheckoutCompletePage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const errorParam = searchParams.get('error');

  const { data, loading, error } = useQuery(ORDER_BY_ID, {
    variables: { id: orderId ?? '' },
    skip: !orderId,
    errorPolicy: 'ignore',
  });

  const order = data?.orderById;
  const showError = !!errorParam || (orderId && error && !order);
  const orderNotFound = orderId && !loading && !error && !order;

  if (loading && orderId) {
    return (
      <div className="py-8 px-4 max-w-2xl mx-auto text-center">
        <p className="text-secondary">Verificando pedido...</p>
      </div>
    );
  }

  if (showError || orderNotFound) {
    return (
      <div className="py-8 px-4 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {orderNotFound ? 'Pedido no encontrado' : 'Error en el pago'}
        </h1>
        <p className="text-secondary mb-6">
          {orderNotFound
            ? 'No se encontró el pedido solicitado. Verifica el enlace o contacta a soporte.'
            : 'No se pudo completar el pago. Por favor intenta de nuevo o contacta a soporte.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/carrito"
            className="inline-block px-6 py-3 rounded-xl bg-primary text-white font-semibold"
            style={{ background: '#f04793' }}
          >
            Volver al carrito
          </Link>
          <Link
            to="/catalogo"
            className="inline-block px-6 py-3 rounded-xl border border-primary text-primary font-semibold"
            style={{ borderColor: '#f04793', color: '#f04793' }}
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 max-w-2xl mx-auto text-center">
      <h1 className="text-2xl font-bold text-secondary mb-4">¡Pedido realizado!</h1>
      {order?.orderNumber && (
        <p className="text-secondary mb-2">
          Número de pedido: <strong>{order.orderNumber}</strong>
        </p>
      )}
      {order?.total != null && (
        <p className="text-secondary mb-6">
          Total: {order.currency ?? 'COP'} ${(order.total / 100).toFixed(0)}
        </p>
      )}
      {!order && (
        <p className="text-secondary mb-6">Gracias por tu compra.</p>
      )}
      <p className="text-secondary mb-6">
        El número de guía se envía por WhatsApp o correo.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/cuenta/pedidos"
          className="inline-block px-6 py-3 rounded-xl bg-primary text-white font-semibold"
          style={{ background: '#f04793' }}
        >
          Ver mis pedidos
        </Link>
        <Link
          to="/catalogo"
          className="inline-block px-6 py-3 rounded-xl border border-primary text-primary font-semibold"
          style={{ borderColor: '#f04793', color: '#f04793' }}
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
