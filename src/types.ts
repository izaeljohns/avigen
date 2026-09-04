export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

export type Property = {
  id: string;
  userId: string;
  name: string;
  location: string;
  productionType: "postura" | "corte" | "reproducao" | "misto";
  notes: string;
  createdAt: string;
};

export type IncubatorType = "mecanica" | "natural";

export type Incubator = {
  id: string;
  propertyId: string;
  name: string;
  type: IncubatorType;
  capacity: number;
  notes: string;
};

export type BatchStatus = "incubando" | "eclodido" | "encerrado";

export type EggBatch = {
  id: string;
  propertyId: string;
  incubatorId: string;
  entryDate: string;
  breed: string;
  quantity: number;
  hatched: number;
  discarded: number;
  status: BatchStatus;
  notes: string;
};

export type BirdStatus =
  | "maternidade"
  | "crescimento"
  | "matriz"
  | "reprodutor"
  | "vendido"
  | "abatido";

export type RingType = "oficial" | "identificacao" | "lacre";

export type Bird = {
  id: string;
  propertyId: string;
  ringCode: string;
  ringColor: string;
  ringType: RingType;
  breed: string;
  sex: "F" | "M" | "I";
  status: BirdStatus;
  photo: string;
  birthDate: string;
  notes: string;
  batchId?: string;
};

export type HealthKind = "vacina" | "medicacao" | "tarefa";
export type HealthStatus = "pendente" | "concluida";

export type HealthEvent = {
  id: string;
  propertyId: string;
  date: string;
  kind: HealthKind;
  title: string;
  description: string;
  birdId?: string;
  status: HealthStatus;
};

export type TxType = "custo" | "receita";

export type Transaction = {
  id: string;
  propertyId: string;
  date: string;
  type: TxType;
  category: string;
  description: string;
  amount: number;
};

export type Database = {
  users: User[];
  properties: Property[];
  incubators: Incubator[];
  batches: EggBatch[];
  birds: Bird[];
  health: HealthEvent[];
  transactions: Transaction[];
};

export type Session = {
  userId: string;
  propertyId: string | null;
};
