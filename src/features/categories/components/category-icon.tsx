import {
  Accessibility,
  Building2,
  Bus,
  Car,
  CircleHelp,
  Construction,
  Dog,
  Droplets,
  FerrisWheel,
  Footprints,
  Lamp,
  TrafficCone,
  Trash2,
  Trees,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/shared/lib/utils';

// Keys match the `icon` values in CATEGORY_SEED
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  accessibility: Accessibility,
  'building-2': Building2,
  bus: Bus,
  car: Car,
  'circle-help': CircleHelp,
  construction: Construction,
  dog: Dog,
  droplets: Droplets,
  'ferris-wheel': FerrisWheel,
  footprints: Footprints,
  lamp: Lamp,
  'traffic-cone': TrafficCone,
  'trash-2': Trash2,
  trees: Trees,
};

type CategoryIconProps = {
  icon: string;
  className?: string;
};

export const CategoryIcon = ({ icon, className }: CategoryIconProps) => {
  const Icon = CATEGORY_ICONS[icon] ?? CircleHelp;
  return <Icon aria-hidden="true" className={cn('size-4 shrink-0', className)} />;
};
