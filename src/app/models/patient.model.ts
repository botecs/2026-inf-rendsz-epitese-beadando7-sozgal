export interface Patient {
  id?: number;
  name: string;
  taj: string;
  birthDate: string;
  gender: string;
  visits?: { id: number }[];
}
