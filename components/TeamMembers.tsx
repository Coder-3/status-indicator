import { useState, useEffect } from "react";
import {
  createStyles,
  Button,
  TextInput,
  Text,
  Title,
  Card,
  Center,
  ScrollArea,
  Modal,
  SegmentedControl,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

const useStyles = createStyles((theme) => ({
  modalButtonsContainer: {
    display: "flex",
    width: "100%",
    justifyContent: "center",
    gap: theme.spacing.xl,
  },

  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.xs,
  },
}));

interface TeamMember {
  id: string;
  email: string | null;
  role: string | null;
}

const MobileTeamMembers = ({
  email,
  teamMembers,
  setEmail,
  setIsRemoveTeamMemberOpen,
  setCurrentTeamMember,
  handleInviteTeamMembers,
}: {
  email: string;
  teamMembers: TeamMember[];
  isRemoveTeamMemberOpen: boolean;
  currentTeamMember: TeamMember | null;
  setEmail: (email: string) => void;
  setIsRemoveTeamMemberOpen: (isRemoveTeamMemberOpen: boolean) => void;
  setCurrentTeamMember: (currentTeamMember: TeamMember) => void;
  handleInviteTeamMembers: (e: any) => void;
}) => {
  const [operationType, setOperationType] = useState("invite");
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <SegmentedControl
        value={operationType}
        onChange={setOperationType}
        data={[
          { label: "Add", value: "invite" },
          { label: "Manage", value: "manage" },
        ]}
      />
      {operationType === "invite" ? (
        <div style={{ marginTop: "12px" }}>
          <Title order={2} mt="xs">
            Add Team Member
          </Title>
          <form style={{ width: "100%" }} onSubmit={handleInviteTeamMembers}>
            <TextInput
              label="Email"
              placeholder="Enter email"
              required
              onChange={(e) => setEmail(e.currentTarget.value)}
              value={email}
              mt="sm"
            />
            <Button type="submit" variant="outline" color="blue" mt={20}>
              Add Team Member
            </Button>
          </form>
        </div>
      ) : (
        <div style={{ marginTop: "12px" }}>
          <Title order={2} mt="xs">
            Manage Team Members
          </Title>
          {teamMembers.map((teamMember) => (
            <Card
              withBorder
              key={teamMember.email}
              style={{
                display: "flex",
                flexDirection: "column",
              }}
              mb="sm"
              mt="sm"
            >
              <div
                style={{
                  display: "flex",
                  alignContent: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{ alignSelf: "center" }}
                  key={teamMember.email}
                  mr="lg"
                >
                  {teamMember.email}
                </Text>
                <Button
                  onClick={() => {
                    setCurrentTeamMember(teamMember);
                    setIsRemoveTeamMemberOpen(true);
                  }}
                  variant="outline"
                  color="red"
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const TeamMembers = () => {
  const [supabase] = useState(() => createBrowserSupabaseClient());

  const { classes } = useStyles();

  const [email, setEmail] = useState<string>("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isRemoveTeamMemberOpen, setIsRemoveTeamMemberOpen] = useState(false);
  const [currentTeamMember, setCurrentTeamMember] = useState<TeamMember | null>(
    null
  );
  const isMobile = useMediaQuery("(max-width: 768px)", true, {
    getInitialValueInEffect: false,
  });

  const handleGetTeamMembers = async () => {
    try {
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
          const { data: data2, error: error2 } = await supabase
            .from("users")
            .select("id, email, role")
            .eq("organisation", data[0]["organisation"]);
          if (error2) throw error2;

          if (data2 && data2[0]) {
            setTeamMembers(data2);
          }
        }
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  const handleRemoveTeamMember = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && user.id && user.id === currentTeamMember!.id) {
        alert(
          "You must first transfer ownership of the organisation to another team member before you can remove yourself."
        );
        return;
      }
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", currentTeamMember!.id);
      if (error) throw error;
      handleGetTeamMembers();
      setCurrentTeamMember(null);
      setIsRemoveTeamMemberOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleInviteTeamMembers = async (e: any) => {
    e.preventDefault();
    const url =
      process.env.NEXT_PUBLIC_ENV === "local"
        ? "http://localhost:3000/api/inviteTeamMember"
        : "https://status-indicator.vercel.app/api/inviteTeamMember";

    try {
      const response = await window.fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });
      if (response.status === 200) {
        handleGetTeamMembers();
        setEmail("");
      }
      console.log("this is the response", response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetTeamMembers();
  }, []);

  return (
    <div style={{ display: "flex", width: "100%" }}>
      <Modal
        title="Remove team member"
        opened={isRemoveTeamMemberOpen}
        onClose={() => setIsRemoveTeamMemberOpen(false)}
      >
        <>
          <Text>
            Are you sure you want to remove {currentTeamMember?.email} from the
            organisation?
          </Text>
          <div className={classes.modalButtonsContainer}>
            <Button
              onClick={() => setIsRemoveTeamMemberOpen(false)}
              color="gray"
              variant="outline"
              style={{ marginTop: 16 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemoveTeamMember}
              color="red"
              variant="outline"
              style={{ marginTop: 16 }}
            >
              Delete
            </Button>
          </div>
        </>
      </Modal>
      {isMobile ? (
        <MobileTeamMembers
          teamMembers={teamMembers}
          handleInviteTeamMembers={handleInviteTeamMembers}
          email={email}
          setEmail={setEmail}
          isRemoveTeamMemberOpen={isRemoveTeamMemberOpen}
          setIsRemoveTeamMemberOpen={setIsRemoveTeamMemberOpen}
          currentTeamMember={currentTeamMember}
          setCurrentTeamMember={setCurrentTeamMember}
        />
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              flexGrow: 1,
            }}
          >
            <Center
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <Title order={2}>Add Team Members</Title>
              <form
                style={{ width: "100%" }}
                onSubmit={handleInviteTeamMembers}
              >
                <TextInput
                  label="Email"
                  placeholder="Enter email"
                  required
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  value={email}
                  mt="lg"
                />
                <Button type="submit" variant="outline" color="blue" mt={20}>
                  Add Team Member
                </Button>
              </form>
            </Center>
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              flexDirection: "column",
              flexGrow: 1,
            }}
          >
            <Center style={{ display: "flex", flexDirection: "column" }}>
              <Title order={2}>Team Members</Title>
              <ScrollArea style={{ height: "80vh" }} mt="xl">
                {teamMembers.map((teamMember) => (
                  <Card
                    withBorder
                    key={teamMember.email}
                    style={{
                      display: "flex",
                      width: "400px",
                      flexDirection: "column",
                    }}
                    mb="sm"
                  >
                    <div
                      style={{
                        display: "flex",
                        alignContent: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{ alignSelf: "center" }}
                        key={teamMember.email}
                      >
                        {teamMember.email}
                      </Text>
                      <Button
                        onClick={() => {
                          setCurrentTeamMember(teamMember);
                          setIsRemoveTeamMemberOpen(true);
                        }}
                        variant="outline"
                        color="red"
                      >
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}
              </ScrollArea>
            </Center>
          </div>
        </>
      )}
    </div>
  );
};

export default TeamMembers;
