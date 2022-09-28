import { Facility } from "../types/types";

export const isFacilityOpen = (facility: Facility) => {
  let isOpen = facility.status === "Open";

  if (
    isOpen &&
    facility.closure_start_date &&
    facility.closure_start_time &&
    facility.closure_end_date &&
    facility.closure_end_time
  ) {
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

    const startDateTime = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      startTime.getHours(),
      startTime.getMinutes()
    );
    const endDateTime = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      endTime.getHours(),
      endTime.getMinutes()
    );

    const now = new Date();

    now >= startDateTime && now <= endDateTime
      ? (isOpen = false)
      : (isOpen = true);
  }

  return isOpen;
};
