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
      defaultAddress {
        id
        address1
        address2
        city
        province
        countryCode
        zip
        phone
      }
      addresses {
        id
        address1
        city
      }
    }
  }
`;

const ME_QUERY = gql`
  query MeForAccountData {
    me {
      id
      email
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

const CREATE_ADDRESS = gql`
  mutation CreateAddress($input: CreateAddressInput!) {
    createAddress(input: $input) {
      id
      defaultAddress {
        id
        address1
        address2
        city
        province
        countryCode
        zip
        phone
      }
    }
  }
`;

const UPDATE_ADDRESS = gql`
  mutation UpdateAddress($id: String!, $input: UpdateAddressInput!) {
    updateAddress(id: $id, input: $input) {
      id
      defaultAddress {
        id
        address1
        address2
        city
        province
        countryCode
        zip
        phone
      }
    }
  }
`;

const UPDATE_EMAIL = gql`
  mutation UpdateCustomerEmail($input: UpdateEmailInput!) {
    updateCustomerEmail(input: $input)
  }
`;

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

const CUSTOMER_TOKEN_KEY = 'customerToken';

const inputStyle = 'w-full px-4 py-2 rounded-xl border border-border-soft bg-white';

export function AccountDataPage() {
  const { data, loading, error } = useQuery(MY_PROFILE, {
    fetchPolicy: 'network-only',
  });
  const { data: meData } = useQuery(ME_QUERY);
  const [updateProfile, { loading: saving }] = useMutation(UPDATE_PROFILE, {
    refetchQueries: [{ query: MY_PROFILE }],
    awaitRefetchQueries: true,
    errorPolicy: 'all',
  });
  const [createAddress, { loading: savingAddr }] = useMutation(CREATE_ADDRESS, {
    refetchQueries: [{ query: MY_PROFILE }],
    awaitRefetchQueries: true,
    errorPolicy: 'all',
  });
  const [updateAddress, { loading: updatingAddr }] = useMutation(UPDATE_ADDRESS, {
    refetchQueries: [{ query: MY_PROFILE }],
    awaitRefetchQueries: true,
    errorPolicy: 'all',
  });
  const [updateEmail, { loading: savingEmail }] = useMutation(UPDATE_EMAIL, {
    refetchQueries: [{ query: ME_QUERY }],
  });
  const [changePassword, { loading: savingPassword }] = useMutation(CHANGE_PASSWORD);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');

  const [showEmailEdit, setShowEmailEdit] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const profile = data?.myProfile;
  const defaultAddr = profile?.defaultAddress;
  const email = (meData as { me?: { email?: string } })?.me?.email ?? '';

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? '');
      setLastName(profile.lastName ?? '');
      setPhone(profile.phone ?? profile.defaultAddress?.phone ?? '');
    }
  }, [profile?.id]);

  useEffect(() => {
    if (defaultAddr) {
      setAddress1(defaultAddr.address1 ?? '');
      setAddress2(defaultAddr.address2 ?? '');
      setCity(defaultAddr.city ?? '');
      setProvince(defaultAddr.province ?? '');
    } else {
      setAddress1('');
      setAddress2('');
      setCity('');
      setProvince('');
    }
  }, [defaultAddr?.id, defaultAddr?.address1, defaultAddr?.address2, defaultAddr?.city, defaultAddr?.province]);

  if (!localStorage.getItem(CUSTOMER_TOKEN_KEY)) {
    return <Navigate to="/login" replace />;
  }

  if (loading) return <div className="py-8 px-4 text-center">Cargando datos...</div>;
  if (error) return <div className="py-8 px-4 text-red-600">Error al cargar. Inicia sesión de nuevo.</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setSaveError('');
    try {
      const profileRes = await updateProfile({
        variables: {
          input: { firstName: firstName || undefined, lastName: lastName || undefined, phone: phone || undefined },
        },
      });
      if (profileRes.data === undefined || (profileRes.errors?.length ?? 0) > 0) {
        setSaveError(profileRes.errors?.[0]?.message ?? 'Error al guardar perfil');
        return;
      }
      if (defaultAddr) {
        const addrRes = await updateAddress({
          variables: {
            id: defaultAddr.id,
            input: {
              address1: address1.trim(),
              address2: address2.trim() || undefined,
              city: city.trim(),
              province: province.trim() || undefined,
              phone: phone.trim() || undefined,
            },
          },
        });
        if (addrRes.data === undefined || (addrRes.errors?.length ?? 0) > 0) {
          setSaveError(addrRes.errors?.[0]?.message ?? 'Error al guardar dirección');
          return;
        }
      } else if (address1.trim() || city.trim() || address2.trim() || province.trim()) {
        const createRes = await createAddress({
          variables: {
            input: {
              address1: address1.trim() || undefined,
              address2: address2.trim() || undefined,
              city: city.trim() || undefined,
              province: province.trim() || undefined,
              phone: phone.trim() || undefined,
              countryCode: 'CO',
            },
          },
        });
        if (createRes.data === undefined || (createRes.errors?.length ?? 0) > 0) {
          setSaveError(createRes.errors?.[0]?.message ?? 'Error al crear dirección');
          return;
        }
      }
      setSaved(true);
    } catch (err: unknown) {
      const apolloErr = err as { graphQLErrors?: Array<{ message?: string }>; message?: string };
      setSaveError(apolloErr?.graphQLErrors?.[0]?.message ?? apolloErr?.message ?? 'Error al guardar. Intenta de nuevo.');
    }
  };

  const handleUpdateEmail = async () => {
    setEmailError('');
    if (!newEmail.trim()) {
      setEmailError('Introduce un correo válido');
      return;
    }
    try {
      await updateEmail({
        variables: {
          input: { newEmail: newEmail.trim(), currentPassword: emailPassword },
        },
      });
      setShowEmailEdit(false);
      setNewEmail('');
      setEmailPassword('');
    } catch (err: unknown) {
      const apolloErr = err as { graphQLErrors?: Array<{ message?: string }>; message?: string };
      setEmailError(apolloErr?.graphQLErrors?.[0]?.message ?? apolloErr?.message ?? 'No se pudo actualizar el correo');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    if (newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    try {
      await changePassword({
        variables: {
          input: { currentPassword, newPassword },
        },
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(true);
    } catch (err: unknown) {
      const apolloErr = err as { graphQLErrors?: Array<{ message?: string }>; message?: string };
      setPasswordError(apolloErr?.graphQLErrors?.[0]?.message ?? apolloErr?.message ?? 'Contraseña actual incorrecta');
    }
  };

  const isSaving = saving || savingAddr || updatingAddr;

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-secondary mb-1">Nombre (opcional)</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputStyle}
              placeholder="Ej: Ronald"
            />
          </div>
          <div>
            <label className="block font-semibold text-secondary mb-1">Apellido (opcional)</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputStyle}
              placeholder="Ej: Cifuentes"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-secondary mb-1">Correo electrónico</label>
            {showEmailEdit ? (
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Nuevo correo"
                    className={inputStyle}
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    placeholder="Contraseña actual"
                    className={inputStyle}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUpdateEmail}
                  disabled={savingEmail}
                  className="px-4 py-2 rounded-xl bg-primary text-white font-semibold disabled:opacity-60"
                  style={{ background: '#f04793' }}
                >
                  {savingEmail ? 'Guardando...' : 'Actualizar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailEdit(false);
                    setNewEmail('');
                    setEmailPassword('');
                    setEmailError('');
                  }}
                  className="px-4 py-2 rounded-xl border border-border-soft text-secondary"
                >
                  Cancelar
                </button>
                {emailError && <p className="w-full text-red-600 text-sm">{emailError}</p>}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-secondary">{email || '—'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailEdit(true);
                    setNewEmail(email);
                  }}
                  className="text-primary text-sm font-semibold hover:underline"
                  style={{ color: '#f04793' }}
                >
                  Editar
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-secondary mb-1">Teléfono (opcional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputStyle}
              placeholder="Ej: 3043884321"
            />
          </div>
          <div />

          <div>
            <label className="block font-semibold text-secondary mb-1">Dirección (opcional)</label>
            <input
              type="text"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              placeholder="Calle, número, apartamento..."
              className={inputStyle}
            />
          </div>
          <div>
            <label className="block font-semibold text-secondary mb-1">Complemento (opcional)</label>
            <input
              type="text"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              placeholder="Barrio, edificio, etc."
              className={inputStyle}
            />
          </div>
          <div>
            <label className="block font-semibold text-secondary mb-1">Ciudad (opcional)</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ej: Medellín"
              className={inputStyle}
            />
          </div>
          <div>
            <label className="block font-semibold text-secondary mb-1">Departamento / Provincia (opcional)</label>
            <input
              type="text"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder="Ej: Antioquia"
              className={inputStyle}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-60"
            style={{ background: '#f04793' }}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
          {saved && <p className="text-green-600 text-sm">Datos guardados correctamente.</p>}
          {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
        </div>
      </form>

      <div className="mt-10 pt-8 border-t border-border-soft">
        <h2 className="text-lg font-semibold text-secondary mb-4">Cambiar contraseña</h2>
        <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
          <div>
            <label className="block font-semibold text-secondary mb-1">Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputStyle}
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-secondary mb-1">Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputStyle}
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-secondary mb-1">Confirmar nueva contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputStyle}
              minLength={8}
              required
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-6 py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-60"
              style={{ background: '#f04793' }}
            >
              {savingPassword ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
            {passwordSuccess && <p className="text-green-600 text-sm">Contraseña actualizada.</p>}
            {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}
