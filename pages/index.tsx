import type { NextPage } from "next";
import Head from "next/head";
import { Table } from "@mantine/core";

const Home: NextPage = () => {
  const tableData = [
    { id: "1", name: "Facility 1", status: "Type 1", notes: "Notes 1" },
    { id: "2", name: "Facility 2", status: "Type 2", notes: "Notes 2" },
    { id: "3", name: "Facility 3", status: "Type 3", notes: "Notes 3" },
    { id: "4", name: "Facility 4", status: "Type 4", notes: "Notes 4" },
    { id: "5", name: "Facility 5", status: "Type 5", notes: "Notes 5" },
  ];

  const rows = tableData.map((facility) => (
    <tr key={facility.id}>
      <td>{facility.name}</td>
      <td>{facility.status}</td>
      <td>{facility.notes}</td>
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
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </main>
    </>
  );
};

export default Home;
