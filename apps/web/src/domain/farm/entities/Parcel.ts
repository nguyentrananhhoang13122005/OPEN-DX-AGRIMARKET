// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

export interface Parcel {
  id: string
  parcel_code: string
  household_id: string
  name: string
  area_ha: number
  geojson: {
    type: 'Polygon'
    coordinates: Array<Array<[number, number]>>
  }
  centroid_lat: number | null
  centroid_lng: number | null
  current_crop: string
  soil_type: string | null
  irrigation_type: string | null
  estimated_yield_per_ha: number | null
  status: 'SOWING' | 'TENDING' | 'HARVEST_APPROVED' | 'HARVESTED' | 'DRAFT'
  created_at: Date
  updated_at: Date
}

export type ParcelCreateInput = Omit<Parcel, 'id' | 'parcel_code' | 'centroid_lat' | 'centroid_lng' | 'status' | 'created_at' | 'updated_at'>

export type ParcelUpdateInput = Partial<Omit<Parcel, 'id' | 'parcel_code' | 'household_id' | 'geojson' | 'area_ha' | 'centroid_lat' | 'centroid_lng' | 'status' | 'created_at' | 'updated_at'>>
