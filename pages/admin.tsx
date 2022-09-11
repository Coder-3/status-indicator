import { useState, useEffect, useCallback } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Table, Modal, Button, Group, TextInput, Select } from "@mantine/core";
import { supabase } from "../utils/supabaseClient";

type Facility = {
  id: string;
  name: string;
  status: string;
  notes: string;
  edit: any;
};

const RowActionButtons = ({
  facility,
  setCurrentFacility,
  setIsModalOpen,
  getFacilities,
}: {
  facility: Facility | null;
  setCurrentFacility: (facility: Facility | null) => void;
  setIsModalOpen: (isModalOpen: boolean) => void;
  getFacilities: () => void;
}) => {
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
  };

  const handleEdit = () => {
    if (facility) {
      setCurrentFacility(facility);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Button variant="outline" color="red" onClick={handleDelete}>
        Delete
      </Button>
      <Button variant="outline" color="blue" onClick={handleEdit}>
        Edit
      </Button>
    </>
  );
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
      <form onSubmit={handleSave}>
        <TextInput
          label="Name"
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
        />
        <Select
          data={["Open", "Closed"]}
          label="Status"
          placeholder="Status"
          searchable
          clearable
          value={status}
          onChange={setStatus}
        />
        <TextInput
          label="Notes"
          placeholder="Notes"
          value={notes}
          onChange={(event) => setNotes(event.currentTarget.value)}
        />
        <Button type="submit">Save</Button>
      </form>
    </>
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

const Admin: NextPage = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [currentFacility, setCurrentFacility] = useState<Facility | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableData, setTableData] = useState<Facility[]>([]);

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
            setCurrentFacility={setCurrentFacility}
            setIsModalOpen={setIsModalOpen}
            getFacilities={getFacilities}
          />
        ),
      };
    });
    setTableData(facilitiesAsTableData);
  }, [getFacilities, facilities, setTableData]);

  useEffect(() => {
    getFacilities();
  }, [getFacilities]);

  useEffect(() => {
    createTableData();
  }, [facilities, createTableData]);

  return (
    <>
      <Head>
        <title>Status Indicator</title>
        <meta name="description" content="Status Indicator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Modal
          opened={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={currentFacility ? "Edit Facility" : "Add Facility"}
        >
          <AddEditFacilityModal
            facility={currentFacility}
            setIsModalOpen={setIsModalOpen}
            getFacilities={getFacilities}
          />
        </Modal>
        <FacilitiesTable tableData={tableData} />
        <Group position="center">
          <Button
            onClick={() => {
              setCurrentFacility(null);
              setIsModalOpen(true);
            }}
          >
            Add Facility
          </Button>
        </Group>
      </main>
    </>
  );
};

export default Admin;
