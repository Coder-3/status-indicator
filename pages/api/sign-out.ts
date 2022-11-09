import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function signOut(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabaseClient = createServerSupabaseClient({ req, res });
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    return res.send({ error });
  }
  res.send({ data: true });
}
