import {
  createStyles,
  Accordion,
  TextInput,
  Textarea,
  Group,
  Select,
  Button,
} from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";
import { IconCalendar, IconClock } from "@tabler/icons";
import { Facility } from "../types/types";
import { isFacilityOpen } from "../utils/facilities";
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

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

  const handleSave = async (e: any) => {
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

    try {
      const user = supabase.auth.user();
      if (user && user.id) {
        const { data, error } = await supabase
          .from("users")
          .select("organisation")
          .eq("id", user.id);
        if (error) throw error;

        if (data && data[0] && data[0].organisation) {
          const newFacility: any = {
            id: facility ? facility.id : Math.floor(Math.random() * 1000000),
            organisation: data[0].organisation,
            created_at: facility
              ? facility.created_at
              : new Date().toISOString(),
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
        }
      }
    } catch (error) {
      console.log("error", error);
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

export default AddEditFacilityModal;
