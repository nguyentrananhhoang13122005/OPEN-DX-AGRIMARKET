// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

export type ParcelStatus = 'SOWING' | 'TENDING' | 'HARVEST_APPROVED' | 'HARVESTED' | 'DRAFT'

export interface ParcelCropCycle {
  id: string
  season: string | null
  sowed_at: Date | null
  harvested_at: Date | null
}

export interface ParcelHousehold {
  id: string
  name: string
  phone: string
}

export interface Parcel {
  id: string
  parcel_code: string
  crop_type: string
  area_ha: number
  centroid_lat: number | null
  centroid_lng: number | null
  polygon_geojson: unknown | null
  status: ParcelStatus
  household: ParcelHousehold
  crop_cycles: ParcelCropCycle[]
}

export interface IParcelRepository {
  getAllParcels(): Promise<Parcel[]>
}
