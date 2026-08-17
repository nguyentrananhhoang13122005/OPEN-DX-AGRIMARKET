// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import type { Parcel, ParcelCreateInput, ParcelUpdateInput } from '@/domain/farm/entities/Parcel'

export interface ParcelRepository {
  /**
   * Create a new parcel with GeoJSON and calculated centroid
   */
  create(data: ParcelCreateInput & { parcel_code: string; centroid_lat: number; centroid_lng: number }): Promise<Parcel>

  /**
   * Get parcel by ID
   */
  getById(id: string): Promise<Parcel | null>

  /**
   * List all parcels, optionally filtered by household_id and/or status
   */
  list(filters?: { household_id?: string; status?: string }): Promise<Parcel[]>

  /**
   * Update parcel (only allows updating name, crop, soil_type, irrigation_type, estimated_yield_per_ha)
   * Polygon shape and area are immutable
   */
  update(id: string, data: ParcelUpdateInput): Promise<Parcel>

  /**
   * Delete parcel by ID
   * Should check that no JournalEntries exist before deleting
   */
  delete(id: string): Promise<void>

  /**
   * Check if parcel has any journal entries
   */
  hasJournalEntries(id: string): Promise<boolean>

  /**
   * Get total area of all parcels for a household
   */
  getTotalAreaByHousehold(household_id: string): Promise<number>
}
