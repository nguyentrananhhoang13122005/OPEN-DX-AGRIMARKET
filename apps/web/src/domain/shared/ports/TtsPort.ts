// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

export interface TtsPort {
  synthesize(text: string): Promise<ReadableStream>
  checkHealth(): Promise<boolean>
}
