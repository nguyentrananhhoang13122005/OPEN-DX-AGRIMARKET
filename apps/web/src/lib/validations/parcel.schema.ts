// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import { z } from 'zod'

// GeoJSON Polygon type validation
const GeoJSONPolygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(
    z.array(
      z.tuple([
        z.number().refine(val => val >= -180 && val <= 180, 'Longitude must be between -180 and 180'),
        z.number().refine(val => val >= -90 && val <= 90, 'Latitude must be between -90 and 90'),
      ])
    ).min(2, 'Each coordinate pair must have at least 2 points')
  ).min(1, 'Polygon must have at least 1 ring')
})

// Parcel creation schema (from frontend form + Leaflet.draw)
export const parcelCreateSchema = z.object({
  household_id: z.string().uuid('Household ID must be a valid UUID'),
  name: z.string().min(1, 'Tên thửa đất không được để trống').max(200, 'Tên quá dài'),
  geojson: GeoJSONPolygonSchema,
  area_ha: z.number().positive('Diện tích phải lớn hơn 0'),
  current_crop: z.string().min(1, 'Cây trồng không được để trống'),
  soil_type: z.string().optional().nullable(),
  irrigation_type: z.string().optional().nullable(),
  estimated_yield_per_ha: z.number().positive('Năng suất phải lớn hơn 0').optional().nullable(),
})

// Parcel update schema (can only update some fields)
export const parcelUpdateSchema = z.object({
  name: z.string().min(1, 'Tên thửa đất không được để trống').max(200, 'Tên quá dài').optional(),
  current_crop: z.string().min(1, 'Cây trồng không được để trống').optional(),
  soil_type: z.string().optional().nullable(),
  irrigation_type: z.string().optional().nullable(),
  estimated_yield_per_ha: z.number().positive('Năng suất phải lớn hơn 0').optional().nullable(),
  // Note: geojson and area_ha cannot be updated (immutable after creation)
})

// Parcel response schema (includes calculated fields)
export const parcelResponseSchema = z.object({
  id: z.string(),
  parcel_code: z.string(),
  household_id: z.string(),
  name: z.string(),
  area_ha: z.number(),
  geojson: GeoJSONPolygonSchema,
  centroid_lat: z.number().nullable(),
  centroid_lng: z.number().nullable(),
  current_crop: z.string(),
  soil_type: z.string().nullable(),
  irrigation_type: z.string().nullable(),
  estimated_yield_per_ha: z.number().nullable(),
  status: z.enum(['SOWING', 'TENDING', 'HARVEST_APPROVED', 'HARVESTED', 'DRAFT']),
  created_at: z.date(),
  updated_at: z.date(),
})

export type ParcelCreateInput = z.infer<typeof parcelCreateSchema>
export type ParcelUpdateInput = z.infer<typeof parcelUpdateSchema>
export type ParcelResponse = z.infer<typeof parcelResponseSchema>
