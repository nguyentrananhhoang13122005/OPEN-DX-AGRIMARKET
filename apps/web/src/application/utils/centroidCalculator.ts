// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import { centroid, polygon } from '@turf/turf'

export interface CentroidResult {
  centroid_lat: number
  centroid_lng: number
}

/**
 * Calculate the centroid (center point) of a GeoJSON Polygon using Turf.js
 * @param geojson GeoJSON Polygon object
 * @returns Centroid coordinates { centroid_lat, centroid_lng }
 */
export function calculateCentroid(geojson: {
  type: 'Polygon'
  coordinates: Array<Array<[number, number]>>
}): CentroidResult {
  try {
    // Create a Turf polygon feature from the GeoJSON coordinates
    const poly = polygon(geojson.coordinates)

    // Calculate centroid using Turf.js
    const center = centroid(poly)

    const [lng, lat] = center.geometry.coordinates

    return {
      centroid_lat: lat,
      centroid_lng: lng,
    }
  } catch (error) {
    throw new Error(`Failed to calculate centroid: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Calculate the area of a GeoJSON Polygon in square meters
 * Uses Haversine formula approximation for accuracy
 * @param coordinates GeoJSON Polygon coordinates
 * @returns Area in square meters
 */
export function calculateArea(coordinates: Array<Array<[number, number]>>): number {
  if (!coordinates || coordinates.length === 0) {
    return 0
  }

  // Get the first ring (exterior ring)
  const ring = coordinates[0]

  if (ring.length < 3) {
    return 0
  }

  // Calculate area using the shoelace formula with Earth's radius
  const R = 6371000 // Earth's radius in meters

  let area = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [lng1, lat1] = ring[i]
    const [lng2, lat2] = ring[i + 1]

    const phi1 = (lat1 * Math.PI) / 180
    const phi2 = (lat2 * Math.PI) / 180
    const lambda1 = (lng1 * Math.PI) / 180
    const lambda2 = (lng2 * Math.PI) / 180

    area += (lambda2 - lambda1) * (2 + Math.sin(phi1) + Math.sin(phi2))
  }

  area = Math.abs((area * R * R) / 2)
  return area
}

/**
 * Convert area from square meters to hectares
 * 1 hectare = 10,000 square meters
 * @param areaSqMeters Area in square meters
 * @returns Area in hectares
 */
export function convertSqMetersToHectares(areaSqMeters: number): number {
  return areaSqMeters / 10000
}
