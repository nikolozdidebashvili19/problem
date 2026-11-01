// Seed data for the `categories` collection (PRODUCT §7). The DB is the source of truth after seeding.
// `icon` is a lucide-react icon name.
export const CATEGORY_SEED = [
  { slug: 'roads', nameEn: 'Roads & potholes', nameKa: 'გზები და ორმოები', icon: 'construction' },
  { slug: 'sidewalks', nameEn: 'Sidewalks & crossings', nameKa: 'ტროტუარები და გადასასვლელები', icon: 'footprints' },
  { slug: 'lighting', nameEn: 'Street lighting', nameKa: 'გარე განათება', icon: 'lamp' },
  { slug: 'garbage', nameEn: 'Garbage & sanitation', nameKa: 'ნაგავი და სანიტარია', icon: 'trash-2' },
  { slug: 'water', nameEn: 'Water, sewage & drainage', nameKa: 'წყალი, კანალიზაცია, სანიაღვრე', icon: 'droplets' },
  { slug: 'parks', nameEn: 'Parks & green spaces', nameKa: 'პარკები და გამწვანება', icon: 'trees' },
  { slug: 'playgrounds', nameEn: 'Playgrounds & yards', nameKa: 'სათამაშო მოედნები და ეზოები', icon: 'ferris-wheel' },
  { slug: 'transport', nameEn: 'Public transport & stops', nameKa: 'საზოგადოებრივი ტრანსპორტი', icon: 'bus' },
  { slug: 'traffic', nameEn: 'Traffic signs & signals', nameKa: 'საგზაო ნიშნები და შუქნიშნები', icon: 'traffic-cone' },
  { slug: 'parking', nameEn: 'Illegal parking & blocked paths', nameKa: 'უკანონო პარკირება', icon: 'car' },
  { slug: 'buildings', nameEn: 'Dangerous buildings & construction', nameKa: 'საშიში შენობები და მშენებლობა', icon: 'building-2' },
  { slug: 'animals', nameEn: 'Stray animals', nameKa: 'მიუსაფარი ცხოველები', icon: 'dog' },
  { slug: 'accessibility', nameEn: 'Accessibility barriers', nameKa: 'ხელმისაწვდომობის ბარიერები', icon: 'accessibility' },
  { slug: 'other', nameEn: 'Other', nameKa: 'სხვა', icon: 'circle-help' },
] as const;
