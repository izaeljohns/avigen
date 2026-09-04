import type { Database } from "../types";
import { uid } from "./utils";

export const DEMO_EMAIL = "demo@avigen.app";
export const DEMO_PASSWORD = "demo123";

export function buildDemoDb(): Database {
  const userId = uid();
  const propertyId = uid();
  const incMec = uid();
  const incNat = uid();
  const batch1 = uid();
  const batch2 = uid();
  const bird1 = uid();
  const bird2 = uid();
  const bird3 = uid();
  const today = new Date();
  const iso = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };

  return {
    users: [
      {
        id: userId,
        name: "Ana Ribeiro",
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        createdAt: iso(-40),
      },
    ],
    properties: [
      {
        id: propertyId,
        userId,
        name: "Sítio Recanto das Aves",
        location: "Itu, SP",
        productionType: "misto",
        notes: "Unidade demonstrativa com genética caipira e matrizes Rhode.",
        createdAt: iso(-40),
      },
    ],
    incubators: [
      {
        id: incMec,
        propertyId,
        name: "Chocadeira Premium 120",
        type: "mecanica",
        capacity: 120,
        notes: "Viragem automática e controle de umidade.",
      },
      {
        id: incNat,
        propertyId,
        name: "Choco natural — galinha Índio",
        type: "natural",
        capacity: 14,
        notes: "Ninho coberto no galinheiro 2.",
      },
    ],
    batches: [
      {
        id: batch1,
        propertyId,
        incubatorId: incMec,
        entryDate: iso(-12),
        breed: "Rhode Island Red",
        quantity: 48,
        hatched: 0,
        discarded: 2,
        status: "incubando",
        notes: "Ovos de matrizes selecionadas.",
      },
      {
        id: batch2,
        propertyId,
        incubatorId: incNat,
        entryDate: iso(-22),
        breed: "Índio Gigante",
        quantity: 12,
        hatched: 9,
        discarded: 1,
        status: "eclodido",
        notes: "Eclosão concluída.",
      },
    ],
    birds: [
      {
        id: bird1,
        propertyId,
        ringCode: "AG-0142",
        ringColor: "Verde",
        ringType: "oficial",
        breed: "Rhode Island Red",
        sex: "F",
        status: "matriz",
        photo: "",
        birthDate: iso(-280),
        notes: "Matriz líder do plantel de postura.",
      },
      {
        id: bird2,
        propertyId,
        ringCode: "AG-0088",
        ringColor: "Azul",
        ringType: "oficial",
        breed: "Índio Gigante",
        sex: "M",
        status: "reprodutor",
        photo: "",
        birthDate: iso(-400),
        notes: "Reprodutor com pedigree visual.",
        batchId: batch2,
      },
      {
        id: bird3,
        propertyId,
        ringCode: "AG-0210",
        ringColor: "Amarelo",
        ringType: "identificacao",
        breed: "Caipira pescoço pelado",
        sex: "F",
        status: "crescimento",
        photo: "",
        birthDate: iso(-70),
        notes: "Lote de reposição.",
      },
    ],
    health: [
      {
        id: uid(),
        propertyId,
        date: iso(0),
        kind: "tarefa",
        title: "Limpar bebedouros e comedouros",
        description: "Troca de água e higienização do galinheiro 1.",
        status: "pendente",
      },
      {
        id: uid(),
        propertyId,
        date: iso(0),
        kind: "vacina",
        title: "Newcastle — lote crescimento",
        description: "Via ocular, conforme calendário sanitário.",
        birdId: bird3,
        status: "pendente",
      },
      {
        id: uid(),
        propertyId,
        date: iso(3),
        kind: "medicacao",
        title: "Vermifugação do plantel reprodutor",
        description: "Dose conforme peso médio.",
        status: "pendente",
      },
      {
        id: uid(),
        propertyId,
        date: iso(-5),
        kind: "vacina",
        title: "Bronquite infecciosa",
        description: "Aplicada nas matrizes.",
        status: "concluida",
      },
    ],
    transactions: [
      {
        id: uid(),
        propertyId,
        date: iso(-8),
        type: "custo",
        category: "Ração",
        description: "Ração postura 40 kg",
        amount: 186.9,
      },
      {
        id: uid(),
        propertyId,
        date: iso(-3),
        type: "custo",
        category: "Equipamentos",
        description: "Termômetro e bandejas",
        amount: 94.5,
      },
      {
        id: uid(),
        propertyId,
        date: iso(-1),
        type: "receita",
        category: "Ovos",
        description: "Venda 15 dúzias caipira",
        amount: 270,
      },
      {
        id: uid(),
        propertyId,
        date: iso(-15),
        type: "receita",
        category: "Aves",
        description: "Venda de 4 frangas",
        amount: 480,
      },
    ],
  };
}
