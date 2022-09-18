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
  name: string;
  status: string;
  notes: string;
  edit: any;
};

const AddEditFacilityModal = ({
  facility,
  setIsModalOpen,
  getFacilities,
}: {
  facility: Facility | null;
  setIsModalOpen: (isModalOpen: boolean) => void;
  getFacilities: () => void;
}) => {
  const { classes } = useStyles();
  const [name, setName] = useState(facility ? facility.name : "");
  const [status, setStatus] = useState<string | null>(
    facility ? facility.status : null
  );
  const [notes, setNotes] = useState(facility ? facility.notes : "");

  const handleSave = async (e: any) => {
    e.preventDefault();

    const user = supabase.auth.user();
    if (!user) return;

    const newFacility: any = {
      id: facility ? facility.id : undefined,
      name,
      status,
      notes,
    };

    await supabase.from("facilities").upsert(newFacility);

    setIsModalOpen(false);
    getFacilities();
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
          required
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
  facility,
  getFacilities,
  setIsModalOpen,
}: {
  facility: Facility | null;
  getFacilities: () => void;
  setIsModalOpen: (isModalOpen: boolean) => void;
}) => {
  const { classes } = useStyles();

  const handleDelete = async () => {
    const user = supabase.auth.user();
    if (!user) return;

    if (facility && facility.id) {
      try {
        await supabase
          .from("facilities")
          .update({ deleted: true })
          .eq("id", facility.id);
      } catch (error: any) {
        console.error(error);
      }
    }
    getFacilities();
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

const FacilitiesTable = ({ tableData }: { tableData: Facility[] }) => {
  const rows = tableData.map((facility) => (
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
          <th>Name</th>
          <th>Status</th>
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

const Admin: NextPage = () => {
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [currentFacility, setCurrentFacility] = useState<Facility | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tableData, setTableData] = useState<Facility[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isCopyIFrameModalOpen, setIsCopyIframeModalOpen] = useState(false);

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
    const facilitiesAsTableData = facilities.map((facility: Facility) => {
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
                facility={currentFacility}
                setIsModalOpen={setIsAddEditModalOpen}
                getFacilities={getFacilities}
              />
            </Modal>
            <Modal
              opened={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              title="Delete Facility"
            >
              <DeleteFacilityModal
                facility={currentFacility}
                setIsModalOpen={setIsDeleteModalOpen}
                getFacilities={getFacilities}
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
            <Group position="right">
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
            </Group>
            <FacilitiesTable tableData={tableData} />
          </main>
        </AppShell>
      )}
    </>
  );
};

export default Admin;
