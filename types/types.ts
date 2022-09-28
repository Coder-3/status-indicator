export type Facility = {
  id: string;
  created_at: string;
  name: string;
  status: string;
  notes: string;
  order: number | null;
  deleted: boolean;
  closure_start_date: string | null;
  closure_end_date: string | null;
  closure_start_time: string | null;
  closure_end_time: string | null;
};
