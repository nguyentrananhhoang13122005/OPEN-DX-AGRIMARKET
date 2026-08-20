// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import type { Layer } from 'leaflet'
import type { Feature, GeoJsonObject } from 'geojson'
import styles from './ZoneMap.module.css'
import type { Parcel } from '../../../domain/repositories/IParcelRepository'

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false })
const GeoJSON = dynamic(() => import('react-leaflet').then((m) => m.GeoJSON), { ssr: false })

interface ZoneMapProps {
  parcels: Parcel[]
}

const PARCEL_STATUS_COLOR: Record<string, string> = {
  SOWING: '#22c55e',
  TENDING: '#84cc16',
  HARVEST_APPROVED: '#f59e0b',
  HARVESTED: '#6b7280',
  DRAFT: '#cbd5e1',
}

export default function ZoneMap({ parcels }: ZoneMapProps) {
  const parcelsWithGeom = parcels.filter((p) => p.polygon_geojson != null)

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        center={[10.0452, 105.7469]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {parcelsWithGeom.map((parcel) => {
          const color = PARCEL_STATUS_COLOR[parcel.status] ?? '#94a3b8'
          const currentCycle = parcel.crop_cycles[0]

          return (
            <GeoJSON
              key={parcel.id}
              data={parcel.polygon_geojson as GeoJsonObject}
              style={{
                color,
                weight: 2,
                fillColor: color,
                fillOpacity: 0.35,
              }}
              onEachFeature={(_feature: Feature, layer: Layer) => {
                layer.bindPopup(`
                  <div class="${styles.popup}">
                    <strong>${parcel.parcel_code}</strong>
                    <div>Nông hộ: ${parcel.household.name}</div>
                    <div>Cây trồng: ${parcel.crop_type}</div>
                    ${currentCycle?.season ? `<div>Vụ: ${currentCycle.season}</div>` : ''}
                    <div>Diện tích: ${parcel.area_ha.toFixed(2)} ha</div>
                  </div>
                `)
              }}
            />
          )
        })}
      </MapContainer>
    </div>
  )
}
