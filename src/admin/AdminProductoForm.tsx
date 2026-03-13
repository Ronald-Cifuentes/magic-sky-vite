import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminFetch } from './adminApi';

const ADMIN_PRODUCT = `
  query AdminProductById($id: String!) {
    adminProductById(id: $id) {
      id slug title descriptionHtml shortDescription published status
      vendor { id }
      category { id }
      variants { id title price compareAtPrice sku }
      images { id url altText position }
    }
  }
`;

const ADMIN_BRANDS = `query { adminBrands { id name slug } }`;
const CATEGORIES = `query { categories { id name slug } }`;

const CREATE_MUTATION = `
  mutation AdminCreateProduct($input: CreateProductInput!) {
    adminCreateProduct(input: $input) {
      id slug title
    }
  }
`;

const UPDATE_MUTATION = `
  mutation AdminUpdateProduct($id: String!, $input: UpdateProductInput!) {
    adminUpdateProduct(id: $id, input: $input) {
      id slug title
    }
  }
`;

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function AdminProductoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '',
    slug: '',
    descriptionHtml: '',
    shortDescription: '',
    vendorId: '',
    categoryId: '',
    published: false,
    status: 'draft',
    variants: [{ title: 'Default Title', price: 0, compareAtPrice: '', sku: '' }],
    images: [{ url: '', altText: '', position: 0 }],
  });
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      adminFetch(ADMIN_BRANDS).then((r) => (r.data as any)?.adminBrands ?? []),
      adminFetch(CATEGORIES).then((r) => (r.data as any)?.categories ?? []),
    ]).then(([b, c]) => {
      setBrands(b);
      setCategories(c);
    });
  }, []);

  useEffect(() => {
    if (!id) return;
    adminFetch(ADMIN_PRODUCT, { id })
      .then((res) => {
        const p = (res.data as any)?.adminProductById;
        if (!p) return setError('Producto no encontrado');
        setForm({
          title: p.title ?? '',
          slug: p.slug ?? '',
          descriptionHtml: p.descriptionHtml ?? '',
          shortDescription: p.shortDescription ?? '',
          vendorId: p.vendor?.id ?? '',
          categoryId: p.category?.id ?? '',
          published: p.published ?? false,
          status: p.status ?? 'draft',
          variants: (p.variants?.length ? p.variants : [{ id: '', title: 'Default Title', price: 0, compareAtPrice: null, sku: '' }]).map((v: any) => ({
            id: v.id,
            title: v.title ?? 'Default Title',
            price: (v.price ?? 0) / 100,
            compareAtPrice: v.compareAtPrice != null ? String(v.compareAtPrice / 100) : '',
            sku: v.sku ?? '',
          })),
          images: (p.images?.length ? p.images : [{ id: '', url: '', altText: '', position: 0 }]).map((img: any) => ({
            id: img.id,
            url: img.url ?? '',
            altText: img.altText ?? '',
            position: img.position ?? 0,
          })),
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const updateVariant = (i: number, field: string, value: any) => {
    const v = [...form.variants];
    v[i] = { ...v[i], [field]: value };
    setForm({ ...form, variants: v });
  };

  const addVariant = () => {
    setForm({ ...form, variants: [...form.variants, { title: 'Default Title', price: 0, compareAtPrice: '', sku: '' }] });
  };

  const removeVariant = (i: number) => {
    if (form.variants.length <= 1) return;
    setForm({ ...form, variants: form.variants.filter((_, j) => j !== i) });
  };

  const updateImage = (i: number, field: string, value: any) => {
    const imgs = [...form.images];
    imgs[i] = { ...imgs[i], [field]: value };
    setForm({ ...form, images: imgs });
  };

  const addImage = () => {
    setForm({ ...form, images: [...form.images, { url: '', altText: '', position: form.images.length }] });
  };

  const removeImage = (i: number) => {
    setForm({ ...form, images: form.images.filter((_, j) => j !== i) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const input = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        descriptionHtml: form.descriptionHtml.trim() || undefined,
        shortDescription: form.shortDescription.trim() || undefined,
        vendorId: form.vendorId || undefined,
        categoryId: form.categoryId || undefined,
        published: form.published,
        status: form.status,
        variants: form.variants.map((v) => ({
          title: v.title || 'Default Title',
          price: Number(v.price) || 0,
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
          sku: v.sku?.trim() || undefined,
        })),
        images: form.images.filter((img) => img.url.trim()).map((img, i) => ({
          url: img.url.trim(),
          altText: img.altText?.trim() || undefined,
          position: i,
        })),
      };
      if (isEdit) {
        await adminFetch(UPDATE_MUTATION, { id, input });
      } else {
        await adminFetch(CREATE_MUTATION, { input });
      }
      navigate('/admin/productos');
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary mb-6">
        {isEdit ? 'Editar producto' : 'Nuevo producto'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {error && <p className="text-red-600 p-3 bg-red-50 rounded">{error}</p>}
        <div>
          <label className="block font-semibold mb-1">Título *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Slug</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="Se genera del título si está vacío"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Descripción (HTML)</label>
          <textarea
            value={form.descriptionHtml}
            onChange={(e) => setForm({ ...form, descriptionHtml: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Descripción corta</label>
          <input
            type="text"
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Marca</label>
            <select
              value={form.vendorId}
              onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">— Seleccionar —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Categoría</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">— Seleccionar —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Publicado
          </label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="px-3 py-1 border rounded"
          >
            <option value="draft">Borrador</option>
            <option value="active">Activo</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">Variantes</label>
          {form.variants.map((v, i) => (
            <div key={i} className="flex gap-2 mb-2 p-3 bg-gray-50 rounded">
              <input type="text" placeholder="Título" value={v.title} onChange={(e) => updateVariant(i, 'title', e.target.value)} className="flex-1 px-3 py-1 border rounded" />
              <input type="number" placeholder="Precio" value={v.price || ''} onChange={(e) => updateVariant(i, 'price', e.target.value)} className="w-24 px-3 py-1 border rounded" />
              <input type="number" placeholder="Precio comparación" value={v.compareAtPrice} onChange={(e) => updateVariant(i, 'compareAtPrice', e.target.value)} className="w-24 px-3 py-1 border rounded" />
              <input type="text" placeholder="SKU" value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} className="w-24 px-3 py-1 border rounded" />
              <button type="button" onClick={() => removeVariant(i)} className="text-red-600 px-2">✕</button>
            </div>
          ))}
          <button type="button" onClick={addVariant} className="text-primary text-sm">+ Añadir variante</button>
        </div>

        <div>
          <label className="block font-semibold mb-2">Imágenes (URL)</label>
          {form.images.map((img, i) => (
            <div key={i} className="flex gap-2 mb-2 p-3 bg-gray-50 rounded">
              <input type="url" placeholder="URL" value={img.url} onChange={(e) => updateImage(i, 'url', e.target.value)} className="flex-1 px-3 py-1 border rounded" />
              <input type="text" placeholder="Alt" value={img.altText} onChange={(e) => updateImage(i, 'altText', e.target.value)} className="w-32 px-3 py-1 border rounded" />
              <button type="button" onClick={() => removeImage(i)} className="text-red-600 px-2">✕</button>
            </div>
          ))}
          <button type="button" onClick={addImage} className="text-primary text-sm">+ Añadir imagen</button>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" onClick={() => navigate('/admin/productos')} className="px-6 py-2 border rounded-lg">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
