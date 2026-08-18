// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import React from 'react'
import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'
import { prisma } from '@/infrastructure/db/prisma.client'
import { PrismaParcelRepository } from '@/infrastructure/db/repositories/PrismaParcelRepository'
import { GetAllParcelsUseCase } from '@/application/useCases/GetAllParcelsUseCase'
import { MetricCard } from '@/components/ui/MetricCard/MetricCard'
import { Pill } from '@/components/ui/Pill/Pill'
import styles from './page.module.css'

// Dynamic import for ZoneMap to prevent SSR (Leaflet requires browser APIs)
const ZoneMap = dynamic(() => import('@/components/features/map/ZoneMap'), { ssr: false })

const STATUS_LABEL: Record<string, string> = {
  SOWING: 'Đang gieo',
  TENDING: 'Đang chăm sóc',
  HARVEST_APPROVED: 'Đã duyệt thu hoạch',
  HARVESTED: 'Đã thu hoạch',
  DRAFT: 'Nháp',
}

const STATUS_TONE: Record<string, 'green' | 'amber' | 'blue' | 'neutral'> = {
  SOWING: 'green',
  TENDING: 'green',
  HARVEST_APPROVED: 'amber',
  HARVESTED: 'neutral',
  DRAFT: 'neutral',
}

export default async function ManagerZonesPage() {
  const repo = new PrismaParcelRepository(prisma)
  const useCase = new GetAllParcelsUseCase(repo)
  const parcels = await useCase.execute()

  const totalAreaHa = parcels.reduce((sum, p) => sum + p.area_ha, 0)
  const activeParcels = parcels.filter((p) =>
    ['SOWING', 'TENDING', 'HARVEST_APPROVED'].includes(p.status)
  )

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Vùng trồng (Farm Zones)</h1>
        <p className={styles.subtitle}>Xem tổng quan tất cả thửa đất trong HTX — chỉ đọc</p>
      </header>

      {/* Summary stats */}
      <section className={styles.stats}>
        <MetricCard
          icon={<MapPin size={20} />}
          label="Tổng diện tích"
          value={`${totalAreaHa.toFixed(2)} ha`}
          detail={`${parcels.length} thửa đất`}
          tone="green"
        />
        <MetricCard
          icon={<MapPin size={20} />}
          label="Đang canh tác"
          value={activeParcels.length}
          detail="thửa đang hoạt động"
          tone="blue"
        />
        <MetricCard
          icon={<MapPin size={20} />}
          label="Diện tích đang canh tác"
          value={`${activeParcels.reduce((s, p) => s + p.area_ha, 0).toFixed(2)} ha`}
          detail="trong tổng số"
          tone="amber"
        />
      </section>

      {/* Map */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Bản đồ vùng trồng</h2>
        <ZoneMap parcels={parcels} />
      </section>

      {/* Data table */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Danh sách thửa đất</h2>
        {parcels.length === 0 ? (
          <p className={styles.empty}>Chưa có thửa đất nào trong hệ thống.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã vùng</th>
                  <th>Nông hộ</th>
                  <th>Diện tích (ha)</th>
                  <th>Cây trồng hiện tại</th>
                  <th>Vụ mùa</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {parcels.map((parcel) => {
                  const currentCycle = parcel.crop_cycles[0]
                  const tone = STATUS_TONE[parcel.status] ?? 'neutral'
                  return (
                    <tr key={parcel.id}>
                      <td className={styles.code}>{parcel.parcel_code}</td>
                      <td>{parcel.household.name}</td>
                      <td className={styles.numeric}>{parcel.area_ha.toFixed(2)}</td>
                      <td>{parcel.crop_type}</td>
                      <td>{currentCycle?.season ?? '—'}</td>
                      <td>
                        <Pill tone={tone}>
                          {STATUS_LABEL[parcel.status] ?? parcel.status}
                        </Pill>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
