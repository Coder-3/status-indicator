import {
  createBrowserSupabaseClient,
  User,
  withPageAuth,
} from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

interface Props {
  user: User;
}

export const getServerSideProps: GetServerSideProps<Props> = withPageAuth({
  redirectTo: "/admin",
  async getServerSideProps(ctx, supabase) {
    const {
      data: { user: user },
    } = await supabase.auth.getUser();
    console.log("this is the index user", user);
    return { props: { user } };
  },
});

export default function HomePage({ user }: Props) {
  const router = useRouter();
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <main>
      <section>
        <div> Signed in as: {user?.email}</div>
        <button
          onClick={async () => {
            await supabaseClient.auth.signOut();
            router.push("/sign-in");
          }}
        >
          Logout
        </button>
      </section>
    </main>
  );
}
