import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function signIn(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email, password } = req.body;

  const supabaseClient = createServerSupabaseClient({ req, res });

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.user) {
    return res.send({ error });
  }

  res.send({ data });
}
