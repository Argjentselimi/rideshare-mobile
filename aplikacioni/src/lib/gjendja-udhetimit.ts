export type StatusiKerkeses = "ne_pritje" | "pranuar";

export type KerkeseUdhetimi = {
  id: string;
  udhetarEmri: string;
  status: StatusiKerkeses;
  krijuarMe: string;
};

export type GjendjaUdhetimit = {
  udhetim: {
    id: string;
    nisja: string;
    destinacioni: string;
    ora: string;
    vendtakimi: string;
    vende: number;
    shoferEmri: string | null;
  };
  iKycur: boolean;
  jamShoferi: boolean;
  kerkesaIme: KerkeseUdhetimi | null;
  kerkesat: KerkeseUdhetimi[];
};
