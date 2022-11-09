import { useState } from "react";
import { isFacilityOpen } from "../utils/facilities";
import { TextInput, Select, Card, Title, Text } from "@mantine/core";
import { IconSearch } from "@tabler/icons";

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

export default MobileFacilities;
