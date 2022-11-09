import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  createBrowserSupabaseClient,
  Session,
} from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { AppProps } from "next/app";

function MyApp({
  Component,
  pageProps,
}: AppProps<{ initialSession: Session }>) {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/");
        }}
      >
        Logout
      </button>

      <Component {...pageProps} />
    </SessionContextProvider>
  );
}

export default MyApp;
