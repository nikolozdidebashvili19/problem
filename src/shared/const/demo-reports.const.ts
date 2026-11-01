// Development-only sample reports so the feed can be previewed before report creation (T-013/T-016) lands.
// Seeded via POST /api/admin/seed { targets: ['demo-reports'] }; refused in production.
type DemoReport = {
  key: string;
  title: string;
  description: string;
  categorySlug: string;
  location: { region: string; municipality?: string; neighborhood?: string };
  centroid: [number, number];
  status: 'reported' | 'acknowledged' | 'in_progress' | 'fix_pending' | 'fixed';
  upvoteCount: number;
  hoursAgo: number;
  fixedHoursAgo?: number;
};

export const DEMO_REPORTS: DemoReport[] = [
  {
    key: 'demo-1',
    title: 'Deep pothole at the Dighomi Massive bus stop',
    description:
      'A pothole about 40 cm wide has opened right where buses pull in. Cars swerve into the oncoming lane ' +
      'to avoid it, and after rain it fills with water so you cannot see how deep it is.',
    categorySlug: 'roads',
    location: { region: 'tbilisi', municipality: 'tbilisi-saburtalo', neighborhood: 'tbilisi-saburtalo-dighomi-massive' },
    centroid: [44.7652, 41.7618],
    status: 'reported',
    upvoteCount: 48,
    hoursAgo: 5,
  },
  {
    key: 'demo-2',
    title: 'Streetlights out along Vazha-Pshavela Avenue',
    description:
      'Four streetlights in a row have been dark for over a week between the metro station and the university. The sidewalk is completely dark after 8 pm.',
    categorySlug: 'lighting',
    location: { region: 'tbilisi', municipality: 'tbilisi-saburtalo', neighborhood: 'tbilisi-saburtalo-vazha-pshavela' },
    centroid: [44.7398, 41.7259],
    status: 'acknowledged',
    upvoteCount: 31,
    hoursAgo: 30,
  },
  {
    key: 'demo-3',
    title: 'ნაგვის ურნები ივსება და არ იცლება ვაკეში',
    description:
      'ჭავჭავაძის გამზირის მიმდებარე ეზოში ნაგვის კონტეინერები უკვე სამი დღეა არ დაცლილა. ნაგავი ტროტუარზე იყრება და ძაღლები აბნევენ.',
    categorySlug: 'garbage',
    location: { region: 'tbilisi', municipality: 'tbilisi-vake', neighborhood: 'tbilisi-vake-vake' },
    centroid: [44.7562, 41.7102],
    status: 'in_progress',
    upvoteCount: 22,
    hoursAgo: 52,
  },
  {
    key: 'demo-4',
    title: 'Broken playground swing in Bagebi yard',
    description:
      'The chain on one of the swings snapped and the seat hangs at an angle. Kids still try to use it. The rest of the playground is fine.',
    categorySlug: 'playgrounds',
    location: { region: 'tbilisi', municipality: 'tbilisi-vake', neighborhood: 'tbilisi-vake-bagebi' },
    centroid: [44.7334, 41.7018],
    status: 'reported',
    upvoteCount: 9,
    hoursAgo: 12,
  },
  {
    key: 'demo-5',
    title: 'Water leaking from a pipe onto the sidewalk in Sololaki',
    description:
      'Clean water has been running from under the pavement for two days. A small stream goes down the hill and the asphalt is starting to crack.',
    categorySlug: 'water',
    location: { region: 'tbilisi', municipality: 'tbilisi-mtatsminda', neighborhood: 'tbilisi-mtatsminda-sololaki' },
    centroid: [44.7985, 41.6897],
    status: 'fix_pending',
    upvoteCount: 17,
    hoursAgo: 80,
  },
  {
    key: 'demo-6',
    title: 'Cars parked across the pedestrian crossing near Varketili metro',
    description:
      'Every morning cars block the zebra crossing in front of the metro exit, so people with strollers and wheelchairs have to walk into the road.',
    categorySlug: 'parking',
    location: { region: 'tbilisi', municipality: 'tbilisi-samgori', neighborhood: 'tbilisi-samgori-varketili' },
    centroid: [44.8881, 41.6958],
    status: 'reported',
    upvoteCount: 64,
    hoursAgo: 70,
  },
  {
    key: 'demo-7',
    title: 'Missing manhole cover in Gldani 3rd micro-district',
    description: 'An open manhole next to the school entrance. Someone put a branch in it as a warning.',
    categorySlug: 'roads',
    location: { region: 'tbilisi', municipality: 'tbilisi-gldani', neighborhood: 'tbilisi-gldani-gldani' },
    centroid: [44.8183, 41.7978],
    status: 'fixed',
    upvoteCount: 112,
    hoursAgo: 200,
    fixedHoursAgo: 20,
  },
  {
    key: 'demo-8',
    title: 'Faded zebra crossing repainted on Tsereteli Avenue',
    description:
      'The crossing near the market had almost no paint left. It has now been repainted and new signs were installed on both sides.',
    categorySlug: 'traffic',
    location: { region: 'tbilisi', municipality: 'tbilisi-didube' },
    centroid: [44.7802, 41.7461],
    status: 'fixed',
    upvoteCount: 39,
    hoursAgo: 400,
    fixedHoursAgo: 60,
  },
];
