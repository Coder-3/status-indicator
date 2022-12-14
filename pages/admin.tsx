import { useState, useEffect, useCallback } from "react";
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
  NextPage,
  PreviewData,
} from "next";
import Head from "next/head";
import {
  createStyles,
  Table,
  Modal,
  Button,
  Group,
  TextInput,
  Select,
  ActionIcon,
  Text,
  Title,
  AppShell,
  Header,
  Card,
  Badge,
  Affix,
} from "@mantine/core";
import { Prism } from "@mantine/prism";
import {
  IconPencil,
  IconTrash,
  IconRefresh,
  IconCode,
  IconPlus,
  IconWorldUpload,
  IconSearch,
  IconSettings,
} from "@tabler/icons";
import { useRouter } from "next/router";
import { useMediaQuery } from "@mantine/hooks";
import { Facility } from "../types/types";
import { isFacilityOpen } from "../utils/facilities";
import TeamMembers from "../components/TeamMembers";
import MobileFacilities from "../components/MobileFacilities";
import RefreshModal from "../components/RefreshModal";
import AddEditFacilityModal from "../components/AddEditFacilitiesModal";
import {
  createBrowserSupabaseClient,
  createServerSupabaseClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { ParsedUrlQuery } from "querystring";

interface Props {
  user: User;
}

export const getServerSideProps = async (
  ctx:
    | GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
    | { req: NextApiRequest; res: NextApiResponse<any> }
) => {
  const supabase = createServerSupabaseClient(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };

  return {
    props: {
      initialSession: session,
      user: session.user,
    },
  };
};

const useStyles = createStyles((theme) => ({
  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.xs,
  },
  modalButtonsContainer: {
    display: "flex",
    width: "100%",
    justifyContent: "center",
    gap: theme.spacing.xl,
  },
}));

