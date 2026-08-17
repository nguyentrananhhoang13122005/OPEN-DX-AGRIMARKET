// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import type { ParcelRepository } from '@/domain/farm/ports/ParcelRepository'
import type { Parcel } from '@/domain/farm/entities/Parcel'
import { NotFoundError } from '@/domain/errors'

export class GetParcelUseCase {
  constructor(private readonly parcelRepo: ParcelRepository) {}

  async execute(id: string): Promise<Parcel> {
    const parcel = await this.parcelRepo.getById(id)
    if (!parcel) {
      throw new NotFoundError('Parcel not found')
    }
    return parcel
  }
}

export class ListParcelsUseCase {
  constructor(private readonly parcelRepo: ParcelRepository) {}

  async execute(filters?: { household_id?: string; status?: string }): Promise<Parcel[]> {
    return this.parcelRepo.list(filters)
  }
}
