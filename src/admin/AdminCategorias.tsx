import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { adminFetch } from './adminApi';

const ADMIN_CATEGORIES = `
  query AdminCategories {
    adminCategories {
      id
      name
      slug
      description
      sortOrder
    }
  }
`;

const CREATE_MUTATION = `
  mutation AdminCreateCategory($input: CreateCategoryInput!) {
    adminCreateCategory(input: $input) {
      id
      name
      slug
    }
  }
`;

const UPDATE_MUTATION = `
  mutation AdminUpdateCategory($id: String!, $input: UpdateCategoryInput!) {
    adminUpdateCategory(id: $id, input: $input) {
      id
      name
      slug
    }
  }
`;

const DELETE_MUTATION = `
  mutation AdminDeleteCategory($id: String!) {
    adminDeleteCategory(id: $id)
  }
`;

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function AdminCategorias() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });

  const load = () => {
    adminFetch(ADMIN_CATEGORIES)
      .then((res) => {
        if (res.errors) setError(res.errors[0]?.message || 'Error');
        else setCategories((res.data as { adminCategories?: any[] })?.adminCategories ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await adminFetch(CREATE_MUTATION, {
        input: {
          name: form.name.trim(),
          slug: form.slug.trim() || slugify(form.name),
          description: form.description.trim() || null,
        },
      });
      setForm({ name: '', slug: '', description: '' });
      setShowForm(false);
      load();
    } catch (e: any) {
      alert(e.message || 'Error al crear');
    }
  };

  const handleUpdate = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await adminFetch(UPDATE_MUTATION, {
        id,
        input: {
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          description: form.description.trim() || null,
        },
      });
      setEditingId(null);
      setForm({ name: '', slug: '', description: '' });
      load();
    } catch (e: any) {
      alert(e.message || 'Error al actualizar');
    }
  };

  const handleDelete = async (c: any) => {
    if (!confirm(`¿Eliminar categoría "${c.name}"?`)) return;
    try {
      await adminFetch(DELETE_MUTATION, { id: c.id });
      load();
    } catch (e: any) {
      alert(e.message || 'Error al eliminar');
    }
  };

  const startEdit = (c: any) => {
    setEditingId(c.id);
    setForm({ name: c.name, slug: c.slug, description: c.description || '' });
  };

  if (loading) return <p className="text-gray-500">Cargando categorías...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Categorías</h1>
          <p className="text-sm text-gray-500 mt-1">
            Las categorías se muestran en el navbar y filtran el catálogo.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', slug: '', description: '' }); }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium flex items-center gap-2"
        >
          <FiPlus size={18} /> Crear categoría
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-4 bg-white rounded-xl border border-border-soft">
          <h3 className="font-semibold mb-3">Nueva categoría</h3>
          <div className="grid gap-3 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })}
                placeholder="Ej: Maquillaje"
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Slug (URL)</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="maquillaje"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Descripción (opcional)</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg font-medium">
                Crear
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden border border-border-soft">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                {editingId === c.id ? (
                  <td colSpan={3} className="px-4 py-3">
                    <form onSubmit={(e) => handleUpdate(e, c.id)} className="flex gap-3 items-end">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="px-3 py-2 border rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Slug</label>
                        <input
                          type="text"
                          value={form.slug}
                          onChange={(e) => setForm({ ...form, slug: e.target.value })}
                          className="px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <button type="submit" className="px-3 py-2 bg-primary text-white rounded-lg text-sm">
                        Guardar
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="px-3 py-2 border rounded-lg text-sm">
                        Cancelar
                      </button>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium text-secondary">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(c)}
                          title="Editar"
                          className="text-primary hover:text-primary-hover p-1.5 rounded hover:bg-primary/10"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        {c.slug !== 'uncategorized' && (
                          <button
                            onClick={() => handleDelete(c)}
                            title="Eliminar"
                            className="text-red-600 hover:text-red-700 p-1.5 rounded hover:bg-red-50"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
