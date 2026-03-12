import { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client/core';

const CART_QUERY = gql`
  query Cart($sessionId: String) {
    cart(sessionId: $sessionId) {
      id
      currency
      items {
        id
        quantity
        imageUrl
        productSlug
        productTitle
        variant {
          id
          title
          price
        }
      }
    }
  }
`;

const ADD_TO_CART = gql`
  mutation AddToCart($variantId: String!, $quantity: Float!, $sessionId: String) {
    addToCart(variantId: $variantId, quantity: $quantity, sessionId: $sessionId) {
      id
      quantity
    }
  }
`;

const REMOVE_FROM_CART = gql`
  mutation RemoveCartItem($cartItemId: String!) {
    removeCartItem(cartItemId: $cartItemId)
  }
`;

const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($cartItemId: String!, $quantity: Float!) {
    updateCartItem(cartItemId: $cartItemId, quantity: $quantity) {
      id
      quantity
    }
  }
`;

const SESSION_KEY = 'magic-sky-cart-session';

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = 'anon-' + crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export type CartItem = {
  id: string;
  quantity: number;
  imageUrl?: string | null;
  productSlug?: string | null;
  productTitle?: string | null;
  variant: { id: string; title: string; price: number };
};

type CartContextValue = {
  sessionId: string;
  cartCount: number;
  cartItems: CartItem[];
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  loading: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [sessionId] = useState(getOrCreateSessionId);

  const { data, loading } = useQuery(CART_QUERY, {
    variables: { sessionId },
    fetchPolicy: 'cache-and-network',
  });

  const [addToCartMutation] = useMutation(ADD_TO_CART, {
    refetchQueries: [{ query: CART_QUERY, variables: { sessionId } }],
  });

  const [removeCartItemMutation] = useMutation(REMOVE_FROM_CART, {
    refetchQueries: [{ query: CART_QUERY, variables: { sessionId } }],
  });

  const [updateCartItemMutation] = useMutation(UPDATE_CART_ITEM, {
    refetchQueries: [{ query: CART_QUERY, variables: { sessionId } }],
  });

  const cartItems = useMemo(() => data?.cart?.items ?? [], [data?.cart?.items]);
  const cartCount = useMemo(
    () => cartItems.reduce((sum: number, it: { quantity: number }) => sum + it.quantity, 0),
    [cartItems]
  );

  const addToCart = useCallback(
    async (variantId: string, quantity = 1) => {
      try {
        await addToCartMutation({
          variables: { variantId, quantity, sessionId },
        });
      } catch (err) {
        console.error('Error adding to cart:', err);
      }
    },
    [addToCartMutation, sessionId]
  );

  const removeFromCart = useCallback(
    async (cartItemId: string) => {
      try {
        await removeCartItemMutation({ variables: { cartItemId } });
      } catch (err) {
        console.error('Error removing from cart:', err);
      }
    },
    [removeCartItemMutation]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      try {
        if (quantity <= 0) {
          await removeCartItemMutation({ variables: { cartItemId } });
        } else {
          await updateCartItemMutation({ variables: { cartItemId, quantity } });
        }
      } catch (err) {
        console.error('Error updating cart:', err);
      }
    },
    [updateCartItemMutation, removeCartItemMutation]
  );

  const value: CartContextValue = useMemo(
    () => ({ sessionId, cartCount, cartItems, addToCart, removeFromCart, updateQuantity, loading }),
    [sessionId, cartCount, cartItems, addToCart, removeFromCart, updateQuantity, loading]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
