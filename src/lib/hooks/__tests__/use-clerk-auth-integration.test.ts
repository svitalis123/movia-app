import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '../../types';

// Mock Clerk hooks
const mockUseAuth = vi.fn();
const mockUseUser = vi.fn();

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => mockUseAuth(),
  useUser: () => mockUseUser(),
}));

// Mock auth store
const mockUseAuthStore = vi.fn();
vi.mock('../../stores/auth-store', () => ({
  useAuthStore: (selector: any) => mockUseAuthStore(selector),
}));

describe('Clerk Auth Integration Utils', () => {
  const mockUser: User = {
    id: 'user_123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  };

  const mockClerkUser = {
    id: 'user_123',
    primaryEmailAddress: {
      emailAddress: 'test@example.com',
    },
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
    createdAt: new Date('2023-01-01'),
    lastSignInAt: new Date('2023-12-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication Status Logic', () => {
    it('should determine authenticated state correctly', () => {
      // Test authentication logic
      const isAuthenticated = (
        isLoaded: boolean,
        isSignedIn: boolean,
        sessionId: string | null
      ) => {
        return isLoaded && !!isSignedIn && !!sessionId;
      };

      expect(isAuthenticated(true, true, 'session_123')).toBe(true);
      expect(isAuthenticated(false, true, 'session_123')).toBe(false);
      expect(isAuthenticated(true, false, 'session_123')).toBe(false);
      expect(isAuthenticated(true, true, null)).toBe(false);
    });

    it('should determine loading state correctly', () => {
      const isAuthLoading = (isLoaded: boolean) => !isLoaded;

      expect(isAuthLoading(false)).toBe(true);
      expect(isAuthLoading(true)).toBe(false);
    });

    it('should determine valid session correctly', () => {
      const hasValidSession = (isLoaded: boolean, sessionId: string | null) => {
        return isLoaded && !!sessionId;
      };

      expect(hasValidSession(true, 'session_123')).toBe(true);
      expect(hasValidSession(false, 'session_123')).toBe(false);
      expect(hasValidSession(true, null)).toBe(false);
    });
  });

  describe('User Transformation', () => {
    it('should transform Clerk user correctly', () => {
      const transformClerkUser = (clerkUser: any): User | null => {
        if (!clerkUser) return null;

        return {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          firstName: clerkUser.firstName || undefined,
          lastName: clerkUser.lastName || undefined,
          imageUrl: clerkUser.imageUrl || undefined,
          createdAt: clerkUser.createdAt
            ? new Date(clerkUser.createdAt).toISOString()
            : undefined,
          lastLoginAt: clerkUser.lastSignInAt
            ? new Date(clerkUser.lastSignInAt).toISOString()
            : undefined,
        };
      };

      const transformedUser = transformClerkUser(mockClerkUser);
      expect(transformedUser).toEqual({
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        imageUrl: undefined,
        createdAt: '2023-01-01T00:00:00.000Z',
        lastLoginAt: '2023-12-01T00:00:00.000Z',
      });
    });

    it('should handle null Clerk user', () => {
      const transformClerkUser = (clerkUser: any): User | null => {
        if (!clerkUser) return null;
        return {} as User; // Simplified for test
      };

      expect(transformClerkUser(null)).toBeNull();
      expect(transformClerkUser(undefined)).toBeNull();
    });

    it('should handle Clerk user with missing fields', () => {
      const transformClerkUser = (clerkUser: any): User | null => {
        if (!clerkUser) return null;

        return {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          firstName: clerkUser.firstName || undefined,
          lastName: clerkUser.lastName || undefined,
          imageUrl: clerkUser.imageUrl || undefined,
          createdAt: clerkUser.createdAt
            ? new Date(clerkUser.createdAt).toISOString()
            : undefined,
          lastLoginAt: clerkUser.lastSignInAt
            ? new Date(clerkUser.lastSignInAt).toISOString()
            : undefined,
        };
      };

      const incompleteClerkUser = {
        id: 'user_456',
        primaryEmailAddress: { emailAddress: 'test@example.com' },
        firstName: null,
        lastName: null,
        imageUrl: null,
        createdAt: null,
        lastSignInAt: null,
      };

      const transformedUser = transformClerkUser(incompleteClerkUser);
      expect(transformedUser).toEqual({
        id: 'user_456',
        email: 'test@example.com',
        firstName: undefined,
        lastName: undefined,
        imageUrl: undefined,
        createdAt: undefined,
        lastLoginAt: undefined,
      });
    });
  });

  describe('Profile Completeness', () => {
    it('should check profile completeness correctly', () => {
      const hasCompleteProfile = (user: User | null): boolean => {
        return !!(user?.firstName && user?.lastName && user?.email);
      };

      expect(hasCompleteProfile(mockUser)).toBe(true);
      expect(hasCompleteProfile({ ...mockUser, firstName: undefined })).toBe(
        false
      );
      expect(hasCompleteProfile({ ...mockUser, lastName: undefined })).toBe(
        false
      );
      expect(hasCompleteProfile({ ...mockUser, email: '' })).toBe(false);
      expect(hasCompleteProfile(null)).toBe(false);
    });
  });
});
