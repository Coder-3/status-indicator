import {
  useUser,
  useSessionContext,
  useSupabaseClient,
} from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import type { NextPage } from "next";
import { useRouter } from "next/router";

const LoginPage: NextPage = () => {
  const router = useRouter();
  const user = useUser();
  const { isLoading, session } = useSessionContext();
  const supabaseClient = useSupabaseClient();

  console.log("session", session, "user", user, "isLoading", isLoading);

  if (user && session) {
    router.push("/admin");
  }

  return (
    <>
      <Auth
        redirectTo="http://localhost:3000/admin"
        appearance={{ theme: ThemeSupa }}
        supabaseClient={supabaseClient}
      />
    </>
  );
};

export default LoginPage;
