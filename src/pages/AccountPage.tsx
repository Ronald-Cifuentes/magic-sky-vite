import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CUSTOMER_TOKEN_KEY = 'customerToken';

export function AccountPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!localStorage.getItem(CUSTOMER_TOKEN_KEY)) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    navigate('/');
  };

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-secondary mb-6">{t('nav.account')}</h1>
      <div className="grid gap-4">
        <Link
          to="/cuenta/pedidos"
          className="block p-4 rounded-xl bg-background-soft border border-border-soft hover:shadow-pink"
        >
          Mis pedidos
        </Link>
        <Link
          to="/cuenta/datos"
          className="block p-4 rounded-xl bg-background-soft border border-border-soft hover:shadow-pink"
        >
          Mis datos
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="block w-full p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 font-semibold hover:bg-red-100 transition-colors text-left"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
