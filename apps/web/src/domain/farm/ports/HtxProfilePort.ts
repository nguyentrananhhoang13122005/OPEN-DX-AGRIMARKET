// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

export interface HtxProfile {
  id: string
  name: string
  // Add other fields as needed
}

export interface HtxProfilePort {
  findFirst(): Promise<HtxProfile | null>
}
