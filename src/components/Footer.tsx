import { Link } from 'react-router-dom';

const infoLinks = [
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/preguntas-frecuentes', label: 'Preguntas frecuentes' },
  { to: '/politicas', label: 'Nuestras políticas' },
  { to: '/tratamiento-de-datos', label: 'Tratamiento de datos' },
  { to: '/catalogo', label: 'Catálogos' },
];

const helpLinks = [
  { to: '/cuenta', label: 'Mi cuenta' },
  { to: '/mayoristas', label: 'Mayoristas' },
  { to: '/punto-de-venta', label: 'Punto de venta' },
  { to: '/contacto', label: 'Contacto' },
];

export function Footer() {
  return (
    <footer
      className="mt-auto text-white py-12 px-4"
      style={{
        background: 'linear-gradient(180deg, #ff9fc4 0%, #ffb3d4 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="font-extrabold text-lg mb-4">✉️ Contáctanos</h3>
          <p className="font-semibold">WhatsApp:</p>
          <a
            href="https://wa.me/573195393075"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline"
          >
            (+57) 319-539-3075
          </a>
          <p className="font-semibold mt-2">Correo:</p>
          <a href="mailto:sales@magic-sky.org" className="text-white hover:underline">
            sales@magic-sky.org
          </a>
        </div>
        <div>
          <h3 className="font-extrabold text-lg mb-4">⭐ Dirección</h3>
          <p>Carrera 95 # 49-84, SAN JAVIER, Medellín - Colombia</p>
        </div>
        <div>
          <h3 className="font-extrabold text-lg mb-4">♡ Información</h3>
          <ul className="space-y-2">
            {infoLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-white font-semibold hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-extrabold text-lg mb-4">📝 Ayuda</h3>
          <ul className="space-y-2">
            {helpLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-white font-semibold hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-8 text-center text-sm opacity-95">
        © {new Date().getFullYear()}, Magic Sky | Diseño Web por Dragon Tech S.A.S.
      </div>
    </footer>
  );
}
