import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client/core';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      user { id email }
    }
  }
`;

const CUSTOMER_TOKEN_KEY = 'customerToken';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [login, { loading }] = useMutation(LOGIN_MUTATION);

  if (localStorage.getItem(CUSTOMER_TOKEN_KEY)) {
    return <Navigate to="/cuenta" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await login({ variables: { email, password } });
      const token = data?.login?.accessToken;
      if (token) {
        localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
        navigate('/cuenta');
      }
    } catch (err: unknown) {
      const apolloErr = err as { graphQLErrors?: Array<{ message?: string | string[] }>; message?: string };
      const raw = apolloErr?.graphQLErrors?.[0]?.message ?? apolloErr?.message;
      const msg = Array.isArray(raw) ? raw.join('. ') : String(raw ?? 'Error al iniciar sesión');
      setError(msg);
    }
  };

  return (
    <div className="py-12 px-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-secondary mb-6">{t('nav.login')}</h1>
      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}
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
          <label className="block font-semibold text-secondary mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-xl border border-border-soft bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover disabled:opacity-60"
        >
          {loading ? 'Ingresando...' : t('nav.login')}
        </button>
      </form>
      <p className="mt-4 text-center text-secondary">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="text-primary font-semibold hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
