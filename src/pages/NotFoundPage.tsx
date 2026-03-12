import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="mt-4 text-center text-secondary">Página no encontrada</p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
