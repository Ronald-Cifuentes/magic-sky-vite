import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { DEFAULT_REGISTRY, type PropSchema } from './registry';
import type { LayoutNode } from './layout-schema';

export interface HeroSlide {
  id?: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
}

interface InspectorPanelProps {
  node: LayoutNode | null;
  onPropsChange: (nodeId: string, props: Record<string, unknown>) => void;
}

function SlidesEditor({
  value,
  onChange,
}: {
  value: HeroSlide[];
  onChange: (v: HeroSlide[]) => void;
}) {
  const slides = Array.isArray(value) ? value : [];

  const updateSlide = (index: number, field: keyof HeroSlide, val: string) => {
    const next = [...slides];
    if (!next[index]) next[index] = {};
    next[index] = { ...next[index], [field]: val };
    onChange(next);
  };

  const addSlide = () => {
    onChange([...slides, { title: '', subtitle: '', imageUrl: '', linkUrl: '/catalogo' }]);
  };

  const removeSlide = (index: number) => {
    onChange(slides.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {slides.map((slide, i) => (
        <div key={i} className="p-3 border rounded-lg bg-gray-50 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600">Slide {i + 1}</span>
            <button type="button" onClick={() => removeSlide(i)} className="text-red-600 hover:bg-red-50 p-1 rounded">
              <FiTrash2 size={14} />
            </button>
          </div>
          <input
            type="text"
            className="w-full px-2 py-1.5 border rounded text-sm"
            placeholder="Título"
            value={slide.title ?? ''}
            onChange={(e) => updateSlide(i, 'title', e.target.value)}
          />
          <input
            type="text"
            className="w-full px-2 py-1.5 border rounded text-sm"
            placeholder="Subtítulo"
            value={slide.subtitle ?? ''}
            onChange={(e) => updateSlide(i, 'subtitle', e.target.value)}
          />
          <input
            type="url"
            className="w-full px-2 py-1.5 border rounded text-sm"
            placeholder="URL de imagen"
            value={slide.imageUrl ?? ''}
            onChange={(e) => updateSlide(i, 'imageUrl', e.target.value)}
          />
          <input
            type="text"
            className="w-full px-2 py-1.5 border rounded text-sm"
            placeholder="Enlace (ej: /catalogo)"
            value={slide.linkUrl ?? ''}
            onChange={(e) => updateSlide(i, 'linkUrl', e.target.value)}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addSlide}
        className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary text-sm"
      >
        <FiPlus size={16} /> Añadir slide
      </button>
    </div>
  );
}

function PropInput({
  schema,
  value,
  onChange,
}: {
  schema: PropSchema;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const type = schema.type;
  const val = value ?? '';

  if (type === 'slides') {
    return (
      <SlidesEditor
        value={(Array.isArray(val) ? val : []) as HeroSlide[]}
        onChange={(v) => onChange(v)}
      />
    );
  }

  if (type === 'number') {
    const n = Number(val) || (schema.min ?? 0);
    return (
      <input
        type="number"
        className="w-full px-3 py-2 border rounded text-sm"
        value={n}
        min={schema.min}
        max={schema.max}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || (schema.min ?? 0))}
      />
    );
  }

  if (type === 'html') {
    return (
      <textarea
        className="w-full px-3 py-2 border rounded text-sm font-mono"
        rows={6}
        value={String(val)}
        placeholder={schema.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (type === 'select' && schema.options) {
    return (
      <select
        className="w-full px-3 py-2 border rounded text-sm"
        value={String(val)}
        onChange={(e) => onChange(e.target.value)}
      >
        {schema.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type="text"
      className="w-full px-3 py-2 border rounded text-sm"
      value={String(val)}
      placeholder={schema.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function InspectorPanel({ node, onPropsChange }: InspectorPanelProps) {
  if (!node) {
    return (
      <div className="w-72 flex-shrink-0 bg-white rounded-xl border p-4 text-center text-gray-500 text-sm">
        <p>Selecciona un componente para editar sus propiedades</p>
      </div>
    );
  }

  const def = DEFAULT_REGISTRY.find((d) => d.type === node.type);
  const schema = def?.propSchema ?? [];

  if (schema.length === 0) {
    return (
      <div className="w-72 flex-shrink-0 bg-white rounded-xl border p-4">
        <h3 className="font-semibold text-secondary mb-2">{def?.label || node.type}</h3>
        <p className="text-sm text-gray-500">Este componente no tiene propiedades editables desde el CMS.</p>
        <p className="text-xs text-gray-400 mt-2">Los datos se cargan desde el backend.</p>
      </div>
    );
  }

  return (
    <div className="w-72 flex-shrink-0 bg-white rounded-xl border p-4 overflow-y-auto">
      <h3 className="font-semibold text-secondary mb-3">Propiedades</h3>
      <p className="text-xs text-gray-500 mb-3">{def?.label || node.type}</p>
      <div className="space-y-4">
        {schema.map((s) => (
          <div key={s.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{s.label}</label>
            <PropInput
              schema={s}
              value={(node.props as Record<string, unknown>)?.[s.key]}
              onChange={(v) => onPropsChange(node.id, { ...node.props, [s.key]: v })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
