import { useNavigate } from 'react-router-dom';
import { useMutation, useLazyQuery } from '@apollo/client';
import { gql } from '@apollo/client/core';

const CUSTOMER_TOKEN_KEY = 'customerToken';
const WOMPI_CHECKOUT_URL = 'https://checkout.wompi.co/p/';

const ME_QUERY = gql`
  query MeForCheckout {
    me {
      id
      email
    }
  }
`;

const MY_PROFILE = gql`
  query MyProfileForCheckoutFlow {
    myProfile {
      id
      defaultAddress {
        id
        address1
        address2
        city
      }
    }
  }
`;

const CREATE_ORDER = gql`
  mutation CreateOrderFromCartFlow($cartId: String!, $email: String!, $shippingAddress: String!, $customerId: String) {
    createOrderFromCart(cartId: $cartId, email: $email, shippingAddress: $shippingAddress, customerId: $customerId) {
      id
      orderNumber
      total
      currency
    }
  }
`;

const WOMPI_CONFIG = gql`
  query WompiCheckoutConfigFlow($orderId: String!) {
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

export function useCheckoutFlow(cartId: string | null) {
  const navigate = useNavigate();
  const [createOrder] = useMutation(CREATE_ORDER);
  const [fetchWompiConfig] = useLazyQuery(WOMPI_CONFIG);
  const [fetchMe] = useLazyQuery(ME_QUERY, { fetchPolicy: 'network-only' });
  const [fetchProfile] = useLazyQuery(MY_PROFILE, { fetchPolicy: 'network-only' });

  const redirectToWompi = (orderId: string) => {
    fetchWompiConfig({ variables: { orderId } }).then((res) => {
      const config = (res.data as { wompiCheckoutConfig?: { publicKey: string; reference: string; currency?: string; amountInCents: number; integritySignature: string; redirectUrl?: string } })?.wompiCheckoutConfig;
      if (!config) {
        window.location.href = `/checkout/complete?orderId=${orderId}`;
        return;
      }
      const params = new URLSearchParams({
        'public-key': config.publicKey,
        currency: config.currency ?? 'COP',
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

  const handleFinalizarCompra = async () => {
    if (!cartId) {
      navigate('/checkout');
      return;
    }
    const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem(CUSTOMER_TOKEN_KEY);
    if (!isLoggedIn) {
      navigate('/checkout');
      return;
    }
    try {
      const [meRes, profileRes] = await Promise.all([
        fetchMe(),
        fetchProfile(),
      ]);
      const me = (meRes.data as { me?: { email?: string } })?.me;
      const profile = (profileRes.data as { myProfile?: { id: string; defaultAddress?: { address1?: string; address2?: string; city?: string } } })?.myProfile;
      const addr = profile?.defaultAddress;
      const hasComplete = !!(me?.email?.trim() && addr?.address1?.trim() && addr?.city?.trim());

      if (!hasComplete) {
        navigate('/checkout');
        return;
      }

      const shippingAddress = JSON.stringify({
        address: addr!.address1 + (addr!.address2 ? `, ${addr!.address2}` : ''),
        city: addr!.city,
        phone: undefined,
      });

      const { data } = await createOrder({
        variables: {
          cartId,
          email: me!.email!.trim(),
          shippingAddress,
          customerId: profile?.id ?? null,
        },
      });
      const order = (data as { createOrderFromCart?: { id: string } })?.createOrderFromCart;
      if (order?.id) {
        redirectToWompi(order.id);
      } else {
        navigate('/checkout');
      }
    } catch {
      navigate('/checkout');
    }
  };

  return {
    isLoggedIn: typeof window !== 'undefined' && !!localStorage.getItem(CUSTOMER_TOKEN_KEY),
    handleFinalizarCompra,
  };
}
