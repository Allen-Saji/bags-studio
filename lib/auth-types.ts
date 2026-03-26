import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      provider: string;
      providerUsername: string;
      wallet: string | null;
      avatar: string;
    };
  }

  interface JWT {
    provider?: string;
    providerUsername?: string;
    wallet?: string | null;
    avatar?: string;
  }
}
