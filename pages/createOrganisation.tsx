import { useState, useEffect, useCallback } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { createStyles, Button, TextInput, Container } from "@mantine/core";
import { supabase } from "../utils/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/router";

const useStyles = createStyles((theme) => ({}));

const CreateOrganisation: NextPage = () => {
  const router = useRouter();
  const syles = useStyles();
  const [session, setSession] = useState<Session>();
  const [organisationName, setOrganisationName] = useState("");

  const checkIfAlreadyInOrganisation = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && user.id) {
      const { data, error } = await supabase
        .from("users")
        .select("organisation")
        .eq("id", user.id);

      if (error) throw error;

      if (data && data[0] && data[0].organisation) {
        router.push("/admin");
      }
    }
  }, [router]);

  useEffect(() => {
    checkIfAlreadyInOrganisation();
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
      }
    });
  }, [checkIfAlreadyInOrganisation]);

  const handleCreateOrganisation = async (e: any) => {
    e.preventDefault();
    try {
      const organisationId = Math.floor(10000000 + Math.random() * 90000000);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && user.id) {
        await supabase.from("organisations").insert({
          id: organisationId,
          name: organisationName,
        });
        const { data, error } = await supabase
          .from("users")
          .update({ organisation: organisationId, role: "admin" })
          .eq("id", user.id);
        if (error) throw error;
      }
      router.push("/admin");
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  return (
    <>
      <Head>
        <title>Create Organisation</title>
      </Head>
      <main>
        <Container size="xs">
          <form onSubmit={handleCreateOrganisation}>
            <TextInput
              label="Organisation Name"
              placeholder="Enter your organisation name"
              required
              value={organisationName}
              onChange={(e) => setOrganisationName(e.currentTarget.value)}
            />
            <Button type="submit" variant="outline" color="blue">
              Create Organisation
            </Button>
          </form>
        </Container>
      </main>
    </>
  );
};

export default CreateOrganisation;
