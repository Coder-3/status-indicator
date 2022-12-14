import { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { supabase } from "../utils/supabaseClient";
import {
  Button,
  Title,
  SegmentedControl,
  Loader,
  Input,
  PasswordInput,
  Stack,
  Container,
} from "@mantine/core";
import { useState } from "react";
import { useRouter } from "next/router";
import { useMediaQuery } from "@mantine/hooks";

const LoginPage: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [teamMemberEmail, setTeamMemberEmail] = useState("");
  const [password, setPassword] = useState("");
  const [operationType, setOperationType] = useState("signup");
  const isSmallScreen = useMediaQuery("(max-width: 500px)", true, {
    getInitialValueInEffect: false,
  });

  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (error) throw error;
      if (user && user.id) {
        const { data, error: error2 } = await supabase
          .from("users")
          .select("organisation")
          .eq("id", user.id);
        if (error2) throw error2;
        if (data && data[0] && data[0].organisation) {
          router.push("/admin");
        } else {
          router.push("/createOrganisation");
        }
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (error) throw error;
      if (user && user.id) {
        const { error: error2 } = await supabase
          .from("users")
          .update({
            email,
          })
          .eq("id", user.id);
        if (error2) throw error2;
        router.push("/createOrganisation");
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamMemberLogin = async (e: any) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: teamMemberEmail,
      });
      if (error) throw error;
      router.push("/admin");
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  return (
    <Container size="xs">
      <Head>
        <title>Login</title>
      </Head>
      <Stack align="center">
        <Title my={20} order={1}>
          Login or Signup
        </Title>
        <SegmentedControl
          value={operationType}
          onChange={setOperationType}
          orientation={isSmallScreen ? "vertical" : "horizontal"}
          data={[
            { label: "Team Member Login", value: "tLogin" },
            { label: "Admin Login", value: "aLogin" },
            { label: "Admin Signup", value: "signup" },
          ]}
        />
        {loading ? (
          <Loader />
        ) : operationType === "tLogin" ? (
          <form style={{ width: "100%" }} onSubmit={handleTeamMemberLogin}>
            <Input
              id="email"
              type="email"
              placeholder="Your email"
              value={teamMemberEmail}
              required
              onChange={(e: any) => setTeamMemberEmail(e.currentTarget.value)}
            />
            <Button mt="sm" type="submit" style={{ width: "100%" }}>
              Login
            </Button>
          </form>
        ) : operationType === "aLogin" ? (
          <form style={{ width: "100%" }} onSubmit={handleLogin}>
            <Input
              id="email"
              className="inputField"
              type="email"
              placeholder="Your email"
              value={email}
              required
              onChange={(e: any) => setEmail(e.target.value)}
              mb="sm"
            />
            <PasswordInput
              id="password"
              placeholder="Your password"
              value={password}
              required
              onChange={(e: any) => setPassword(e.target.value)}
            />
            <Button mt="sm" type="submit" style={{ width: "100%" }}>
              Sign In
            </Button>
          </form>
        ) : (
          <form style={{ width: "100%" }} onSubmit={handleSignup}>
            <Input
              id="email"
              className="inputField"
              type="email"
              placeholder="New email"
              value={email}
              required
              onChange={(e: any) => setEmail(e.target.value)}
              mb="sm"
            />
            <PasswordInput
              id="password"
              placeholder="New password"
              value={password}
              required
              onChange={(e: any) => setPassword(e.target.value)}
            />
            <Button mt="sm" type="submit" style={{ width: "100%" }}>
              Sign Up
            </Button>
          </form>
        )}
      </Stack>
    </Container>
  );
};

export default LoginPage;
