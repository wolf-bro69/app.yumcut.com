import { beforeEach, describe, expect, it, vi } from 'vitest';

const getCharacterMetricsMap = vi.hoisted(() => vi.fn());
const getViewerFavoriteCreatedAtMap = vi.hoisted(() => vi.fn());
const prisma = vi.hoisted(() => ({
  characterCategory: {
    count: vi.fn(),
  },
  character: {
    findFirst: vi.fn(),
  },
}));

vi.mock('@/server/db', () => ({ prisma }));
vi.mock('@/server/character-favorites', () => ({
  getCharacterMetricsMap,
  getViewerFavoriteCreatedAtMap,
  sortByFavoriteRecencyFirst: (items: any[]) => items,
}));
vi.mock('@/server/voices', () => ({
  listPublicVoices: vi.fn(),
}));

const catalog = await import('@/server/character-catalog');

describe('character catalog profile image URLs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.characterCategory.count.mockResolvedValue(1);
    getCharacterMetricsMap.mockResolvedValue(new Map());
    getViewerFavoriteCreatedAtMap.mockResolvedValue(new Map());
  });

  it('keeps profile image URLs on the original source image, not the catalog preview variant', async () => {
    prisma.character.findFirst.mockResolvedValueOnce({
      id: 'ch-1',
      slug: 'matteo',
      name: 'Matteo',
      title: 'Matteo',
      tagline: null,
      description: 'Bio',
      bio: 'Bio',
      previewVideoUrl: null,
      previewVideoHasAudio: true,
      defaultVoiceId: null,
      defaultVoiceProvider: null,
      variations: [{
        id: 'var-1',
        imagePath: 'characters/source.webp',
        imageVariants: [{
          kind: 'catalog-preview',
          height: 896,
          status: 'ready',
          path: 'characters/variants/catalog-preview/h896/source.webp',
          url: null,
        }],
      }],
    });

    const profile = await catalog.getCharacterCatalogProfileBySlug('matteo');

    expect(profile?.previewImageUrl).toMatch(/\/api\/media\/characters\/source\.webp$/);
  });
});
