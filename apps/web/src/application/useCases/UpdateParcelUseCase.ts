// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import type { ParcelRepository } from '@/domain/farm/ports/ParcelRepository'
import type { Parcel } from '@/domain/farm/entities/Parcel'
import type { ParcelUpdateInput } from '@/lib/validations/parcel.schema'
import { NotFoundError, ConflictError } from '@/domain/errors'

export class UpdateParcelUseCase {
  constructor(private readonly parcelRepo: ParcelRepository) {}

  async execute(id: string, data: ParcelUpdateInput): Promise<Parcel> {
    // Verify parcel exists
    const existing = await this.parcelRepo.getById(id)
    if (!existing) {
      throw new NotFoundError('Parcel not found')
    }

    return this.parcelRepo.update(id, data)
  }
}

export class DeleteParcelUseCase {
  constructor(private readonly parcelRepo: ParcelRepository) {}

  async execute(id: string): Promise<void> {
    // Verify parcel exists
    const existing = await this.parcelRepo.getById(id)
    if (!existing) {
      throw new NotFoundError('Parcel not found')
    }

    // Check for journal entries
    const hasJournalEntries = await this.parcelRepo.hasJournalEntries(id)
    if (hasJournalEntries) {
      throw new ConflictError('Cannot delete parcel with journal entries')
    }

    return this.parcelRepo.delete(id)
  }
}
