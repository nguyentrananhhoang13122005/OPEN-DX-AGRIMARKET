// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { withErrorHandler } from '@/lib/api/withErrorHandler'
import { prisma } from '@/infrastructure/db/prisma.client'
import { PrismaParcelRepository } from '@/infrastructure/db/repositories'
import { CreateParcelUseCase, ListParcelsUseCase } from '@/application/useCases'
import { parcelCreateSchema } from '@/lib/validations/parcel.schema'

// Only Officer role can create/view parcels
const OFFICER_ROLE = 'officer' as const

/**
 * GET /api/farm/parcels
 * List parcels with optional filters by household_id and status
 */
async function getHandler(request: Request) {
  const session = await auth()

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const household_id = searchParams.get('household_id') || undefined
  const status = searchParams.get('status') || undefined

  const parcelRepo = new PrismaParcelRepository(prisma)
  const useCase = new ListParcelsUseCase(parcelRepo)
  const parcels = await useCase.execute({ household_id, status })

  return NextResponse.json({ data: parcels }, { status: 200 })
}

/**
 * POST /api/farm/parcels
 * Create a new parcel with GeoJSON polygon from Leaflet.draw
 * Requires Officer role
 */
async function postHandler(request: Request) {
  const session = await auth()

  if (!session || !session.user || session.user.role !== OFFICER_ROLE) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const json = await request.json()
  const body = parcelCreateSchema.parse(json)

  const parcelRepo = new PrismaParcelRepository(prisma)
  const useCase = new CreateParcelUseCase(parcelRepo)
  const parcel = await useCase.execute(body)

  return NextResponse.json({ data: parcel }, { status: 201 })
}

export const GET = withErrorHandler(getHandler)
export const POST = withErrorHandler(postHandler)
