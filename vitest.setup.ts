import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.hoisted(() => {
  vi.mock('@neondatabase/serverless', () => ({
    neon: vi.fn().mockReturnValue(vi.fn()),
  }));
});

// Provide a dummy DATABASE_URL for tests to prevent neon() initialization errors
process.env.DATABASE_URL = 'postgresql://dbuser:dbpass@ep-cool-ice-123456.us-east-2.aws.neon.tech/neondb';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  redirect: vi.fn(),
}));

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));