const DeleteFacilityModal = ({
  facilities,
  facility,
  setIsModalOpen,
  setFacilities,
  setIsUnsavedChanges,
}: {
  facilities: Facility[];
  facility: Facility | null;
  setIsModalOpen: (isModalOpen: boolean) => void;
  setFacilities: (facilities: Facility[]) => void;
  setIsUnsavedChanges: (isUnsavedChanges: boolean) => void;
}) => {
  const { classes } = useStyles();

  const handleDelete = async () => {
    if (facility && facility.id) {
      const newFacilities = facilities.map((f) => {
        if (f.id === facility.id) {
          return { ...f, deleted: true };
        } else {
          return f;
        }
      });
      setFacilities(newFacilities);
    }
    setIsUnsavedChanges(true);
    setIsModalOpen(false);
  };

  return (
    <>
      <Text>Are you sure you want to delete {facility?.name}?</Text>
      <div className={classes.modalButtonsContainer}>
        <Button
          onClick={() => setIsModalOpen(false)}
          color="gray"
          variant="outline"
          style={{ marginTop: 16 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="red"
          variant="outline"
          style={{ marginTop: 16 }}
        >
          Delete
        </Button>
      </div>
    </>
  );
};

const RowActionButtons = ({
  facility,
  isMobile,
  setIsAddEditModalOpen,
  setIsDeleteModalOpen,
  setCurrentFacility,
}: {
  facility: Facility | null;
  isMobile: boolean;
  setIsAddEditModalOpen: (isModalOpen: boolean) => void;
  setIsDeleteModalOpen: (isModalOpen: boolean) => void;
  setCurrentFacility: (facility: Facility | null) => void;
}) => {
  const handleDelete = async () => {
    if (facility) {
      setCurrentFacility(facility);
      setIsDeleteModalOpen(true);
    }
  };

  const handleEdit = () => {
    if (facility) {
      setCurrentFacility(facility);
      setIsAddEditModalOpen(true);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        alignItems: "center",
        justifyContent: isMobile ? "center" : "flex-start",
        gap: isMobile ? 10 : 0,
      }}
    >
      <ActionIcon
        size="xl"
        title="Edit"
        variant="filled"
        color="blue"
        onClick={handleEdit}
        mr={isMobile ? 0 : "sm"}
      >
        <IconPencil size={18} />
      </ActionIcon>
      <ActionIcon
        size="xl"
        title="Delete"
        variant="filled"
        color="blue"
        onClick={handleDelete}
      >
        <IconTrash size={18} />
      </ActionIcon>
    </div>
  );
};

const FacilitiesTable = ({ tableData }: { tableData: any[] }) => {
  const [status, setStatus] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const filteredTableData = tableData.filter((item) => {
    const searchMatch = item.name.toLowerCase().includes(search.toLowerCase());
    let statusMatch = true;
    if (status === "Open" && !isFacilityOpen(item.status.props.facility)) {
      statusMatch = false;
    } else if (
      status === "Closed" &&
      isFacilityOpen(item.status.props.facility)
    ) {
      statusMatch = false;
    }
    return searchMatch && statusMatch;
  });

  const rows = filteredTableData.map((facility) => (
    <tr key={facility.id}>
      <td>{facility.name}</td>
      <td>{facility.status}</td>
      <td>{facility.notes}</td>
      <td>{facility.scheduledMaintenance}</td>
      <td>{facility.edit}</td>
    </tr>
  ));

  return (
    <Table>
      <thead>
        <tr>
          <th>
            <TextInput
              icon={<IconSearch size={16} />}
              placeholder="Search facility name"
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              style={{ maxWidth: "300px" }}
            />
          </th>
          <th>
            <Select
              data={["Open", "Closed"]}
              placeholder="Status"
              searchable
              clearable
              value={status}
              onChange={setStatus}
              style={{ maxWidth: "300px" }}
            />
          </th>
          <th>Notes</th>
          <th>Scheduled Maintenance</th>
          <th>Edit</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
  );
};

const CopyIFrameModal = () => {
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [organisationId, setOrganisationId] = useState("");

  const getOrganisationId = useCallback(async () => {
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
        if (data && data[0] && data[0].organisation) {
          setOrganisationId(data[0].organisation);
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  }, [supabase]);

  useEffect(() => {
    getOrganisationId();
  }, [getOrganisationId]);

  const url = window.location.href.substring(
    0,
    window.location.href.length - 6
  );
  const iFrameString = `
  <iframe src="${url}/organisations/${organisationId}" width="100%" height="100%"></iframe>
  `;

  return (
    <div style={{ maxWidth: "80vw" }}>
      <Prism language="markup">{iFrameString}</Prism>
    </div>
  );
};

const PublishModal = ({
  setIsModalOpen,
  handlePublish,
}: {
  setIsModalOpen: (isModalOpen: boolean) => void;
  handlePublish: () => void;
}) => {
  const { classes } = useStyles();

  return (
    <>
      <Text>Are you sure you want to publish this page?</Text>
      <div className={classes.modalButtonsContainer}>
        <Button
          onClick={() => setIsModalOpen(false)}
          color="gray"
          variant="outline"
          style={{ marginTop: 16 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handlePublish}
          color="green"
          variant="outline"
          style={{ marginTop: 16 }}
        >
          Publish
        </Button>
      </div>
    </>
  );
};

const FacilityStatus = ({ facility }: { facility: Facility }) => (
  <>
    <Badge
      variant="filled"
      color={isFacilityOpen(facility) ? "green" : "red"}
      style={{ width: "100px" }}
      radius="sm"
    >
      {isFacilityOpen(facility) ? "Open" : "Closed"}
    </Badge>
  </>
);

const Admin: NextPage = ({ initialSession, user }: any) => {
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [currentFacility, setCurrentFacility] = useState<Facility | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [isCopyIFrameModalOpen, setIsCopyIframeModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isRefreshModalOpen, setIsRefreshModalOpen] = useState(false);
  const [isUnsavedChanges, setIsUnsavedChanges] = useState(false);
  const [isTeamMembersModalOpen, setIsTeamMembersModalOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const isMobile = useMediaQuery("(max-width: 768px)", true, {
    getInitialValueInEffect: false,
  });

  const [supabase] = useState(() => createBrowserSupabaseClient());

  const getUserRole = useCallback(async () => {
    try {
      if (user && user.id) {
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id);
        if (error) throw error;
        if (data && data[0] && data[0].role) {
          setUserRole(data[0].role);
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  }, [user]);

  useEffect(() => {
    getUserRole();
  }, [getUserRole]);

  const getFacilities = useCallback(async () => {
    try {
      if (user && user.id) {
        const { data, error } = await supabase
          .from("users")
          .select("organisation")
          .eq("id", user.id);
        if (error) throw error;
        if (data && data[0] && data[0].organisation) {
          const { data: data2, error: error2 } = await supabase
            .from("facilities")
            .select("*")
            .match({ organisation: data[0].organisation, deleted: "false" });
          if (error2) throw error2;
          if (data2 && data2.length > 0) {
            setFacilities(data2.sort((a, b) => a.name.localeCompare(b.name)));
          }
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  }, [supabase, user]);

  const getOrdinalSuffix = (i: number) => {
    const j = i % 10,
      k = i % 100;
    if (j == 1 && k != 11) {
      return i + "st";
    }
    if (j == 2 && k != 12) {
      return i + "nd";
    }
    if (j == 3 && k != 13) {
      return i + "rd";
    }
    return i + "th";
  };

  const createClosureDateTimeRange = useCallback((facility: Facility) => {
    if (
      !facility ||
      !facility.closure_start_date ||
      !facility.closure_start_time ||
      !facility.closure_end_date ||
      !facility.closure_end_time
    ) {
      return "No maintenance scheduled";
    }

    const {
      closure_start_date,
      closure_start_time,
      closure_end_date,
      closure_end_time,
    } = facility;

    const startDate = new Date(closure_start_date);
    const endDate = new Date(closure_end_date);
    const startTime = new Date(closure_start_time);
    const endTime = new Date(closure_end_time);

    const startDateTime = `${getOrdinalSuffix(
      startDate.getDate()
    )} ${startDate.toLocaleString("default", {
      month: "long",
    })} ${startDate.getFullYear()} ${new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(startTime)}`;
    const endDateTime = `${getOrdinalSuffix(
      endDate.getDate()
    )} ${endDate.toLocaleString("default", {
      month: "long",
    })} ${endDate.getFullYear()} ${new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(endTime)}`;

    return `${startDateTime} - ${endDateTime}`;
  }, []);

  const createTableData = useCallback(() => {
    const facilitiesAsTableData = facilities
      .filter((facility) => facility.deleted === false)
      .map((facility: Facility) => {
        return {
          id: facility.id,
          name: facility.name,
          status: <FacilityStatus facility={facility} />,
          notes: facility.notes,
          edit: (
            <RowActionButtons
              facility={facility}
              isMobile={isMobile}
              setIsAddEditModalOpen={setIsAddEditModalOpen}
              setIsDeleteModalOpen={setIsDeleteModalOpen}
              setCurrentFacility={setCurrentFacility}
            />
          ),
          scheduledMaintenance: (
            <Text>{createClosureDateTimeRange(facility)}</Text>
          ),
        };
      });
    setTableData(facilitiesAsTableData);
  }, [createClosureDateTimeRange, facilities, isMobile]);

  useEffect(() => {
    getFacilities();
  }, [getFacilities]);

  useEffect(() => {
    createTableData();
  }, [facilities, createTableData]);

  const handleSignout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  const handlePublish = async () => {
    try {
      const { error } = await supabase.from("facilities").upsert(facilities);
      if (error) throw error;
      setIsPublishModalOpen(false);
      setIsUnsavedChanges(false);
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  return (
    <>
      <AppShell
        header={
          <Header
            height={60}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            px="md"
          >
            <div>
              <Title order={1} size={isMobile ? "h4" : "h2"}>
                Status Indicator
              </Title>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Button onClick={handleSignout} color="gray" variant="outline">
                Sign Out
              </Button>
              {userRole === "admin" && (
                <ActionIcon
                  onClick={() => setIsTeamMembersModalOpen(true)}
                  variant="outline"
                  size="lg"
                  ml="md"
                >
                  <IconSettings />
                </ActionIcon>
              )}
            </div>
          </Header>
        }
        styles={(theme) => ({
          main: {
            paddingLeft: isMobile ? theme.spacing.sm : theme.spacing.lg,
            paddingRight: isMobile ? theme.spacing.sm : theme.spacing.lg,
          },
        })}
      >
        <Head>
          <title>Status Indicator</title>
          <meta name="description" content="Status Indicator" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          <Modal
            title="Team Members"
            opened={isTeamMembersModalOpen}
            onClose={() => setIsTeamMembersModalOpen(false)}
            fullScreen
          >
            <TeamMembers />
          </Modal>
          <Modal
            opened={isAddEditModalOpen}
            onClose={() => setIsAddEditModalOpen(false)}
            title={currentFacility ? "Edit Facility" : "Add Facility"}
            styles={{
              inner: {
                marginBottom: 70,
              },
            }}
          >
            <AddEditFacilityModal
              facilities={facilities}
              facility={currentFacility}
              isMobile={isMobile}
              setIsModalOpen={setIsAddEditModalOpen}
              setFacilities={setFacilities}
              setIsUnsavedChanges={setIsUnsavedChanges}
            />
          </Modal>
          <Modal
            opened={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Delete Facility"
          >
            <DeleteFacilityModal
              facilities={facilities}
              facility={currentFacility}
              setIsModalOpen={setIsDeleteModalOpen}
              setFacilities={setFacilities}
              setIsUnsavedChanges={setIsUnsavedChanges}
            />
          </Modal>
          <Modal
            opened={isCopyIFrameModalOpen}
            onClose={() => setIsCopyIframeModalOpen(false)}
            title="Copy iFrame"
          >
            <CopyIFrameModal />
          </Modal>
          <Modal
            opened={isPublishModalOpen}
            onClose={() => setIsPublishModalOpen(false)}
            title="Publish"
          >
            <PublishModal
              setIsModalOpen={setIsPublishModalOpen}
              handlePublish={handlePublish}
            />
          </Modal>
          <Modal
            opened={isRefreshModalOpen}
            onClose={() => setIsRefreshModalOpen(false)}
            title="Refresh"
          >
            <RefreshModal
              setIsModalOpen={setIsRefreshModalOpen}
              getFacilities={getFacilities}
            />
          </Modal>
          <Group position="right">
            {!isMobile ? (
              <div style={{ display: "flex", gap: "10px" }}>
                {isUnsavedChanges ? (
                  <Button
                    onClick={() => setIsRefreshModalOpen(true)}
                    mb="xs"
                    leftIcon={<IconRefresh />}
                  >
                    Refresh
                  </Button>
                ) : (
                  <Button
                    onClick={getFacilities}
                    mb="xs"
                    leftIcon={<IconRefresh />}
                  >
                    Refresh
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setCurrentFacility(null);
                    setIsCopyIframeModalOpen(true);
                  }}
                  mb="xs"
                  leftIcon={<IconCode />}
                >
                  Copy iFrame
                </Button>
                <Button
                  onClick={() => {
                    setCurrentFacility(null);
                    setIsAddEditModalOpen(true);
                  }}
                  mb="xs"
                  leftIcon={<IconPlus />}
                >
                  Add Facility
                </Button>
                <Button
                  disabled={!isUnsavedChanges}
                  onClick={() => setIsPublishModalOpen(true)}
                  mb="xs"
                  leftIcon={<IconWorldUpload />}
                >
                  Publish
                </Button>
              </div>
            ) : (
              <Affix style={{ width: "100%" }} position={{ bottom: 0 }}>
                <Card
                  withBorder
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                    gap: 10,
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  {isUnsavedChanges ? (
                    <ActionIcon
                      title="Refresh"
                      variant="filled"
                      color="blue"
                      size="xl"
                      onClick={() => setIsRefreshModalOpen(true)}
                    >
                      <IconRefresh />
                    </ActionIcon>
                  ) : (
                    <ActionIcon
                      title="Refresh"
                      variant="filled"
                      color="blue"
                      size="xl"
                      onClick={getFacilities}
                    >
                      <IconRefresh />
                    </ActionIcon>
                  )}
                  <ActionIcon
                    title="Copy iFrame"
                    variant="filled"
                    color="blue"
                    size="xl"
                    onClick={() => {
                      setCurrentFacility(null);
                      setIsCopyIframeModalOpen(true);
                    }}
                  >
                    <IconCode />
                  </ActionIcon>
                  <ActionIcon
                    title="Add Facility"
                    variant="filled"
                    color="blue"
                    size="xl"
                    onClick={() => {
                      setCurrentFacility(null);
                      setIsAddEditModalOpen(true);
                    }}
                  >
                    <IconPlus />
                  </ActionIcon>
                  <ActionIcon
                    title="Publish"
                    variant="filled"
                    color="blue"
                    size="xl"
                    disabled={!isUnsavedChanges}
                    onClick={() => setIsPublishModalOpen(true)}
                  >
                    <IconWorldUpload />
                  </ActionIcon>
                </Card>
              </Affix>
            )}
          </Group>
          <div style={{ display: isMobile ? "none" : "" }}>
            <FacilitiesTable tableData={tableData} />
          </div>
          <div style={{ display: isMobile ? "" : "none" }}>
            <MobileFacilities tableData={tableData} />
          </div>
        </main>
      </AppShell>
    </>
  );
};

export default Admin;
