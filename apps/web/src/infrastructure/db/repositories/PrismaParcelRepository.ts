// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import { PrismaClient } from '@prisma/client'
import { IParcelRepository, Parcel } from '../../../domain/repositories/IParcelRepository'

export class PrismaParcelRepository implements IParcelRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getAllParcels(): Promise<Parcel[]> {
    const records = await this.prisma.parcel.findMany({
      include: {
        household: true,
        crop_cycles: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
      orderBy: { created_at: 'desc' },
    })

    return records.map((r) => ({
      id: r.id,
      parcel_code: r.parcel_code,
      crop_type: r.crop_type,
      area_ha: r.area_ha,
      centroid_lat: r.centroid_lat,
      centroid_lng: r.centroid_lng,
      polygon_geojson: r.polygon_geojson,
      status: r.status as Parcel['status'],
      household: {
        id: r.household.id,
        name: r.household.name,
        phone: r.household.phone,
      },
      crop_cycles: r.crop_cycles.map((c) => ({
        id: c.id,
        season: c.season,
        sowed_at: c.sowed_at,
        harvested_at: c.harvested_at,
      })),
    }))
  }
}
