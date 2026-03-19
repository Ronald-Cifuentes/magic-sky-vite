import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { gql } from '@apollo/client/core';
import { useCart } from '../context/CartContext';

const CUSTOMER_TOKEN_KEY = 'customerToken';
const WOMPI_CHECKOUT_URL = 'https://checkout.wompi.co/p/';

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      customerProfile {
        id
      }
    }
  }
`;

const MY_PROFILE = gql`
  query MyProfileForCheckout {
    myProfile {
      id
      firstName
      lastName
      phone
      defaultAddress {
        id
        address1
        address2
        city
        province
        countryCode
        zip
        phone
      }
    }
  }
`;

const CREATE_ORDER = gql`
  mutation CreateOrderFromCart($cartId: String!, $email: String!, $shippingAddress: String!, $customerId: String) {
    createOrderFromCart(cartId: $cartId, email: $email, shippingAddress: $shippingAddress, customerId: $customerId) {
      id
      orderNumber
      total
      currency
    }
  }
`;

const WOMPI_CONFIG = gql`
  query WompiCheckoutConfig($orderId: String!) {
    wompiCheckoutConfig(orderId: $orderId) {
      publicKey
      reference
      currency
      amountInCents
      integritySignature
      redirectUrl
    }
  }
`;

export function CheckoutPage() {
  const { cartId, cartCount, cartItems } = useCart();
  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem(CUSTOMER_TOKEN_KEY);

  const { data: meData, loading: meLoading } = useQuery(ME_QUERY, {
    skip: !isLoggedIn,
    errorPolicy: 'ignore',
    fetchPolicy: 'network-only',
  });
  const { data: profileData, loading: profileLoading } = useQuery(MY_PROFILE, {
    skip: !isLoggedIn,
    errorPolicy: 'ignore',
    fetchPolicy: 'network-only',
  });

  const [createOrder, { loading: creating, error: createError }] = useMutation(CREATE_ORDER);
  const [fetchWompiConfig] = useLazyQuery(WOMPI_CONFIG);
  const [autoRedirecting, setAutoRedirecting] = useState(false);

  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

  const profile = profileData?.myProfile;
  const me = meData?.me;
  const defaultAddr = profile?.defaultAddress;

  const hasAutoRedirected = useRef(false);

  useEffect(() => {
    if (isLoggedIn && (me || profile)) {
      if (me?.email) setEmail(me.email);
      if (defaultAddr) {
        if (defaultAddr.address1) setAddress(defaultAddr.address1 + (defaultAddr.address2 ? `, ${defaultAddr.address2}` : ''));
        if (defaultAddr.city) setCity(defaultAddr.city);
        if (defaultAddr.phone || profile?.phone) setPhone(defaultAddr.phone ?? profile?.phone ?? '');
      } else if (profile?.phone) {
        setPhone(profile.phone);
      }
    }
  }, [isLoggedIn, me?.email, profile?.id, defaultAddr?.id, defaultAddr?.address1, defaultAddr?.city, defaultAddr?.phone, defaultAddr?.address2, profile?.phone]);

  useEffect(() => {
    if (
      hasAutoRedirected.current ||
      !isLoggedIn ||
      !cartId ||
      !me?.email?.trim() ||
      !profile?.id ||
      !defaultAddr?.address1?.trim() ||
      !defaultAddr?.city?.trim()
    ) {
      return;
    }
    hasAutoRedirected.current = true;
    setAutoRedirecting(true);
    const shippingAddress = JSON.stringify({
      address: defaultAddr.address1 + (defaultAddr.address2 ? `, ${defaultAddr.address2}` : ''),
      city: defaultAddr.city,
      phone: defaultAddr.phone || profile.phone || undefined,
    });
    createOrder({
      variables: {
        cartId,
        email: me.email.trim(),
        shippingAddress,
        customerId: profile.id,
      },
    })
      .then(({ data }) => {
        const order = data?.createOrderFromCart;
        if (order?.id) {
          fetchWompiConfig({ variables: { orderId: order.id } }).then((res) => {
            const config = (res.data as { wompiCheckoutConfig?: { publicKey: string; reference: string; amountInCents: number; integritySignature: string; redirectUrl?: string } })?.wompiCheckoutConfig;
            if (!config) {
              window.location.href = `/checkout/complete?orderId=${order.id}`;
              return;
            }
            const params = new URLSearchParams({
              'public-key': config.publicKey,
              currency: (config as { currency?: string }).currency ?? 'COP',
              'amount-in-cents': String(config.amountInCents),
              reference: config.reference,
              'signature:integrity': config.integritySignature,
              'redirect-url': config.redirectUrl ?? `${window.location.origin}/checkout/complete?orderId=${order.id}`,
            });
            window.location.href = `${WOMPI_CHECKOUT_URL}?${params.toString()}`;
          }).catch(() => {
            window.location.href = `/checkout/complete?orderId=${order.id}`;
          });
        }
      })
      .catch(() => {
        hasAutoRedirected.current = false;
        setAutoRedirecting(false);
      });
  }, [isLoggedIn, cartId, me?.email, profile?.id, defaultAddr?.address1, defaultAddr?.address2, defaultAddr?.city, defaultAddr?.phone, profile?.phone, createOrder, fetchWompiConfig]);

  if (cartCount === 0 && !cartItems?.length) {
    return (
      <div className="py-8 px-4 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-secondary mb-4">Tu carrito está vacío</h1>
        <p className="text-secondary mb-6">Agrega productos antes de continuar al checkout.</p>
        <Link
          to="/catalogo"
          className="inline-block px-6 py-3 rounded-xl bg-primary text-white font-semibold"
          style={{ background: '#f04793' }}
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  if (!cartId) {
    return (
      <div className="py-8 px-4 max-w-2xl mx-auto text-center">
        <p className="text-secondary">Cargando carrito...</p>
      </div>
    );
  }

  const hasCompleteData = isLoggedIn && me?.email?.trim() && defaultAddr?.address1?.trim() && defaultAddr?.city?.trim();
  const isLoadingProfile = isLoggedIn && (meLoading || profileLoading);

  if (isLoadingProfile) {
    return (
      <div className="py-8 px-4 max-w-2xl mx-auto text-center">
        <p className="text-secondary">Cargando datos...</p>
      </div>
    );
  }

  if (autoRedirecting || (hasCompleteData && creating)) {
    return (
      <div className="py-8 px-4 max-w-2xl mx-auto text-center">
        <p className="text-secondary">Redirigiendo al pago...</p>
      </div>
    );
  }

  const redirectToWompi = (orderId: string) => {
    fetchWompiConfig({ variables: { orderId } }).then((res) => {
      const config = (res.data as { wompiCheckoutConfig?: { publicKey: string; reference: string; amountInCents: number; integritySignature: string; redirectUrl?: string } })?.wompiCheckoutConfig;
      if (!config) {
        window.location.href = `/checkout/complete?orderId=${orderId}`;
        return;
      }
      const params = new URLSearchParams({
        'public-key': config.publicKey,
        currency: (config as { currency?: string }).currency ?? 'COP',
        'amount-in-cents': String(config.amountInCents),
        reference: config.reference,
        'signature:integrity': config.integritySignature,
        'redirect-url': config.redirectUrl ?? `${window.location.origin}/checkout/complete?orderId=${orderId}`,
      });
      window.location.href = `${WOMPI_CHECKOUT_URL}?${params.toString()}`;
    }).catch(() => {
      window.location.href = `/checkout/complete?orderId=${orderId}`;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const shippingAddress = JSON.stringify({
      address: address.trim(),
      city: city.trim(),
      phone: phone.trim() || undefined,
    });
    try {
      const { data } = await createOrder({
        variables: {
          cartId,
          email: email.trim(),
          shippingAddress,
          customerId: isLoggedIn && profile?.id ? profile.id : null,
        },
      });
      const order = data?.createOrderFromCart;
      if (order?.id) {
        redirectToWompi(order.id);
      }
    } catch {
      // Error shown below
    }
  };

  return (
    <div className="py-8 px-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-secondary mb-6">Checkout</h1>
      {isLoggedIn && (me || profile) && (
        <p className="mb-4 text-sm text-secondary">
          Datos precargados desde tu cuenta. Puedes modificarlos si envías a otra dirección.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold text-secondary mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-xl border border-border-soft bg-white"
          />
        </div>
        <div>
          <label className="block font-semibold text-secondary mb-1">Dirección</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-xl border border-border-soft bg-white"
            placeholder="Calle, número, apartamento..."
          />
        </div>
        <div>
          <label className="block font-semibold text-secondary mb-1">Ciudad</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-xl border border-border-soft bg-white"
          />
        </div>
        <div>
          <label className="block font-semibold text-secondary mb-1">Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-border-soft bg-white"
            placeholder="(opcional)"
          />
        </div>
        {createError && (
          <p className="text-red-600 text-sm">
            {createError.graphQLErrors?.[0]?.message ?? createError.message}
          </p>
        )}
        <button
          type="submit"
          disabled={creating}
          className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary-hover disabled:opacity-60"
          style={{ background: '#f04793' }}
        >
          {creating ? 'Procesando...' : 'Continuar a pago'}
        </button>
      </form>
    </div>
  );
}
