// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import { IBulletinRepository } from '../../domain/repositories/IBulletinRepository';

export class GetAvailableCommoditiesUseCase {
  constructor(private repository: IBulletinRepository) {}

  async execute(): Promise<string[]> {
    return this.repository.getAvailableCommodities();
  }
}
