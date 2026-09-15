import prisma from '@/src/lib/prisma';
import { SERVICE_CATALOG } from '@/src/lib/services-catalog';

/**
 * Normalize service identity so old database records such as
 * "Classic sets", "classic-set", and "Classic Set" resolve to one service.
 * This is deliberately identity-focused; it does not change the displayed name.
 */
const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\bsets\b/g, 'set')
    .replace(/\beyes\b/g, 'eye')
    .replace(/\baddons\b/g, 'add on')
    .replace(/\s+/g, ' ')
    .trim();

const LEGACY_ALIASES: Record<string, string[]> = {
  'classic-cat-eye': ['classic cat eye', 'classic fox eye', 'classic fox eyes'],
  'hybrid-cat-eye': ['hybrid cat eye', 'hybrid fox eye', 'hybrid fox eyes'],
  'volume-cat-eye': ['volume cat eye', 'volume fox eye', 'volume fox eyes'],
  'mega-volume-cat-eye': ['mega volume cat eye', 'mega volume fox eye', 'mega volume fox eyes'],
  'classic-set': ['classic set', 'classic sets'],
  'hybrid-set': ['hybrid set', 'hybrid sets'],
  'volume-set': ['volume set', 'volume sets'],
  'mega-volume': ['mega volume', 'mega volume set', 'mega volume sets'],
  'customize-set': ['customize set', 'customize sets', 'customized set', 'customized sets', 'customised set', 'customised sets'],
  'wet-set': ['wet set', 'wet sets'],
  'anime-set': ['anime set', 'anime sets'],
  'classic-refill': ['classic refill', 'classic refills'],
  'hybrid-refill': ['hybrid refill', 'hybrid refills'],
  'volume-refill': ['volume refill', 'volume refills'],
  'mega-volume-refill': ['mega volume refill', 'mega volume refills'],
  'wet-set-refill': ['wet refill', 'wet set refill', 'wet refills', 'wet set refills'],
  'anime-refill': ['anime refill', 'anime refills'],
  'wispy-add-on': ['wispy add on', 'wispy addon', 'wispy add ons'],
  'bottom-lashes': ['bottom lashes', 'bottom lash'],
  'lash-removal': ['lash removal', 'lash remover'],
};

// These records existed in the old catalog but are no longer customer-facing.
// They must be disabled explicitly so they cannot reappear as stale duplicates.
const LEGACY_ONLY_ALIASES = [
  'customize set',
  'customize sets',
  'customized set',
  'customized sets',
  'customised set',
  'customised sets',
];

const DEPRECATED_SLUGS = new Set(['lash-refill']);

export async function syncServiceCatalog() {
  const existing = await prisma.service.findMany({ orderBy: { created_at: 'asc' } });
  const bySlug = new Map(existing.map((service) => [service.slug, service]));
  const usedIds = new Set<string>();

  for (const item of SERVICE_CATALOG) {
    const exact = bySlug.get(item.slug);
    let canonical = exact;
    let migratedLegacy = false;

    const aliases = new Set([
      normalize(item.name),
      ...(LEGACY_ALIASES[item.slug] ?? []).map(normalize),
    ]);

    if (!canonical) {
      canonical = existing.find((service) => {
        if (usedIds.has(service.id)) return false;
        return aliases.has(normalize(service.name)) || aliases.has(normalize(service.slug));
      });
      migratedLegacy = Boolean(canonical);
    }

    if (!canonical) {
      canonical = await prisma.service.create({
        data: {
          name: item.name,
          slug: item.slug,
          description: item.description,
          price: item.price,
          duration_minutes: item.duration_minutes,
          duration_text: item.duration_text ?? null,
          category: item.category,
          sort_order: item.sort_order,
          is_active: true,
        },
      });
    } else if (migratedLegacy) {
      // Only legacy records are rewritten to the canonical catalog values.
      // Once the canonical slug exists, future admin edits are preserved.
      canonical = await prisma.service.update({
        where: { id: canonical.id },
        data: {
          name: item.name,
          slug: item.slug,
          description: item.description,
          price: item.price,
          duration_minutes: item.duration_minutes,
          duration_text: item.duration_text ?? null,
          category: item.category,
          sort_order: item.sort_order,
          is_active: true,
        },
      });
    }

    usedIds.add(canonical.id);

    // Disable every active duplicate of this canonical service, including
    // pluralized names and old Fox Eye terminology. We deactivate rather than
    // delete so existing appointment/history references remain intact.
    const duplicates = existing.filter((service) => {
      if (service.id === canonical!.id || usedIds.has(service.id)) return false;
      if (service.slug === item.slug) return true;
      return aliases.has(normalize(service.name)) || aliases.has(normalize(service.slug));
    });

    if (duplicates.length) {
      await prisma.service.updateMany({
        where: { id: { in: duplicates.map((service) => service.id) } },
        data: { is_active: false },
      });
      duplicates.forEach((service) => usedIds.add(service.id));
    }
  }

  // Remove old Customize Set records from the active customer catalog.
  // Customize Set is intentionally not part of the current canonical catalog.
  const legacyOnly = existing.filter((service) => {
    if (usedIds.has(service.id)) return false;
    const normalizedName = normalize(service.name);
    const normalizedSlug = normalize(service.slug);
    return LEGACY_ONLY_ALIASES.some((alias) => {
      const normalizedAlias = normalize(alias);
      return normalizedName === normalizedAlias || normalizedSlug === normalizedAlias;
    });
  });

  if (legacyOnly.length) {
    await prisma.service.updateMany({
      where: { id: { in: legacyOnly.map((service) => service.id) } },
      data: { is_active: false },
    });
    legacyOnly.forEach((service) => usedIds.add(service.id));
  }

  const deprecated = existing.filter(
    (service) => DEPRECATED_SLUGS.has(service.slug) && !usedIds.has(service.id),
  );

  if (deprecated.length) {
    await prisma.service.updateMany({
      where: { id: { in: deprecated.map((service) => service.id) } },
      data: { is_active: false },
    });
  }
}
