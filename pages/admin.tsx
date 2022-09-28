import { useState, useEffect, useCallback } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import {
  createStyles,
  Table,
  Modal,
  Button,
  Group,
  TextInput,
  Select,
  MultiSelect,
  ActionIcon,
  Text,
  Title,
  AppShell,
  Header,
  Card,
  Badge,
  Affix,
  Textarea,
  Accordion,
} from "@mantine/core";
import { Prism } from "@mantine/prism";
import {
  IconPencil,
  IconTrash,
  IconRefresh,
  IconCode,
  IconPlus,
  IconWorldUpload,
  IconCalendar,
  IconClock,
  IconSearch,
} from "@tabler/icons";
import { supabase } from "../utils/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { useMediaQuery } from "@mantine/hooks";
import { DatePicker, TimeInput } from "@mantine/dates";
import { Facility } from "../types/types";
import { isFacilityOpen } from "../utils/facilities";

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

const AddEditFacilityModal = ({
  facilities,
  facility,
  isMobile,
  setIsModalOpen,
  setFacilities,
  setIsUnsavedChanges,
}: {
  facilities: Facility[];
  facility: Facility | null;
  isMobile: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  setFacilities: (facilities: Facility[]) => void;
  setIsUnsavedChanges: (isUnsavedChanges: boolean) => void;
}) => {
  const { classes } = useStyles();
  const [name, setName] = useState(facility ? facility.name : "");
  const [status, setStatus] = useState<string | null>(
    facility ? (isFacilityOpen(facility) ? "Open" : "Closed") : null
  );
  const [notes, setNotes] = useState(facility ? facility.notes : "");
  const [startTime, setStartTime] = useState<Date | null>(
    facility?.closure_start_time
      ? new Date(facility.closure_start_time)
      : new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [endTime, setEndTime] = useState<Date | null>(
    facility?.closure_end_time
      ? new Date(facility.closure_end_time)
      : new Date(new Date().setHours(23, 59, 59, 999))
  );
  const [closingDay, setClosingDay] = useState<Date | null>(
    facility?.closure_start_date ? new Date(facility.closure_start_date) : null
  );
  const [reOpeningDay, setReOpeningDay] = useState<Date | null>(
    facility?.closure_end_date ? new Date(facility.closure_end_date) : null
  );

  const handleSave = (e: any) => {
    e.preventDefault();

    if (
      (closingDay || reOpeningDay) &&
      !(startTime && endTime && closingDay && reOpeningDay)
    ) {
      alert("Please set all fields for closure");
      return;
    }

    if (
      startTime &&
      endTime &&
      closingDay &&
      reOpeningDay &&
      new Date(closingDay).getTime() + startTime.getTime() >
        new Date(reOpeningDay).getTime() + endTime.getTime()
    ) {
      alert(
        "Please ensure the closure start date and time are before the closure end date and time"
      );
      return;
    }

    const newFacility: any = {
      id: facility ? facility.id : Math.floor(Math.random() * 1000000),
      created_at: facility ? facility.created_at : new Date().toISOString(),
      name,
      status,
      notes,
      order: facility ? facility.order : null,
      deleted: false,
      closure_start_date: closingDay ? closingDay.toISOString() : null,
      closure_end_date: reOpeningDay ? reOpeningDay.toISOString() : null,
      closure_start_time:
        startTime && endTime && closingDay && reOpeningDay
          ? startTime.toISOString()
          : null,
      closure_end_time:
        endTime && startTime && closingDay && reOpeningDay
          ? endTime.toISOString()
          : null,
    };

    if (facility) {
      const newFacilities = facilities.map((facility) => {
        if (facility.id === newFacility.id) {
          return newFacility;
        }
        return facility;
      });
      setFacilities(newFacilities);
    } else {
      setFacilities([...facilities, newFacility]);
    }

    setIsModalOpen(false);
    setIsUnsavedChanges(true);
  };

  return (
    <>
      <form onSubmit={handleSave} className={classes.modalForm}>
        <Accordion
          defaultValue={
            facility?.closure_start_date || facility?.closure_end_date
              ? "scheduledMaintenance"
              : undefined
          }
        >
          <Accordion.Item value="scheduledMaintenance">
            <Accordion.Control>Scheduled Maintenance</Accordion.Control>
            <Accordion.Panel>
              <DatePicker
                label="Closing day"
                placeholder="Select closing day"
                value={closingDay}
                onChange={setClosingDay}
                dropdownType={isMobile ? "modal" : "popover"}
                icon={<IconCalendar size={16} />}
              />
              <TimeInput
                label="Facility closing time"
                format="12"
                value={startTime}
                onChange={setStartTime}
                icon={<IconClock size={16} />}
                clearable
              />
              <DatePicker
                label="Re-opening day"
                placeholder="Select re-opening day"
                value={reOpeningDay}
                onChange={setReOpeningDay}
                dropdownType={isMobile ? "modal" : "popover"}
                icon={<IconCalendar size={16} />}
              />
              <TimeInput
                label="Facility re-opening time"
                format="12"
                value={endTime}
                onChange={setEndTime}
                icon={<IconClock size={16} />}
                clearable
              />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        <TextInput
          label="Name"
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          required
        />
        <Select
          data={["Open", "Closed"]}
          label="Status"
          placeholder="Status"
          searchable
          clearable
          value={status}
          onChange={setStatus}
          required
        />
        <Textarea
          label="Notes"
          placeholder="Notes"
          value={notes}
          onChange={(event) => setNotes(event.currentTarget.value)}
          minRows={8}
        />
        <Group position="center" mt="lg">
          <Button type="submit" fullWidth>
            Save
          </Button>
        </Group>
      </form>
    </>
  );
};

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
  const url = window.location.href.substring(
    0,
    window.location.href.length - 6
  );
  const iFrameString = `
  <iframe
  src=${url}
  width="100%"
  height="100%"
></iframe>
  `;

  return (
    <>
      <Prism language="markup">{iFrameString}</Prism>
    </>
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

const RefreshModal = ({
  setIsModalOpen,
  getFacilities,
}: {
  setIsModalOpen: (isModalOpen: boolean) => void;
  getFacilities: () => void;
}) => {
  const { classes } = useStyles();

  return (
    <>
      <Text>
        Are you sure you want to refresh this page? Any unplished changes will
        be lost
      </Text>
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
          onClick={() => {
            setIsModalOpen(false);
            getFacilities();
          }}
          color="green"
          variant="outline"
          style={{ marginTop: 16 }}
        >
          Refresh
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

const MobileFacility = ({ facility }: { facility: any }) => {
  return (
    <>
      <Card withBorder style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Title order={3}>{facility.name}</Title>
                  {facility.status}
                </div>
                <div>{facility.edit}</div>
              </div>
            </div>
            <Text>{facility.notes}</Text>
            <Text>{facility.scheduledMaintenance}</Text>
          </div>
        </div>
      </Card>
    </>
  );
};

const MobileFacilities = ({ tableData }: { tableData: any[] }) => {
  const [status, setStatus] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const filteredTableData = tableData.filter((item) => {
    const searchMatch = item.name.toLowerCase().includes(search.toLowerCase());
    let statusMatch = true;
    if (status === "Open" && !isFacilityOpen(item.status.props.facility)) {
      statusMatch = false;
    }
    if (status === "Closed" && isFacilityOpen(item.status.props.facility)) {
      statusMatch = false;
    }
    return searchMatch && statusMatch;
  });

  const rows = filteredTableData.map((facility) => (
    <MobileFacility key={facility.id} facility={facility} />
  ));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center",
        paddingBottom: 80,
      }}
    >
      <TextInput
        icon={<IconSearch size={16} />}
        placeholder="Search facility name"
        value={search}
        onChange={(e: any) => setSearch(e.target.value)}
        style={{ width: "100%" }}
        size="lg"
      />
      <Select
        data={["Open", "Closed"]}
        placeholder="Status"
        searchable
        clearable
        value={status}
        onChange={setStatus}
        style={{ width: "100%" }}
        size="lg"
      />
      {rows}
    </div>
  );
};

const Admin: NextPage = () => {
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [currentFacility, setCurrentFacility] = useState<Facility | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isCopyIFrameModalOpen, setIsCopyIframeModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isRefreshModalOpen, setIsRefreshModalOpen] = useState(false);
  const [isUnsavedChanges, setIsUnsavedChanges] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const s = supabase.auth.session();
    if (!s) {
      router.push("/login");
    }
  });

  const getFacilities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("facilities")
        .select("*")
        .eq("deleted", false);
      if (data && data.length > 0) {
        setFacilities(data.sort((a, b) => a.name.localeCompare(b.name)));
      }
      if (error) throw error;
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  }, [setFacilities]);

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

  useEffect(() => {
    setSession(supabase.auth.session());

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const handleSignout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.push("/login");
  };

  const handlePublish = async () => {
    try {
      const { data, error } = await supabase
        .from("facilities")
        .upsert(facilities);
      if (error) throw error;
      if (data) {
        setIsPublishModalOpen(false);
        setIsUnsavedChanges(false);
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  return (
    <>
      {session && (
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
              <div>
                <Button onClick={handleSignout} color="gray" variant="outline">
                  Sign Out
                </Button>
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
      )}
    </>
  );
};

export default Admin;
