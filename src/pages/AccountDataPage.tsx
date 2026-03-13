import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client/core';

const MY_PROFILE = gql`
  query MyProfile {
    myProfile {
      id
      firstName
      lastName
      phone
      totalOrders
      totalSpent
    }
  }
`;

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      firstName
      lastName
      phone
    }
  }
`;

const CUSTOMER_TOKEN_KEY = 'customerToken';

export function AccountDataPage() {
  const { data, loading, error } = useQuery(MY_PROFILE);
  const [updateProfile, { loading: saving }] = useMutation(UPDATE_PROFILE, {
    refetchQueries: [{ query: MY_PROFILE }],
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);

  const profile = data?.myProfile;

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? '');
      setLastName(profile.lastName ?? '');
      setPhone(profile.phone ?? '');
    }
  }, [profile?.id]);

  if (!localStorage.getItem(CUSTOMER_TOKEN_KEY)) {
    return <Navigate to="/login" replace />;
  }

  if (loading) return <div className="py-8 px-4 text-center">Cargando datos...</div>;
  if (error) return <div className="py-8 px-4 text-red-600">Error al cargar. Inicia sesión de nuevo.</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    try {
      await updateProfile({
        variables: {
          input: { firstName: firstName || undefined, lastName: lastName || undefined, phone: phone || undefined },
        },
      });
      setSaved(true);
    } catch {
      // error handled by mutation
    }
  };

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/cuenta"
          className="text-primary font-semibold hover:underline"
          style={{ color: '#f04793' }}
        >
          ← Cuenta
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-secondary mb-6">Mis datos</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block font-semibold text-secondary mb-1">Nombre</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            minLength={2}
            className="w-full px-4 py-2 rounded-xl border border-border-soft bg-white"
          />
        </div>
        <div>
          <label className="block font-semibold text-secondary mb-1">Apellido</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            minLength={2}
            className="w-full px-4 py-2 rounded-xl border border-border-soft bg-white"
          />
        </div>
        <div>
          <label className="block font-semibold text-secondary mb-1">Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-border-soft bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-60"
          style={{ background: '#f04793' }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {saved && <p className="text-green-600 text-sm">Datos guardados correctamente.</p>}
      </form>
    </div>
  );
}
