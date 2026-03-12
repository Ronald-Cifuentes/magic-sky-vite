import { z } from 'zod';

export const LayoutNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.unknown()).default({}),
  zone: z.string(),
  children: z.array(z.any()).default([]),
});

export const LayoutJsonSchema = z.object({
  pageVersion: z.literal(1),
  root: z.array(LayoutNodeSchema),
});

export type LayoutNode = z.infer<typeof LayoutNodeSchema>;
export type LayoutJson = z.infer<typeof LayoutJsonSchema>;

export const DEFAULT_LAYOUT: LayoutJson = {
  pageVersion: 1,
  root: [],
};

export function validateLayout(json: unknown): { success: true; data: LayoutJson } | { success: false; error: string } {
  const result = LayoutJsonSchema.safeParse(json);
  if (result.success) return { success: true, data: result.data };
  const msg = result.error.errors.map((e) => e.message).join('; ');
  return { success: false, error: msg };
}
