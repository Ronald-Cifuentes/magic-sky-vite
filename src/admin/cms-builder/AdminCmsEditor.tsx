import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { adminFetch } from '../adminApi';
import { CMS_BY_ROUTE } from '../../graphql/cms-queries';
import { DEFAULT_REGISTRY, canDropInZone } from './registry';
import { validateLayout, DEFAULT_LAYOUT, type LayoutJson, type LayoutNode } from './layout-schema';
import { InspectorPanel } from './InspectorPanel';

const HERO_QUERY = gql`query HeroContent { heroContent { id title subtitle imageUrl linkUrl } }`;

const PAGE_QUERY = `
  query AdminCmsPageById($id: String!) {
    adminCmsPageById(id: $id) {
      id title slug routePath pageKind systemKey published deletable layoutJson
    }
  }
`;

const UPDATE_MUTATION = `
  mutation AdminUpdateCmsPage($id: String!, $input: UpdateCmsPageInput!) {
    adminUpdateCmsPage(id: $id, input: $input) {
      id
    }
  }
`;

const PAGE_PROVIDES: Record<string, { data: string[]; context: string[] }> = {
  HOME: { data: ['heroContent', 'featuredProducts', 'collections', 'announcementBar'], context: [] },
  CATALOG: { data: ['productSearch', 'filterOptions', 'announcementBar'], context: [] },
  CART: { data: ['announcementBar'], context: ['cart'] },
  CMS_GENERIC: { data: ['cmsPageBySlug', 'announcementBar'], context: [] },
};

