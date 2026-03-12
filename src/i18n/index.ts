import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      nav: {
        home: 'Inicio',
        catalog: 'Catálogo',
        collections: 'Colecciones',
        about: 'Nosotros',
        contact: 'Contacto',
        cart: 'Carrito',
        account: 'Cuenta',
        login: 'Ingresar',
        logout: 'Salir',
      },
      cart: {
        remove: 'Quitar',
        checkout: 'Finalizar compra',
      },
      common: {
        addToCart: 'Agregar al carrito',
        viewProduct: 'Ver producto',
        loading: 'Cargando...',
        error: 'Error',
      },
    },
  },
  en: {
    translation: {
      nav: {
        home: 'Home',
        catalog: 'Catalog',
        collections: 'Collections',
        about: 'About',
        contact: 'Contact',
        cart: 'Cart',
        account: 'Account',
        login: 'Login',
        logout: 'Logout',
      },
      cart: {
        remove: 'Remove',
        checkout: 'Checkout',
      },
      common: {
        addToCart: 'Add to cart',
        viewProduct: 'View product',
        loading: 'Loading...',
        error: 'Error',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('locale') || 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

export default i18n;
