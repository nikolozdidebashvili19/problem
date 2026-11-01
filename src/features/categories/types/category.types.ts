export type CategorySummary = {
  id: string;
  slug: string;
  nameKa: string;
  nameEn: string;
  icon: string;
};

export type CategorySeedInput = {
  slug: string;
  nameKa: string;
  nameEn: string;
  icon: string;
  order: number;
};
