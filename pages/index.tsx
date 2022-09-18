import { useState, useEffect, useCallback } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Table } from "@mantine/core";
import { supabase } from "../utils/supabaseClient";

type Facility = {
  id: string;
  name: string;
  status: string;
  notes: string;
};

const FacilitiesTable = ({ tableData }: { tableData: Facility[] }) => {
  const rows = tableData.map((facility) => (
    <tr key={facility.id}>
      <td>{facility.name}</td>
      <td>{facility.status}</td>
      <td>{facility.notes}</td>
    </tr>
  ));

  return (
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
  );
};

const Home: NextPage = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
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

  return (
    <>
      <Head>
        <title>Status Indicator</title>
        <meta name="description" content="Status Indicator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <FacilitiesTable tableData={tableData} />
      </main>
    </>
  );
};

export default Home;
