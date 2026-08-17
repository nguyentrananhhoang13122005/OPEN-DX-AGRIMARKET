'use client'

// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import { useEffect, useRef, useCallback, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-draw'
import { convertSqMetersToHectares } from '@/application/utils/centroidCalculator'

interface GeoJSONPolygon {
  type: 'Polygon'
  coordinates: Array<Array<[number, number]>>
}

interface FarmZoneMapProps {
  onPolygonDrawn: (polygon: GeoJSONPolygon, areaHa: number) => void
  onDrawStart?: () => void
  onDrawCancel?: () => void
  initialPolygon?: GeoJSONPolygon | null
  readOnly?: boolean
}

// Map controller component to handle Leaflet.draw integration
function MapController({ onPolygonDrawn, onDrawStart, onDrawCancel, initialPolygon, readOnly }: FarmZoneMapProps) {
  const map = useMap()
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup())
  const drawControlRef = useRef<L.Control.Draw | null>(null)
  const editControlRef = useRef<any>(null)

  useEffect(() => {
    // Add the FeatureGroup to the map
    drawnItemsRef.current.addTo(map)

    // Initialize Leaflet.draw controls
    if (!readOnly) {
      const drawControl = new L.Control.Draw({
        position: 'topleft',
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
          },
          polyline: false,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItemsRef.current,
          remove: true,
        },
      })

      drawControl.addTo(map)
      drawControlRef.current = drawControl
    }

    // Handle draw events
    const handleDrawCreated = (e: any) => {
      const layer = e.layer
      const geoJSON = layer.toGeoJSON()

      // Only accept Polygon type
      if (geoJSON.geometry.type !== 'Polygon') {
        alert('Please draw a polygon')
        return
      }

      // Clear previous drawings
      drawnItemsRef.current.clearLayers()

      // Add the new layer
      drawnItemsRef.current.addLayer(layer)

      // Calculate area
      const coordinates = geoJSON.geometry.coordinates
      const areaSqMeters = calculatePolygonArea(coordinates[0])
      const areaHa = convertSqMetersToHectares(areaSqMeters)

      // Call callback with polygon and area
      onPolygonDrawn(
        {
          type: 'Polygon',
          coordinates: geoJSON.geometry.coordinates,
        },
        areaHa
      )
    }

    const handleDrawStart = () => {
      onDrawStart?.()
    }

    const handleDrawStop = () => {
      // Check if a valid polygon was drawn
      const layers = drawnItemsRef.current.getLayers()
      if (layers.length === 0) {
        onDrawCancel?.()
      }
    }

    map.on(L.Draw.Event.CREATED, handleDrawCreated)
    map.on(L.Draw.Event.DRAWSTART, handleDrawStart)
    map.on(L.Draw.Event.DRAWSTOP, handleDrawStop)

    // If initialPolygon is provided, display it
    if (initialPolygon && initialPolygon.coordinates) {
      const geoJSONFeature = {
        type: 'Feature' as const,
        geometry: initialPolygon,
        properties: {},
      }
      const layer = L.geoJSON(geoJSONFeature, {
        style: {
          color: '#4285F4',
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.2,
        },
      })
      layer.addTo(drawnItemsRef.current)
    }

    return () => {
      map.off(L.Draw.Event.CREATED, handleDrawCreated)
      map.off(L.Draw.Event.DRAWSTART, handleDrawStart)
      map.off(L.Draw.Event.DRAWSTOP, handleDrawStop)

      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current)
      }
    }
  }, [map, onPolygonDrawn, onDrawStart, onDrawCancel, initialPolygon, readOnly])

  return null
}

/**
 * Calculate the area of a polygon using the Shoelace formula
 * @param coordinates Array of [lng, lat] coordinate pairs
 * @returns Area in square meters
 */
function calculatePolygonArea(coordinates: Array<[number, number]>): number {
  const R = 6371000 // Earth's radius in meters

  let area = 0
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lng1, lat1] = coordinates[i]
    const [lng2, lat2] = coordinates[i + 1]

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
 * FarmZoneMap Component
 * Interactive map for drawing parcel boundaries using Leaflet.draw
 *
 * Usage:
 * <FarmZoneMap
 *   onPolygonDrawn={(polygon, areaHa) => { ... }}
 *   onDrawStart={() => { ... }}
 *   onDrawCancel={() => { ... }}
 *   readOnly={false}
 * />
 */
export function FarmZoneMap(props: FarmZoneMapProps) {
  const [mapReady, setMapReady] = useState(false)

  // Default Vietnam coordinates for the map center
  const defaultCenter: [number, number] = [10.8, 106.7]

  return (
    <div className="w-full h-full min-h-[500px]">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mapReady && <MapController {...props} />}
      </MapContainer>
    </div>
  )
}
