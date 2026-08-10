import { prisma } from '@/infrastructure/db/prisma.client'

describe('Database Constraints', () => {
  it('prevents duplicate Household phone numbers', async () => {
    const phone = '0999999999'
    
    // Create first
    const first = await prisma.household.create({
      data: { name: 'Test 1', phone }
    })

    // Create second with same phone should throw
    await expect(
      prisma.household.create({
        data: { name: 'Test 2', phone }
      })
    ).rejects.toThrow(/Unique constraint failed on the fields: \(`phone`\)/)
    
    // Clean up
    await prisma.household.delete({ where: { id: first.id } })
  })
})
