// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import { HouseholdPort, CreateHouseholdData } from '@/domain/farm/ports/HouseholdPort'

export class CreateHouseholdUseCase {
  constructor(private readonly householdPort: HouseholdPort) {}

  async execute(data: CreateHouseholdData) {
    return this.householdPort.create(data)
  }
}
