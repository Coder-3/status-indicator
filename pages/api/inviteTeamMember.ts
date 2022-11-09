import { NextApiHandler } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

const ProtectedRoute: NextApiHandler = async (req, res) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient({ req, res });
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session)
    return res.status(401).json({
      error: "not_authenticated",
      description:
        "The user does not have an active session or is not authenticated",
    });

  try {
    if (req && req.body && req.body.email) {
      const email = req.body.email;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && user.id) {
        const { data, error } = await supabase
          .from("users")
          .select("organisation")
          .eq("id", user.id);
        if (error) throw error;

        if (data && data[0] && data[0]["organisation"]) {
          const { data: data2, error: error2 } = await supabase.auth.signUp({
            email,
            password: Math.random().toString(36).slice(-16),
          });
          console.log("data2", data2);
          if (error2) throw error2;
          if (data2 && data2.user && data2.user.id) {
            const { error: error3 } = await supabase
              .from("users")
              .update({
                email,
                role: "team_member",
                organisation: data[0]["organisation"],
              })
              .eq("id", data2.user.id);
            if (error3) throw error3;
            const { error: error4 } = await supabase.auth.signInWithOtp({
              email,
            });
            if (error4) throw error4;
          }
        }
      }
      res.status(200).json({ success: true });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export default ProtectedRoute;
