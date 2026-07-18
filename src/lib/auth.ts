import { auth, currentUser } from '@clerk/nextjs/server';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  branchId: string | null;
}

export async function getAuthUser(): Promise<AuthUser> {
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!hasClerk) {
    return {
      id: 'mock-user-123',
      name: 'Owner User (Mock)',
      email: 'owner@bizflow.com',
      role: 'OWNER',
      branchId: 'branch-1'
    };
  }

  try {
    const session = await auth();
    const user = await currentUser();
    if (!session.userId || !user) {
      return {
        id: 'anonymous',
        name: 'Viewer',
        email: '',
        role: 'VIEWER',
        branchId: null
      };
    }
    
    const role = (user.publicMetadata.role as string) || 'OWNER';
    const branchId = (user.publicMetadata.branchId as string) || 'branch-1';

    return {
      id: session.userId,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User',
      email: user.emailAddresses[0]?.emailAddress || '',
      role,
      branchId
    };
  } catch (e) {
    return {
      id: 'mock-user-123',
      name: 'Owner User (Mock)',
      email: 'owner@bizflow.com',
      role: 'OWNER',
      branchId: 'branch-1'
    };
  }
}
