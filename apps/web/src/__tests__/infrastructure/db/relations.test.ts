import { prisma } from '@/infrastructure/db/prisma.client'

describe('Database Relations', () => {
  it('can fetch a Household with its Parcels', async () => {
    const household = await prisma.household.findFirst({
      include: { parcels: true }
    })
    
    expect(household).toBeDefined()
    if (household) {
      expect(Array.isArray(household.parcels)).toBe(true)
    }
  })

  it('can fetch a JournalEntry with its JournalActivities', async () => {
    // Even if empty, the include syntax must be valid and execute successfully
    const entry = await prisma.journalEntry.findFirst({
      include: { activities: true }
    })
    
    expect(entry !== undefined).toBe(true) // Might be null if no data, which is fine
  })
})
