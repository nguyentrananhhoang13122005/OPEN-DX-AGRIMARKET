// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { withErrorHandler } from '@/lib/api/withErrorHandler'
import { prisma } from '@/infrastructure/db/prisma.client'
import { PrismaParcelRepository } from '@/infrastructure/db/repositories'
import { GetParcelUseCase, UpdateParcelUseCase, DeleteParcelUseCase } from '@/application/useCases'
import { parcelUpdateSchema } from '@/lib/validations/parcel.schema'

// Only Officer role can modify parcels
const OFFICER_ROLE = 'officer' as const

interface RouteContext {
  params: { id: string }
}

/**
 * GET /api/farm/parcels/[id]
 * Get a specific parcel by ID
 */
async function getHandler(request: Request, { params }: RouteContext) {
  const session = await auth()

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parcelRepo = new PrismaParcelRepository(prisma)
  const useCase = new GetParcelUseCase(parcelRepo)
  const parcel = await useCase.execute(params.id)

  return NextResponse.json({ data: parcel }, { status: 200 })
}

/**
 * PUT /api/farm/parcels/[id]
 * Update a parcel
 * Note: Cannot update geojson or area_ha (immutable after creation)
 * Can update: name, current_crop, soil_type, irrigation_type, estimated_yield_per_ha
 */
async function putHandler(request: Request, { params }: RouteContext) {
  const session = await auth()

  if (!session || !session.user || session.user.role !== OFFICER_ROLE) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const json = await request.json()
  const body = parcelUpdateSchema.parse(json)

  const parcelRepo = new PrismaParcelRepository(prisma)
  const useCase = new UpdateParcelUseCase(parcelRepo)
  const parcel = await useCase.execute(params.id, body)

  return NextResponse.json({ data: parcel }, { status: 200 })
}

/**
 * DELETE /api/farm/parcels/[id]
 * Delete a parcel
 * Only allowed if parcel has no JournalEntries
 */
async function deleteHandler(request: Request, { params }: RouteContext) {
  const session = await auth()

  if (!session || !session.user || session.user.role !== OFFICER_ROLE) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parcelRepo = new PrismaParcelRepository(prisma)
  const useCase = new DeleteParcelUseCase(parcelRepo)
  await useCase.execute(params.id)

  return NextResponse.json({ data: { message: 'Parcel deleted successfully' } }, { status: 200 })
}

export const GET = withErrorHandler(getHandler)
export const PUT = withErrorHandler(putHandler)
export const DELETE = withErrorHandler(deleteHandler)
