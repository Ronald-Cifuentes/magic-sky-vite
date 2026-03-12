import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CheckoutPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    return navigate('/checkout/complete');
  };

  return (
    <div className="py-8 px-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-secondary mb-6">Checkout</h1>
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
          <label className="block font-semibold text-secondary mb-1">Dirección</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-xl border border-border-soft bg-white"
          />
        </div>
        <div>
          <label className="block font-semibold text-secondary mb-1">Ciudad</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
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
          className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary-hover"
        >
          Continuar a pago
        </button>
      </form>
    </div>
  );
}
