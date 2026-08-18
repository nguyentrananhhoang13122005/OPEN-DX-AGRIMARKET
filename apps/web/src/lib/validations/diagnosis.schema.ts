// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import { z } from 'zod'

export const diagnosisSchema = z.object({
  parcel_id: z.string().cuid({ message: 'Invalid parcel ID format' }),
})
