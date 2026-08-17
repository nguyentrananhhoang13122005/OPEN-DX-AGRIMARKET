// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import type { PrismaClient } from '@prisma/client'
import type { ParcelRepository } from '@/domain/farm/ports/ParcelRepository'
import type { Parcel, ParcelCreateInput, ParcelUpdateInput } from '@/domain/farm/entities/Parcel'
import { NotFoundError, ConflictError } from '@/domain/errors'

export class PrismaParcelRepository implements ParcelRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: ParcelCreateInput & { parcel_code: string; centroid_lat: number; centroid_lng: number }): Promise<Parcel> {
    const parcel = await this.prisma.parcel.create({
      data: {
        parcel_code: data.parcel_code,
        household_id: data.household_id,
        name: data.name,
        crop_type: data.current_crop,
        area_ha: data.area_ha,
        geojson: data.geojson,
        centroid_lat: data.centroid_lat,
        centroid_lng: data.centroid_lng,
        soil_type: data.soil_type,
        irrigation_type: data.irrigation_type,
        estimated_yield_per_ha: data.estimated_yield_per_ha,
        status: 'DRAFT',
      },
    })

    return this.mapPrismaToEntity(parcel)
  }

  async getById(id: string): Promise<Parcel | null> {
    const parcel = await this.prisma.parcel.findUnique({
      where: { id },
    })
    return parcel ? this.mapPrismaToEntity(parcel) : null
  }

  async list(filters?: { household_id?: string; status?: string }): Promise<Parcel[]> {
    const parcels = await this.prisma.parcel.findMany({
      where: {
        ...(filters?.household_id && { household_id: filters.household_id }),
        ...(filters?.status && { status: filters.status as any }),
      },
      orderBy: { created_at: 'desc' },
    })

    return parcels.map(p => this.mapPrismaToEntity(p))
  }

  async update(id: string, data: ParcelUpdateInput): Promise<Parcel> {
    const existing = await this.prisma.parcel.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existing) {
      throw new NotFoundError('Parcel not found')
    }

    const updated = await this.prisma.parcel.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.current_crop !== undefined && { crop_type: data.current_crop }),
        ...(data.soil_type !== undefined && { soil_type: data.soil_type }),
        ...(data.irrigation_type !== undefined && { irrigation_type: data.irrigation_type }),
        ...(data.estimated_yield_per_ha !== undefined && { estimated_yield_per_ha: data.estimated_yield_per_ha }),
      },
    })

    return this.mapPrismaToEntity(updated)
  }

  async delete(id: string): Promise<void> {
    const parcel = await this.prisma.parcel.findUnique({
      where: { id },
      select: { id: true, journal_entries: { select: { id: true }, take: 1 } },
    })

    if (!parcel) {
      throw new NotFoundError('Parcel not found')
    }

    if (parcel.journal_entries.length > 0) {
      throw new ConflictError('Cannot delete parcel with journal entries')
    }

    await this.prisma.parcel.delete({
      where: { id },
    })
  }

  async hasJournalEntries(id: string): Promise<boolean> {
    const count = await this.prisma.journalEntry.count({
      where: { parcel_id: id },
    })
    return count > 0
  }

  async getTotalAreaByHousehold(household_id: string): Promise<number> {
    const result = await this.prisma.parcel.aggregate({
      where: { household_id },
      _sum: { area_ha: true },
    })
    return result._sum.area_ha || 0
  }

  private mapPrismaToEntity(parcel: any): Parcel {
    return {
      id: parcel.id,
      parcel_code: parcel.parcel_code,
      household_id: parcel.household_id,
      name: parcel.name,
      area_ha: Number(parcel.area_ha),
      geojson: parcel.polygon_geojson as any || parcel.geojson,
      centroid_lat: parcel.centroid_lat ? Number(parcel.centroid_lat) : null,
      centroid_lng: parcel.centroid_lng ? Number(parcel.centroid_lng) : null,
      current_crop: parcel.crop_type,
      soil_type: parcel.soil_type || null,
      irrigation_type: parcel.irrigation_type || null,
      estimated_yield_per_ha: parcel.estimated_yield_per_ha ? Number(parcel.estimated_yield_per_ha) : null,
      status: parcel.status as any,
      created_at: parcel.created_at,
      updated_at: parcel.updated_at,
    }
  }
}
