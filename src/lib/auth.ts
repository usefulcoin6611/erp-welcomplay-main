import { authClient } from "./auth-client";

export type UserRole = 'super admin' | 'company' | 'client' | 'employee'

export interface User {
  id?: number | string
  email: string
  name: string
  type: UserRole
  avatar?: string
  branchId?: string
  departmentId?: string
  /** Access profile permissions. null = no profile, undefined = not loaded, string[] = profile permissions. */
  permissions?: string[] | null
  /** Access profile display name when assigned. */
  accessProfileName?: string | null
  plan?: string | null
  planExpireDate?: Date | string | null
  isActive?: boolean
  created_at?: string
  updated_at?: string
}

export interface LoginCredentials {
  email: string
  password?: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data?: {
    token: string
    user: User
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data, error } = await authClient.signIn.email({
      email: credentials.email,
      password: credentials.password || "",
    });

    if (error) {
      return {
        success: false,
        message: error.message || "Login failed",
      };
    }

    const responseUser: User = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      type: (data.user as any).role as UserRole,
      avatar: data.user.image || undefined,
      branchId: (data.user as any).branchId,
      departmentId: (data.user as any).departmentId,
      plan: (data.user as any).plan,
      planExpireDate: (data.user as any).planExpireDate,
      isActive: (data.user as any).isActive,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(responseUser));
      localStorage.setItem('token', 'session'); // Placeholder
    }

    return {
      success: true,
      message: "Login successful",
      data: {
        token: "session",
        user: responseUser,
      },
    };
  },

  async logout() {
    await authClient.signOut();
    this.clearStoredUser();
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: session } = await authClient.getSession();
    if (!session) {
      this.clearStoredUser();
      return null;
    }

    const currentUser: User = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      type: (session.user as any).role as UserRole,
      avatar: session.user.image || undefined,
      branchId: (session.user as any).branchId,
      departmentId: (session.user as any).departmentId,
      plan: (session.user as any).plan,
      planExpireDate: (session.user as any).planExpireDate,
      isActive: (session.user as any).isActive,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(currentUser));
    }

    return currentUser;
  },

  isAuthenticated(): boolean {
    // BetterAuth manages session via cookies. 
    // For a simple check, we can't easily do it synchronously without a state manager,
    // but the AuthProvider will handle the async check.
    return true; 
  },

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Fetches current user's access profile permissions and name from API (cookie-based auth).
   * Returns { permissions, accessProfileName }. permissions: string[] when profile assigned, null otherwise.
   */
  async getPermissions(): Promise<{ permissions: string[] | null; accessProfileName: string | null }> {
    if (typeof window === 'undefined') return { permissions: null, accessProfileName: null };
    try {
      const res = await fetch('/api/auth/permissions', { credentials: 'include' });
      const json = await res.json();
      if (!json?.success) return { permissions: null, accessProfileName: null };
      const permissions = json.permissions === null ? null : Array.isArray(json.permissions) ? json.permissions : null;
      const accessProfileName = typeof json.accessProfileName === 'string' ? json.accessProfileName : null;
      return { permissions, accessProfileName };
    } catch {
      return { permissions: null, accessProfileName: null };
    }
  },

  clearStoredUser() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
};
