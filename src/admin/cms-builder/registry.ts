export type PropSchemaType = 'text' | 'number' | 'html' | 'url' | 'select' | 'slides' | 'messages';

export interface PropSchema {
  key: string;
  label: string;
  type: PropSchemaType;
  placeholder?: string;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
}

export interface ComponentDef {
  type: string;
  version: number;
  label: string;
  category: string;
  icon?: string;
  defaultProps: Record<string, unknown>;
  propSchema: PropSchema[];
  allowedZones: string[];
  requiredData: string[];
  requiredContext: string[];
  canHaveChildren: boolean;
  childZones: string[];
}

export const DEFAULT_REGISTRY: ComponentDef[] = [
  { type: 'HeroSection', version: 1, label: 'Hero / Slider', category: 'Marketing', defaultProps: { slides: [] }, propSchema: [{ key: 'slides', label: 'Slides del slider', type: 'slides' }], allowedZones: ['main'], requiredData: ['heroContent'], requiredContext: [], canHaveChildren: false, childZones: [] },
  { type: 'FeaturedProducts', version: 1, label: 'Productos destacados', category: 'Catálogo', defaultProps: { limit: 12 }, propSchema: [{ key: 'limit', label: 'Cantidad', type: 'number', min: 1, max: 48 }], allowedZones: ['main'], requiredData: ['featuredProducts'], requiredContext: [], canHaveChildren: false, childZones: [] },
  { type: 'ProductGrid', version: 1, label: 'Grid de productos', category: 'Catálogo', defaultProps: {}, propSchema: [{ key: 'title', label: 'Título', type: 'text', placeholder: 'Catálogo' }], allowedZones: ['main'], requiredData: ['productSearch'], requiredContext: [], canHaveChildren: false, childZones: [] },
  { type: 'CartContent', version: 1, label: 'Contenido del carrito', category: 'Carrito', defaultProps: {}, propSchema: [], allowedZones: ['main'], requiredData: [], requiredContext: ['cart'], canHaveChildren: false, childZones: [] },
  { type: 'HtmlContent', version: 1, label: 'Contenido HTML', category: 'Contenido', defaultProps: { html: '' }, propSchema: [{ key: 'html', label: 'Contenido HTML', type: 'html', placeholder: '<p>Tu contenido...</p>' }], allowedZones: ['main'], requiredData: [], requiredContext: [], canHaveChildren: false, childZones: [] },
  { type: 'CollectionsGrid', version: 1, label: 'Grid de colecciones', category: 'Catálogo', defaultProps: {}, propSchema: [{ key: 'title', label: 'Título', type: 'text', placeholder: 'Colecciones' }], allowedZones: ['main'], requiredData: ['collections'], requiredContext: [], canHaveChildren: false, childZones: [] },
  { type: 'AnnouncementBar', version: 1, label: 'Barra de anuncios', category: 'Marketing', defaultProps: { messages: [{ text: 'EL NÚMERO DE GUÍA SE ENVÍA POR WHATSAPP O CORREO.', linkUrl: '' }] }, propSchema: [{ key: 'messages', label: 'Mensajes', type: 'messages' }], allowedZones: ['main', 'header'], requiredData: ['announcementBar'], requiredContext: [], canHaveChildren: false, childZones: [] },
];

export function getDef(type: string): ComponentDef | undefined {
  return DEFAULT_REGISTRY.find((d) => d.type === type);
}

export function canDropInZone(compType: string, zone: string, pageProvides: { data: string[]; context: string[] }): { ok: boolean; reason?: string } {
  const def = getDef(compType);
  if (!def) return { ok: false, reason: `Componente desconocido: ${compType}` };
  if (!def.allowedZones.includes(zone)) {
    return { ok: false, reason: `No se puede ubicar el componente '${def.label}' en la zona '${zone}'. Zonas permitidas: ${def.allowedZones.join(', ')}.` };
  }
  const missingData = def.requiredData.filter((d) => !pageProvides.data.includes(d));
  const missingContext = def.requiredContext.filter((c) => !pageProvides.context.includes(c));
  if (missingData.length || missingContext.length) {
    const missing = [...missingData.map((d) => `datos:${d}`), ...missingContext.map((c) => `contexto:${c}`)];
    return { ok: false, reason: `No se puede ubicar el componente '${def.label}' en la zona '${zone}'. Falta: ${missing.join(', ')}.` };
  }
  return { ok: true };
}
