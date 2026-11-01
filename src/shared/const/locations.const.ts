import { LocationSeedEntry } from '@/features/locations/types/location.types';

export const LOCATION_LEVELS = ['region', 'municipality', 'neighborhood'] as const;

// Seed data for the `locations` collection (PRODUCT §6). Centroids are [lng, lat] (GeoJSON order) and
// approximate — they only drive the fallback resolver until OSM boundary polygons are imported.
// Neighborhood → district assignments are starter data: verify against OSM boundaries before launch.
export const LOCATION_SEED: LocationSeedEntry[] = [
  // Regions, autonomous republics and Tbilisi
  { slug: 'tbilisi', level: 'region', nameEn: 'Tbilisi', nameKa: 'თბილისი', centroid: [44.8271, 41.7151] },
  { slug: 'adjara', level: 'region', nameEn: 'Adjara', nameKa: 'აჭარა', centroid: [42.05, 41.6] },
  { slug: 'abkhazia', level: 'region', nameEn: 'Abkhazia', nameKa: 'აფხაზეთი', centroid: [41.1, 43.0], reportingDisabled: true },
  { slug: 'guria', level: 'region', nameEn: 'Guria', nameKa: 'გურია', centroid: [42.05, 41.95] },
  { slug: 'imereti', level: 'region', nameEn: 'Imereti', nameKa: 'იმერეთი', centroid: [42.95, 42.15] },
  { slug: 'kakheti', level: 'region', nameEn: 'Kakheti', nameKa: 'კახეთი', centroid: [45.7, 41.65] },
  { slug: 'kvemo-kartli', level: 'region', nameEn: 'Kvemo Kartli', nameKa: 'ქვემო ქართლი', centroid: [44.5, 41.45] },
  { slug: 'mtskheta-mtianeti', level: 'region', nameEn: 'Mtskheta-Mtianeti', nameKa: 'მცხეთა-მთიანეთი', centroid: [44.75, 42.3] },
  { slug: 'racha-lechkhumi', level: 'region', nameEn: 'Racha-Lechkhumi and Kvemo Svaneti', nameKa: 'რაჭა-ლეჩხუმი და ქვემო სვანეთი', centroid: [43.1, 42.6] },
  { slug: 'samegrelo-zemo-svaneti', level: 'region', nameEn: 'Samegrelo-Zemo Svaneti', nameKa: 'სამეგრელო-ზემო სვანეთი', centroid: [42.2, 42.6] },
  { slug: 'samtskhe-javakheti', level: 'region', nameEn: 'Samtskhe-Javakheti', nameKa: 'სამცხე-ჯავახეთი', centroid: [43.4, 41.5] },
  { slug: 'shida-kartli', level: 'region', nameEn: 'Shida Kartli', nameKa: 'შიდა ქართლი', centroid: [44.0, 42.1] },

  // Tbilisi districts
  { slug: 'tbilisi-mtatsminda', level: 'municipality', parentSlug: 'tbilisi', nameEn: 'Mtatsminda', nameKa: 'მთაწმინდა', centroid: [44.79, 41.693] },
  { slug: 'tbilisi-vake', level: 'municipality', parentSlug: 'tbilisi', nameEn: 'Vake', nameKa: 'ვაკე', centroid: [44.75, 41.71] },
  { slug: 'tbilisi-saburtalo', level: 'municipality', parentSlug: 'tbilisi', nameEn: 'Saburtalo', nameKa: 'საბურთალო', centroid: [44.745, 41.735] },
  { slug: 'tbilisi-krtsanisi', level: 'municipality', parentSlug: 'tbilisi', nameEn: 'Krtsanisi', nameKa: 'კრწანისი', centroid: [44.825, 41.665] },
  { slug: 'tbilisi-isani', level: 'municipality', parentSlug: 'tbilisi', nameEn: 'Isani', nameKa: 'ისანი', centroid: [44.837, 41.694] },
  { slug: 'tbilisi-samgori', level: 'municipality', parentSlug: 'tbilisi', nameEn: 'Samgori', nameKa: 'სამგორი', centroid: [44.872, 41.7] },
  { slug: 'tbilisi-chughureti', level: 'municipality', parentSlug: 'tbilisi', nameEn: 'Chughureti', nameKa: 'ჩუღურეთი', centroid: [44.81, 41.715] },
  { slug: 'tbilisi-didube', level: 'municipality', parentSlug: 'tbilisi', nameEn: 'Didube', nameKa: 'დიდუბე', centroid: [44.78, 41.746] },
  { slug: 'tbilisi-nadzaladevi', level: 'municipality', parentSlug: 'tbilisi', nameEn: 'Nadzaladevi', nameKa: 'ნაძალადევი', centroid: [44.792, 41.76] },
  { slug: 'tbilisi-gldani', level: 'municipality', parentSlug: 'tbilisi', nameEn: 'Gldani', nameKa: 'გლდანი', centroid: [44.815, 41.793] },

  // Major city municipalities outside Tbilisi (neighborhoods added on demand)
  { slug: 'batumi', level: 'municipality', parentSlug: 'adjara', nameEn: 'Batumi', nameKa: 'ბათუმი', centroid: [41.6367, 41.6168] },
  { slug: 'kutaisi', level: 'municipality', parentSlug: 'imereti', nameEn: 'Kutaisi', nameKa: 'ქუთაისი', centroid: [42.6946, 42.2679] },
  { slug: 'rustavi', level: 'municipality', parentSlug: 'kvemo-kartli', nameEn: 'Rustavi', nameKa: 'რუსთავი', centroid: [44.993, 41.5495] },
  { slug: 'zugdidi', level: 'municipality', parentSlug: 'samegrelo-zemo-svaneti', nameEn: 'Zugdidi', nameKa: 'ზუგდიდი', centroid: [41.8709, 42.5088] },
  { slug: 'gori', level: 'municipality', parentSlug: 'shida-kartli', nameEn: 'Gori', nameKa: 'გორი', centroid: [44.1158, 41.9842] },
  { slug: 'telavi', level: 'municipality', parentSlug: 'kakheti', nameEn: 'Telavi', nameKa: 'თელავი', centroid: [45.4731, 41.9198] },

  // Starter Tbilisi neighborhoods
  {
    slug: 'tbilisi-saburtalo-dighomi-massive', level: 'neighborhood', parentSlug: 'tbilisi-saburtalo',
    nameEn: 'Dighomi Massive', nameKa: 'დიღმის მასივი', centroid: [44.765, 41.762],
  },
  {
    slug: 'tbilisi-saburtalo-vazha-pshavela', level: 'neighborhood', parentSlug: 'tbilisi-saburtalo',
    nameEn: 'Vazha-Pshavela', nameKa: 'ვაჟა-ფშაველა', centroid: [44.7395, 41.7255],
  },
  {
    slug: 'tbilisi-saburtalo-nutsubidze-plateau', level: 'neighborhood', parentSlug: 'tbilisi-saburtalo',
    nameEn: 'Nutsubidze Plateau', nameKa: 'ნუცუბიძის პლატო', centroid: [44.724, 41.73],
  },
  { slug: 'tbilisi-vake-vake', level: 'neighborhood', parentSlug: 'tbilisi-vake', nameEn: 'Vake', nameKa: 'ვაკე', centroid: [44.756, 41.7105] },
  { slug: 'tbilisi-vake-bagebi', level: 'neighborhood', parentSlug: 'tbilisi-vake', nameEn: 'Bagebi', nameKa: 'ბაგები', centroid: [44.733, 41.702] },
  {
    slug: 'tbilisi-mtatsminda-sololaki', level: 'neighborhood', parentSlug: 'tbilisi-mtatsminda',
    nameEn: 'Sololaki', nameKa: 'სოლოლაკი', centroid: [44.798, 41.69],
  },
  {
    slug: 'tbilisi-krtsanisi-ortachala', level: 'neighborhood', parentSlug: 'tbilisi-krtsanisi',
    nameEn: 'Ortachala', nameKa: 'ორთაჭალა', centroid: [44.82, 41.68],
  },
  {
    slug: 'tbilisi-samgori-varketili', level: 'neighborhood', parentSlug: 'tbilisi-samgori',
    nameEn: 'Varketili', nameKa: 'ვარკეთილი', centroid: [44.888, 41.696],
  },
  { slug: 'tbilisi-gldani-gldani', level: 'neighborhood', parentSlug: 'tbilisi-gldani', nameEn: 'Gldani', nameKa: 'გლდანი', centroid: [44.818, 41.798] },
];
