export type ShelterStatus = "open" | "full" | "closed";

export type Shelter = {
  id: string;
  name: string;
  address: string;
  status: ShelterStatus;
  capacity: number;
  occupied: number;
};
