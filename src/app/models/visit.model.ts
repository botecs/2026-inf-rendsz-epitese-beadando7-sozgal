export interface Visit {
  id?: number;
  date: string;
  diagnosis: string;
  medications: string;
  treatments: string;
  documents?: string;
  patient?: { id: number };
}
