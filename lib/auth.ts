import NextAuth from 'next-auth';
import Twitter from 'next-auth/providers/twitter';
import GitHub from 'next-auth/providers/github';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        if (account.provider === 'twitter') {
          // Twitter OAuth 2.0 nests under data.username, OAuth 1.0a uses screen_name at root
          const p = profile as Record<string, unknown>;
          const data = p.data as Record<string, unknown> | undefined;
          token.provider = 'twitter';
          token.providerUsername =
            (data?.username as string) ||
            (p.username as string) ||
            (p.screen_name as string) ||
            '';
          token.avatar =
            (data?.profile_image_url as string) ||
            (p.profile_image_url as string) ||
            token.picture || '';
        } else if (account.provider === 'github') {
          token.provider = 'github';
          token.providerUsername = (profile as Record<string, unknown>).login as string || '';
          token.avatar = (profile as Record<string, unknown>).avatar_url as string || token.picture || '';
        }

        // Resolve Bags wallet from social identity
        try {
          const wallet = await resolveWalletFromBags(
            token.provider as string,
            token.providerUsername as string,
          );
          token.wallet = wallet;
        } catch {
          token.wallet = null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.provider = token.provider as string;
      session.user.providerUsername = token.providerUsername as string;
      session.user.wallet = token.wallet as string | null;
      session.user.avatar = token.avatar as string || session.user.image || '';
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
});

/**
 * Resolve a social identity to a Bags Privy wallet via their API.
 * GET /token-launch/fee-share/wallet/v2?provider=twitter&username=handle
 */
async function resolveWalletFromBags(
  provider: string,
  username: string,
): Promise<string | null> {
  if (!username || !provider) return null;

  const apiKey = process.env.BAGS_API_KEY;
  if (!apiKey) return null;

  const url = new URL('https://public-api-v2.bags.fm/api/v1/token-launch/fee-share/wallet/v2');
  url.searchParams.set('provider', provider);
  url.searchParams.set('username', username);

  const res = await fetch(url.toString(), {
    headers: { 'x-api-key': apiKey },
  });

  if (!res.ok) return null;

  const json = await res.json();
  if (!json.success || !json.response?.wallet) return null;

  return json.response.wallet;
}
