import { auth } from './auth';
import { resolveTokenRole, TokenRole } from './resolve-role';
import type { NextRequest } from 'next/server';

export interface AuthenticatedUser {
  provider: string;
  providerUsername: string;
  wallet: string | null;
  role: TokenRole;
  name?: string | null;
  avatar?: string;
}

/**
 * Get the authenticated user and their role for a specific token mint.
 * Use this in API routes instead of trusting wallet in request body.
 *
 * Returns null if not authenticated.
 */
export async function getAuthenticatedUser(
  mint?: string,
): Promise<AuthenticatedUser | null> {
  const session = await auth();
  if (!session?.user?.provider || !session?.user?.providerUsername) {
    return null;
  }

  const { provider, providerUsername, wallet, name, avatar } = session.user;

  // If a mint is provided, resolve role for that token
  let role: TokenRole = 'visitor';
  if (mint) {
    const result = await resolveTokenRole(mint, provider, providerUsername, wallet);
    role = result.role;
  }

  return {
    provider,
    providerUsername,
    wallet,
    role,
    name,
    avatar,
  };
}

/**
 * Require authentication on an API route. Returns the user or a 401 Response.
 */
export async function requireAuth(
  mint?: string,
): Promise<AuthenticatedUser | Response> {
  const user = await getAuthenticatedUser(mint);
  if (!user) {
    return Response.json(
      { error: 'Authentication required. Sign in with X or GitHub.' },
      { status: 401 },
    );
  }
  return user;
}

/**
 * Require a specific role (or higher) for an API route.
 * Role hierarchy: creator > admin > holder > visitor
 */
const ROLE_HIERARCHY: TokenRole[] = ['visitor', 'holder', 'admin', 'creator'];

export async function requireRole(
  mint: string,
  minRole: TokenRole,
): Promise<AuthenticatedUser | Response> {
  const user = await getAuthenticatedUser(mint);
  if (!user) {
    return Response.json(
      { error: 'Authentication required. Sign in with X or GitHub.' },
      { status: 401 },
    );
  }

  const userLevel = ROLE_HIERARCHY.indexOf(user.role);
  const requiredLevel = ROLE_HIERARCHY.indexOf(minRole);

  if (userLevel < requiredLevel) {
    return Response.json(
      { error: `Requires ${minRole} role. You are: ${user.role}` },
      { status: 403 },
    );
  }

  return user;
}

/**
 * Extract wallet from authenticated session OR fall back to request body.
 * During migration: prefers session wallet, falls back to body.wallet for
 * users still using wallet-adapter.
 */
export async function getWalletFromAuthOrBody(
  request: NextRequest,
  mint?: string,
): Promise<{ wallet: string; user: AuthenticatedUser | null } | Response> {
  // Try session first
  const user = await getAuthenticatedUser(mint);
  if (user?.wallet) {
    return { wallet: user.wallet, user };
  }

  // Fall back to request body for wallet-adapter users
  try {
    const body = await request.clone().json();
    if (body.wallet && typeof body.wallet === 'string') {
      return { wallet: body.wallet, user };
    }
  } catch {
    // no body or not JSON
  }

  return Response.json(
    { error: 'No wallet found. Sign in or connect a wallet.' },
    { status: 401 },
  );
}
