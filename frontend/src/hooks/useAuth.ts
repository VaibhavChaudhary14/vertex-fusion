import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  // Mock user for no-auth access
  const mockUser: User = {
    id: "dev-user",
    email: "dev@example.com",
    firstName: "Dev",
    lastName: "User",
    isEmailVerified: true,
    emailVerificationToken: null,
    profileImageUrl: null,
    passwordHash: "", // Not needed for frontend
    resetPasswordToken: null,
    resetPasswordTokenExpiry: null,
    role: "researcher",
    subscriptionTier: "free",
    apiCallsUsed: 0,
    apiCallsLimit: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
    error: null,
  };
}
