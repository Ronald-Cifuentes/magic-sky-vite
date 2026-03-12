import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Apollo mutation
  };

  return (
    <div className="py-12 px-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-secondary mb-6">{t('nav.login')}</h1>
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
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover"
        >
          {t('nav.login')}
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
