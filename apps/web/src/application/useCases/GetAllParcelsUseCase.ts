// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import { IParcelRepository, Parcel } from '../../domain/repositories/IParcelRepository'

export class GetAllParcelsUseCase {
  constructor(private readonly repository: IParcelRepository) {}

  async execute(): Promise<Parcel[]> {
    return this.repository.getAllParcels()
  }
}
