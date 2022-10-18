import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import { Table } from "@mantine/core";
import Head from "next/head";

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

const Organisation = () => {
  const [facilities, setFacilities] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);
  const router = useRouter();
  const { pid } = router.query;

  const getFacilitiesForOrganisation = useCallback(async () => {
    try {
      if (pid) {
        const { data, error } = await supabase
          .from("facilities")
          .select("*")
          .eq("organisation", pid?.toString());
        if (error) throw error;
        if (data && data[0]) {
          setFacilities(data);
        }
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  }, [pid]);

  useEffect(() => {
    getFacilitiesForOrganisation();
  }, [getFacilitiesForOrganisation]);

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
    createTableData();
  }, [createTableData]);

  return (
    <>
      <Head>
        <title>Status Indicator</title>
        <meta name="description" content="Status Indicator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <FacilitiesTable tableData={tableData} />
    </>
  );
};

export default Organisation;
