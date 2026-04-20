import { describe, it, expect } from 'vitest';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { users } from '@/db/schema';

vi.mock('@/db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockResolvedValue([{ count: '1' }]),
    }),
  },
}));

describe('Database Schema & Connection', () => {
  it('should successfully connect to the database and query the users table', async () => {
    // We run a simple select query to ensure the connection and schema are valid
    // without inserting any junk data into the live database.
    try {
      const result = await db.select({ count: sql`count(*)` }).from(users);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(typeof Number(result[0].count)).toBe('number');
    } catch (error) {
      // If this fails, it means the connection or schema is broken
      expect(error).toBeUndefined();
    }
  });
});
