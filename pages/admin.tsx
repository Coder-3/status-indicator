import { useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Table, Modal, Button, Group, TextInput, Select } from "@mantine/core";

const RowActionButtons = ({
  id,
  setCurrentFacilityId,
  setIsModalOpen,
}: {
  id: string;
  setCurrentFacilityId: (id: string) => void;
  setIsModalOpen: (isModalOpen: boolean) => void;
}) => {
  const handleDelete = () => {
    console.log("Delete", id);
  };

  const handleEdit = () => {
    setCurrentFacilityId(id);
    setIsModalOpen(true);
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

const AddEditFacilityModal = ({ id }: { id: string | null }) => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (id) {
      console.log("editing", id, name, status, notes);
    } else {
      console.log("adding", name, status, notes);
    }
  };

  return (
    <>
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
    </>
  );
};

const Admin: NextPage = () => {
  const [currentFacilityId, setCurrentFacilityId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tableData = [
    {
      id: "1",
      name: "Facility 1",
      status: "Type 1",
      notes: "Notes 1",
      edit: (
        <RowActionButtons
          id="1"
          setCurrentFacilityId={setCurrentFacilityId}
          setIsModalOpen={setIsModalOpen}
        />
      ),
    },
  ];

  const rows = tableData.map((facility) => (
    <tr key={facility.id}>
      <td>{facility.name}</td>
      <td>{facility.status}</td>
      <td>{facility.notes}</td>
      <td>{facility.edit}</td>
    </tr>
  ));

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
          title={currentFacilityId ? "Edit Facility" : "Add Facility"}
        >
          <AddEditFacilityModal id={currentFacilityId} />
        </Modal>

        <Group position="center">
          <Button
            onClick={() => {
              setCurrentFacilityId(null);
              setIsModalOpen(true);
            }}
          >
            Add Facility
          </Button>
        </Group>
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
      </main>
    </>
  );
};

export default Admin;
