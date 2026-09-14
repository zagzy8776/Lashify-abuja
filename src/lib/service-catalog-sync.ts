import prisma from '@/src/lib/prisma';
import { SERVICE_CATALOG } from '@/src/lib/services-catalog';

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const LEGACY_ALIASES: Record<string, string[]> = {
  'classic-cat-eye': ['classic cat eye', 'classic fox eye', 'classic fox eyes'],
  'hybrid-cat-eye': ['hybrid cat eye', 'hybrid fox eye', 'hybrid fox eyes'],
  'volume-cat-eye': ['volume cat eye', 'volume fox eye', 'volume fox eyes'],
  'mega-volume-cat-eye': ['mega volume cat eye', 'mega volume fox eye', 'mega volume fox eyes'],
  'classic-set': ['classic set'],
  'hybrid-set': ['hybrid set'],
  'volume-set': ['volume set'],
  'mega-volume': ['mega volume', 'mega volume set'],
  'customize-set': ['customize set', 'customized set', 'customised set'],
  'wet-set': ['wet set'],
  'anime-set': ['anime set'],
  'classic-refill': ['classic refill'],
  'hybrid-refill': ['hybrid refill'],
  'volume-refill': ['volume refill'],
  'mega-volume-refill': ['mega volume refill'],
  'wet-set-refill': ['wet refill', 'wet set refill'],
  'anime-refill': ['anime refill'],
  'wispy-add-on': ['wispy add on', 'wispy addon'],
  'bottom-lashes': ['bottom lashes', 'bottom lash'],
  'lash-removal': ['lash removal', 'lash remover'],
};

const DEPRECATED_SLUGS = new Set(['lash-refill']);

export async function syncServiceCatalog() {
  const existing = await prisma.service.findMany({ orderBy: { created_at: 'asc' } });
  const bySlug = new Map(existing.map((service) => [service.slug, service]));
  const usedIds = new Set<string>();

  for (const item of SERVICE_CATALOG) {
    const exact = bySlug.get(item.slug);
    let canonical = exact;
    let migratedLegacy = false;

    if (!canonical) {
      const aliases = new Set([normalize(item.name), ...(LEGACY_ALIASES[item.slug] ?? []).map(normalize)]);
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
      // A legacy entry is migrated once to the new canonical identity/pricing.
      // Once it has the canonical slug, future admin edits are preserved.
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

    const aliases = new Set([normalize(item.name), ...(LEGACY_ALIASES[item.slug] ?? []).map(normalize)]);
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

  const deprecated = existing.filter((service) => DEPRECATED_SLUGS.has(service.slug) && !usedIds.has(service.id));
  if (deprecated.length) {
    await prisma.service.updateMany({
      where: { id: { in: deprecated.map((service) => service.id) } },
      data: { is_active: false },
    });
  }
}
