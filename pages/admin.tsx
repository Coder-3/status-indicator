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
} from "@mantine/core";
import { Prism } from "@mantine/prism";
import { IconPencil, IconTrash } from "@tabler/icons";
import { supabase } from "../utils/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/router";

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

type Facility = {
  id: string;
  created_at: string;
  name: string;
  status: string;
  notes: string;
  order: number | null;
  deleted: boolean;
};

const AddEditFacilityModal = ({
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
  const [name, setName] = useState(facility ? facility.name : "");
  const [status, setStatus] = useState<string | null>(
    facility ? facility.status : null
  );
  const [notes, setNotes] = useState(facility ? facility.notes : "");

  const handleSave = (e: any) => {
    e.preventDefault();

    const newFacility: any = {
      id: facility ? facility.id : Math.floor(Math.random() * 1000000),
      created_at: facility ? facility.created_at : new Date().toISOString(),
      name,
      status,
      notes,
      order: facility ? facility.order : null,
      deleted: false,
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
        <TextInput
          label="Notes"
          placeholder="Notes"
          value={notes}
          onChange={(event) => setNotes(event.currentTarget.value)}
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
  setIsUnsavedChanges
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
  setIsAddEditModalOpen,
  setIsDeleteModalOpen,
  setCurrentFacility,
}: {
  facility: Facility | null;
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
    <div style={{ display: "flex" }}>
      <ActionIcon title="Edit" variant="filled" onClick={handleEdit} mr="sm">
        <IconPencil size={16} />
      </ActionIcon>
      <ActionIcon title="Delete" variant="filled" onClick={handleDelete}>
        <IconTrash size={16} />
      </ActionIcon>
    </div>
  );
};

const FacilitiesTable = ({ tableData }: { tableData: any[] }) => {
  const [status, setStatus] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const filteredTableData = tableData.filter((item) => {
    const searchMatch = item.name.toLowerCase().includes(search.toLowerCase());
    const statusMatch = status.length ? status.includes(item.status) : true;
    return searchMatch && statusMatch;
  });

  const rows = filteredTableData.map((facility) => (
    <tr key={facility.id}>
      <td>{facility.name}</td>
      <td>{facility.status}</td>
      <td>{facility.notes}</td>
      <td>{facility.edit}</td>
    </tr>
  ));

  return (
    <Table>
      <thead>
        <tr>
          <th>
            <TextInput
              placeholder="Search facility name"
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              style={{ maxWidth: "300px" }}
            />
          </th>
          <th>
            <MultiSelect
              data={[
                { value: "Open", label: "Open" },
                { value: "Closed", label: "Closed" },
              ]}
              placeholder="Status"
              searchable
              clearable
              value={status}
              onChange={setStatus}
              style={{ maxWidth: "300px" }}
            />
          </th>
          <th>Notes</th>
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
  const iFrameString = `<iframe src=${url} width="100%" height="100%" />`;

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
      <Text>Are you sure you want to refresh this page? Any unplished changes will be lost</Text>
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
          onClick={
            () => {
              setIsModalOpen(false);
              getFacilities();
            }
          }
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
        setFacilities(data);
      }
      if (error) throw error;
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  }, [setFacilities]);

  const createTableData = useCallback(() => {
    const facilitiesAsTableData = facilities
      .filter((facility) => facility.deleted === false)
      .map((facility: Facility) => {
        return {
          id: facility.id,
          name: facility.name,
          status: facility.status,
          notes: facility.notes,
          edit: (
            <RowActionButtons
              facility={facility}
              setIsAddEditModalOpen={setIsAddEditModalOpen}
              setIsDeleteModalOpen={setIsDeleteModalOpen}
              setCurrentFacility={setCurrentFacility}
            />
          ),
        };
      });
    setTableData(facilitiesAsTableData);
  }, [facilities, setTableData]);

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
                <Title order={2}>Status Indicator</Title>
              </div>
              <div>
                <Button onClick={handleSignout} color="gray" variant="outline">
                  Sign Out
                </Button>
              </div>
            </Header>
          }
        >
          <Head>
            <title>Status Indicator</title>
            <meta name="description" content="Status Indicator" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <main style={{ margin: 10 }}>
            <Modal
              opened={isAddEditModalOpen}
              onClose={() => setIsAddEditModalOpen(false)}
              title={currentFacility ? "Edit Facility" : "Add Facility"}
            >
              <AddEditFacilityModal
                facilities={facilities}
                facility={currentFacility}
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
              size="xl"
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
              {isUnsavedChanges ? (
                <Button onClick={() => setIsRefreshModalOpen(true)} mb="xs">
                  Refresh
                </Button>
              ): (
                <Button onClick={getFacilities} mb="xs">
                  Refresh
                </Button>
              )}
              <Button
                onClick={() => {
                  setCurrentFacility(null);
                  setIsCopyIframeModalOpen(true);
                }}
                mb="xs"
              >
                Copy iFrame
              </Button>
              <Button
                onClick={() => {
                  setCurrentFacility(null);
                  setIsAddEditModalOpen(true);
                }}
                mb="xs"
              >
                Add Facility
              </Button>
              <Button disabled={!isUnsavedChanges} onClick={() => setIsPublishModalOpen(true)} mb="xs">
                Publish
              </Button>
            </Group>
            <FacilitiesTable tableData={tableData} />
          </main>
        </AppShell>
      )}
    </>
  );
};

export default Admin;
