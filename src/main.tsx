import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { client } from './graphql/client';
import { CartProvider } from './context/CartContext';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <CartProvider>
            <App />
          </CartProvider>
        </I18nextProvider>
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>,
);
