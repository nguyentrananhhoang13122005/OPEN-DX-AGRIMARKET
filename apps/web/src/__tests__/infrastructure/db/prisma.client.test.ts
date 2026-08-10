import { prisma as prisma1 } from '@/infrastructure/db/prisma.client'

describe('Prisma Client Singleton', () => {
  it('should reuse the same instance', async () => {
    // Dynamically import to simulate a separate module loading
    const { prisma: prisma2 } = await import('@/infrastructure/db/prisma.client')
    
    expect(prisma1).toBe(prisma2)
  })

  it('should attach to globalThis in development', () => {
    // NODE_ENV is 'test' during Jest runs
    expect((globalThis as any).prisma).toBe(prisma1)
  })
})
