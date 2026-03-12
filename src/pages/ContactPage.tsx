import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client/core';
import { Link } from 'react-router-dom';

const CMS_PAGE = gql`
  query CmsPageBySlug($slug: String!) {
    cmsPageBySlug(slug: $slug) {
      id
      slug
      title
      content
    }
  }
`;

const CONTACT_INFO = gql`
  query ContactInfo {
    contactInfo {
      whatsappUrl
      whatsappText
      email
      address
    }
  }
`;

const SUBMIT_CONTACT = gql`
  mutation SubmitContactMessage($input: SubmitContactInput!) {
    submitContactMessage(input: $input) {
      success
      message
    }
  }
`;

const cardStyle = {
  background: '#fff7fb',
  border: '1px solid #ffd7e7',
  boxShadow: '0 10px 24px rgba(255, 105, 175, 0.08)',
};

const inputStyle =
  'w-full px-4 py-3 rounded-xl border border-[#ffd7e7] bg-white focus:outline-none focus:ring-2 focus:ring-[#f04793] focus:border-transparent transition';

export function ContactPage() {
  const { data: pageData } = useQuery(CMS_PAGE, {
    variables: { slug: 'contacto' },
  });
  const { data: contactData } = useQuery(CONTACT_INFO, { errorPolicy: 'ignore' });
  const [submitContact, { loading, error, data: submitData }] = useMutation(SUBMIT_CONTACT);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const page = pageData?.cmsPageBySlug;
  const contact = contactData?.contactInfo;
  const success = showSuccess || submitData?.submitContactMessage?.success;

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'El nombre debe tener al menos 2 caracteres';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo electrónico inválido';
    if (form.message.trim().length < 10) e.message = 'El mensaje debe tener al menos 10 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await submitContact({
        variables: {
          input: {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim() || undefined,
            subject: form.subject.trim() || undefined,
            message: form.message.trim(),
          },
        },
      });
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setErrors({});
      setShowSuccess(true);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <section className="page bg-white min-h-[50vh]" style={{ color: '#7c2859' }}>
      <div
        className="page-hero relative overflow-hidden py-9 mb-6"
        style={{
          background: 'linear-gradient(180deg, #ffe8f2 0%, #ffd9ea 100%)',
        }}
      >
        <div className="hero-content max-w-[1280px] mx-auto px-6 text-center relative z-10">
          <h1
            className="text-3xl font-extrabold tracking-wider uppercase mb-1"
            style={{ color: '#7c2859' }}
          >
            Contacto
          </h1>
          <p className="hero-sub font-semibold" style={{ color: '#9a4b73' }}>
            Estamos aquí para ayudarte.
          </p>
        </div>
      </div>

      <div className="page-shell max-w-[960px] mx-auto px-6 pb-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Formulario de contacto */}
          <article
            className="page-card rounded-2xl p-6"
            style={cardStyle}
          >
            <h2 className="text-xl font-extrabold mb-4" style={{ color: '#7c2859' }}>
              Envíanos un mensaje
            </h2>

            {success ? (
              <div
                className="rounded-xl p-6 text-center"
                style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', color: '#2e7d32' }}
              >
                <p className="font-bold text-lg mb-2">✓ Mensaje enviado</p>
                <p className="mb-4">Te responderemos lo antes posible.</p>
                <button
                  type="button"
                  onClick={() => setShowSuccess(false)}
                  className="text-sm font-semibold underline hover:no-underline"
                  style={{ color: '#2e7d32' }}
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold text-sm mb-1" style={{ color: '#7c2859' }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className={inputStyle}
                    placeholder="Tu nombre"
                    required
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-sm mb-1" style={{ color: '#7c2859' }}>
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className={inputStyle}
                    placeholder="tu@correo.com"
                    required
                  />
                  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-sm mb-1" style={{ color: '#7c2859' }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className={inputStyle}
                    placeholder="(opcional)"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-sm mb-1" style={{ color: '#7c2859' }}>
                    Asunto
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    className={inputStyle}
                    placeholder="Consulta, pedido, sugerencia..."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-sm mb-1" style={{ color: '#7c2859' }}>
                    Mensaje *
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className={`${inputStyle} min-h-[120px] resize-y`}
                    placeholder="Escribe tu mensaje..."
                    required
                  />
                  {errors.message && <p className="text-sm text-red-600 mt-1">{errors.message}</p>}
                </div>

                {error && (
                  <p className="text-sm text-red-600">
                    {error.graphQLErrors?.[0]?.message || error.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-extrabold text-white disabled:opacity-60 transition"
                  style={{
                    background: '#f04793',
                    boxShadow: '0 12px 20px rgba(240, 71, 147, 0.22)',
                  }}
                >
                  {loading ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            )}
          </article>

          {/* Contáctanos - info de contacto */}
          <div className="space-y-6">
            <div
              className="contact-card rounded-2xl p-6 h-fit"
              style={cardStyle}
            >
              <h3 className="text-lg font-extrabold mb-4" style={{ color: '#7c2859' }}>
                ✉️ Contáctanos
              </h3>

              {contact?.whatsappUrl && contact?.whatsappText && (
                <div className="mb-4">
                  <p className="font-bold text-sm mb-1">WhatsApp:</p>
                  <a
                    href={contact.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:underline"
                    style={{ color: '#f04793' }}
                  >
                    {contact.whatsappText}
                  </a>
                </div>
              )}

              {contact?.email && (
                <div className="mb-4">
                  <p className="font-bold text-sm mb-1">Correo:</p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="font-semibold hover:underline"
                    style={{ color: '#f04793' }}
                  >
                    {contact.email}
                  </a>
                </div>
              )}

              {contact?.address && (
                <div>
                  <h3 className="text-lg font-extrabold mb-2" style={{ color: '#7c2859' }}>
                    ⭐ Dirección
                  </h3>
                  <p className="text-sm leading-relaxed">{contact.address}</p>
                </div>
              )}

              {!contact && (
                <p className="text-sm text-gray-500">Cargando información de contacto...</p>
              )}
            </div>

            {/* Contenido CMS adicional si existe */}
            {page?.content && (
              <div
                className="rounded-2xl p-6"
                style={cardStyle}
              >
                <div
                  className="prose prose-pink prose-sm max-w-none prose-headings:text-secondary prose-a:text-primary"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="page-actions flex flex-wrap gap-3 mt-6">
          <Link
            to="/catalogo"
            className="inline-block px-5 py-3 rounded-xl font-extrabold text-white no-underline"
            style={{
              background: '#f04793',
              boxShadow: '0 12px 20px rgba(240, 71, 147, 0.22)',
            }}
          >
            Ver productos
          </Link>
          <Link
            to="/"
            className="inline-block px-5 py-3 rounded-xl font-extrabold no-underline"
            style={{
              background: '#fff',
              color: '#f04793',
              border: '1px solid #ffd7e7',
              boxShadow: '0 8px 16px rgba(255, 105, 175, 0.12)',
            }}
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
