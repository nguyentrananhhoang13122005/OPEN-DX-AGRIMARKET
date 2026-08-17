// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import type { ParcelRepository } from '@/domain/farm/ports/ParcelRepository'
import type { Parcel } from '@/domain/farm/entities/Parcel'
import type { ParcelCreateInput as SchemaParcelCreateInput } from '@/lib/validations/parcel.schema'
import { calculateCentroid } from '@/application/utils/centroidCalculator'

export class CreateParcelUseCase {
  constructor(private readonly parcelRepo: ParcelRepository) {}

  async execute(data: SchemaParcelCreateInput): Promise<Parcel> {
    // Calculate centroid from GeoJSON polygon
    const { centroid_lat, centroid_lng } = calculateCentroid(data.geojson)

    // Generate parcel code (format: P-HTX-{htx_code}-{sequential_id})
    // For now, we'll use a simple format that can be refined later
    const parcel_code = `P-${Date.now()}`

    // Create parcel with calculated centroid
    const parcel = await this.parcelRepo.create({
      ...data,
      parcel_code,
      centroid_lat,
      centroid_lng,
    })

    return parcel
  }
}
