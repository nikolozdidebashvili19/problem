import { LocationDocument, LocationModel } from '@/features/locations/schema/location.schema';
import { LocationLevel, LocationSeedInput } from '@/features/locations/types/location.types';
import { mongo } from '@/shared/lib/mongo';
import { GeoPoint } from '@/shared/utils/geo';

export const locationRepository = {
  async findRoots(): Promise<LocationDocument[]> {
    await mongo.connect();
    return LocationModel.find({ level: 'region' }).sort({ nameKa: 1 }).lean<LocationDocument[]>().exec();
  },

  async findByParent(parentSlug: string): Promise<LocationDocument[]> {
    await mongo.connect();
    return LocationModel.find({ parentSlug }).sort({ nameKa: 1 }).lean<LocationDocument[]>().exec();
  },

  async findBySlug(slug: string): Promise<LocationDocument | null> {
    await mongo.connect();
    return LocationModel.findOne({ slug }).lean<LocationDocument>().exec();
  },

  async findBySlugs(slugs: string[]): Promise<LocationDocument[]> {
    await mongo.connect();
    return LocationModel.find({ slug: { $in: slugs } }).lean<LocationDocument[]>().exec();
  },

  async findContaining(point: GeoPoint): Promise<LocationDocument[]> {
    await mongo.connect();
    return LocationModel.find({ boundary: { $geoIntersects: { $geometry: point } } })
      .lean<LocationDocument[]>()
      .exec();
  },

  async findNearestByCentroid(
    point: GeoPoint,
    level: LocationLevel,
    maxDistanceMeters: number
  ): Promise<LocationDocument | null> {
    await mongo.connect();
    return LocationModel.findOne({
      level,
      centroid: { $near: { $geometry: point, $maxDistance: maxDistanceMeters } },
    })
      .lean<LocationDocument>()
      .exec();
  },

  async upsertBySlug(data: LocationSeedInput): Promise<void> {
    await mongo.connect();
    await LocationModel.updateOne({ slug: data.slug }, { $set: data }, { upsert: true });
  },
};