function SortableNode({
  node,
  isSelected,
  onSelect,
  onRemove,
}: {
  node: LayoutNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const def = DEFAULT_REGISTRY.find((d) => d.type === node.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(node.id)}
      className={`p-3 mb-2 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'border-gray-200 bg-white hover:border-gray-300'} ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div {...attributes} {...listeners} className="cursor-grab font-medium text-secondary" onClick={(e) => e.stopPropagation()}>
          {def?.label || node.type}
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(node.id); }}
          className="text-red-600 text-sm hover:underline"
        >
          Quitar
        </button>
      </div>
      {def?.propSchema && def.propSchema.length > 0 && (
        <p className="mt-1 text-xs text-gray-500">Haz clic para editar en el panel derecho</p>
      )}
    </div>
  );
}

export function AdminCmsEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apolloClient = useApolloClient();
  const isNew = id === 'nuevo';
  const [page, setPage] = useState<any>(null);
  const [layout, setLayout] = useState<LayoutJson>(DEFAULT_LAYOUT);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [dropError, setDropError] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const systemKey = page?.systemKey ?? null;
  const provides = systemKey ? PAGE_PROVIDES[systemKey] ?? { data: [], context: [] } : { data: [], context: [] };

  const heroSyncedRef = useRef(false);

  useEffect(() => {
    if (isNew) {
      setPage({ id: null, title: '', slug: '', routePath: '', pageKind: 'CUSTOM', systemKey: null, layoutJson: DEFAULT_LAYOUT });
      setLayout(DEFAULT_LAYOUT);
      heroSyncedRef.current = false;
      return;
    }
    heroSyncedRef.current = false;
    adminFetch(PAGE_QUERY, { id })
      .then((res) => {
        const p = (res.data as any)?.adminCmsPageById;
        if (!p) setError('Página no encontrada');
        else {
          setPage(p);
          const parsed = typeof p.layoutJson === 'string' ? JSON.parse(p.layoutJson) : p.layoutJson;
          setLayout(parsed?.root ? parsed : DEFAULT_LAYOUT);
        }
      })
      .catch((e) => setError(e.message));
  }, [id, isNew]);

  const { data: heroData } = useQuery(HERO_QUERY, { errorPolicy: 'ignore' });

  useEffect(() => {
    if (heroSyncedRef.current || !heroData?.heroContent?.length) return;
    const slides = heroData.heroContent.map((s: { id: string; title?: string; subtitle?: string; imageUrl?: string; linkUrl?: string }) => ({
      id: s.id,
      title: s.title ?? '',
      subtitle: s.subtitle ?? '',
      imageUrl: s.imageUrl ?? '',
      linkUrl: s.linkUrl ?? '/catalogo',
    }));
    setLayout((prev) => {
      if (!prev?.root) return prev;
      const heroNode = prev.root.find((n) => n.type === 'HeroSection' && !('slides' in (n.props || {})));
      if (!heroNode) return prev;
      heroSyncedRef.current = true;
      return {
        ...prev,
        root: prev.root.map((n) =>
          n.id === heroNode.id ? { ...n, props: { ...(n.props || {}), slides } } : n
        ),
      };
    });
  }, [heroData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLayout((prev) => {
      const oldIndex = prev.root.findIndex((n) => n.id === active.id);
      const newIndex = prev.root.findIndex((n) => n.id === over.id);
      if (oldIndex >= 0 && newIndex >= 0) {
        return { ...prev, root: arrayMove(prev.root, oldIndex, newIndex) };
      }
      return prev;
    });
  };

  const addComponent = (type: string) => {
    setDropError('');
    const check = canDropInZone(type, 'main', provides);
    if (!check.ok) {
      setDropError(check.reason || 'No se puede agregar');
      return;
    }
    const def = DEFAULT_REGISTRY.find((d) => d.type === type);
    const node: LayoutNode = {
      id: `node_${Date.now()}`,
      type,
      props: def?.defaultProps ?? {},
      zone: 'main',
      children: [],
    };
    setLayout((prev) => ({ ...prev, root: [...prev.root, node] }));
    setSelectedNodeId(node.id);
  };

  const updateProps = (nodeId: string, props: Record<string, unknown>) => {
    setLayout((prev) => ({
      ...prev,
      root: prev.root.map((n) => (n.id === nodeId ? { ...n, props } : n)),
    }));
  };

  const removeNode = (nodeId: string) => {
    setLayout((prev) => ({ ...prev, root: prev.root.filter((n) => n.id !== nodeId) }));
  };

  const normalizeLayoutForSave = (l: LayoutJson): LayoutJson => {
    if (!l?.root) return l;
    return {
      ...l,
      root: l.root.map((n) => {
        if (n.type !== 'HeroSection') return n;
        const props = n.props || {};
        const slides = Array.isArray(props.slides) ? props.slides : [];
        return { ...n, props: { ...props, slides } };
      }),
    };
  };

  const handleSave = async () => {
    setError('');
    setSaveSuccess(false);
    const normalizedLayout = normalizeLayoutForSave(layout);
    const validation = validateLayout(normalizedLayout);
    if (!validation.success) {
      setError(validation.error);
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const slug = (page?.slug || 'nueva-pagina').replace(/^\//, '').replace(/[^a-z0-9-]/gi, '-') || 'nueva-pagina';
        const routePath = slug.startsWith('/') ? slug : '/' + slug;
        await adminFetch(
          `mutation AdminCreateCmsPage($input: CreateCmsPageInput!) {
          adminCreateCmsPage(input: $input) { id }
        }`,
          {
            input: {
              title: page?.title || 'Nueva página',
              slug,
              routePath,
              pageKind: 'CUSTOM',
              layoutJson: normalizedLayout,
            },
          },
        );
        navigate('/admin/cms');
      } else {
        await adminFetch(UPDATE_MUTATION, { id, input: { layoutJson: normalizedLayout } });
        const routePath = page?.routePath;
        if (routePath) {
          await apolloClient.query({
            query: CMS_BY_ROUTE,
            variables: { routePath },
            fetchPolicy: 'network-only',
          });
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e: any) {
      setError(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (!page && !isNew) return <p className="text-gray-500">Cargando...</p>;

  const selectedNode = selectedNodeId ? layout.root.find((n) => n.id === selectedNodeId) ?? null : null;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="w-56 flex-shrink-0 bg-white rounded-xl border p-4 overflow-y-auto">
        <h3 className="font-semibold text-secondary mb-3">Componentes</h3>
        <div className="space-y-1">
          {DEFAULT_REGISTRY.map((def) => {
            const check = canDropInZone(def.type, 'main', provides);
            return (
              <button
                key={def.type}
                type="button"
                onClick={() => addComponent(def.type)}
                disabled={!check.ok}
                className={`w-full text-left px-3 py-2 rounded text-sm ${check.ok ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                title={check.ok ? def.label : check.reason}
              >
                {def.label}
              </button>
            );
          })}
        </div>
        {dropError && <p className="mt-2 text-xs text-red-600">{dropError}</p>}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            {isNew && (
              <div className="flex gap-4 mb-2">
                <input
                  type="text"
                  placeholder="Título"
                  value={page?.title ?? ''}
                  onChange={(e) => setPage({ ...page, title: e.target.value })}
                  className="px-3 py-1 border rounded"
                />
                <input
                  type="text"
                  placeholder="Slug (ej: mi-pagina)"
                  value={page?.slug ?? ''}
                  onChange={(e) => setPage({ ...page, slug: e.target.value, routePath: '/' + e.target.value.replace(/^\//, '') })}
                  className="px-3 py-1 border rounded"
                />
              </div>
            )}
            <h2 className="text-xl font-bold text-secondary">{isNew ? 'Nueva página' : `Editar: ${page?.title}`}</h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(`/admin/cms/${id}/preview`)}
              className="px-4 py-2 border rounded-lg"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        {saveSuccess && <p className="text-green-600 mb-2">Guardado correctamente. Los cambios ya están visibles en la tienda.</p>}

        <div className="flex-1 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-6 overflow-y-auto">
          <p className="text-sm text-gray-500 mb-3">Canvas - Arrastra para reordenar</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={layout.root.map((n) => n.id)} strategy={verticalListSortingStrategy}>
              {layout.root.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Añade componentes desde el panel izquierdo</p>
              ) : (
                layout.root.map((node) => (
                  <SortableNode
                    key={node.id}
                    node={node}
                    isSelected={selectedNodeId === node.id}
                    onSelect={setSelectedNodeId}
                    onRemove={(id) => { removeNode(id); if (selectedNodeId === id) setSelectedNodeId(null); }}
                  />
                ))
              )}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      <InspectorPanel node={selectedNode} onPropsChange={updateProps} />
    </div>
  );
}
