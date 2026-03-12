import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const graphqlUrl = import.meta.env.VITE_GRAPHQL_URI || '/graphql';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation AdminLogin($email: String!, $password: String!) {
              adminLogin(email: $email, password: $password) {
                accessToken
                user { id email }
              }
            }
          `,
          variables: { email, password },
        }),
      });
      const json = await res.json();
      if (json.errors) {
        setError(json.errors[0]?.message || 'Error al iniciar sesión');
        return;
      }
      const token = json.data?.adminLogin?.accessToken;
      if (token) {
        localStorage.setItem('adminToken', token);
        navigate('/admin/dashboard');
      }
    } catch {
      setError('Error de conexión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-soft px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 bg-white rounded-2xl shadow-pink border border-border-soft"
      >
        <h1 className="text-2xl font-bold text-secondary mb-6">Admin Magic Sky</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="block font-semibold text-secondary mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl border border-border-soft"
            />
          </div>
          <div>
            <label className="block font-semibold text-secondary mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl border border-border-soft"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover"
          >
            Ingresar
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Demo: admin@magic-sky.com / Admin123!
        </p>
      </form>
    </div>
  );
}
