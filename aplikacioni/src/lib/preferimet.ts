import "server-only";
import { getSql } from "./db";
import { profiliIm } from "./lejet";

export type GjendjaPreferimit = {
  iKycur: boolean;
  iRuajtur: boolean;
  numer: number;
};

export async function lexoGjendjenPreferimit(
  udhetimId: string,
): Promise<GjendjaPreferimit> {
  const profili = await profiliIm();
  if (!profili) return { iKycur: false, iRuajtur: false, numer: 0 };

  const sql = getSql();
  const rows = await sql`
    SELECT
      EXISTS (
        SELECT 1 FROM udhetimet_preferuara
        WHERE github_id = ${profili.id} AND udhetim_id = ${udhetimId}
      ) AS i_ruajtur,
      (
        SELECT COUNT(*)::int FROM udhetimet_preferuara
        WHERE github_id = ${profili.id}
      ) AS numer
  `;

  return {
    iKycur: true,
    iRuajtur: rows[0]?.i_ruajtur === true,
    numer: Number(rows[0]?.numer ?? 0),
  };
}
