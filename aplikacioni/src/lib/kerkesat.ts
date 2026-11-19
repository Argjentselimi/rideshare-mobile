import "server-only";
import { getSql } from "./db";
import { profiliIm } from "./lejet";
import type { GjendjaUdhetimit } from "./gjendja-udhetimit";

export async function lexoGjendjenUdhetimit(
  udhetimId: string,
): Promise<GjendjaUdhetimit | null> {
  const profili = await profiliIm();
  const sql = getSql();
  const [udhetimet, teMiAt, rreshtat] = await sql.transaction(
    (tx) => [
      tx`
        SELECT u.id, u.nisja, u.destinacioni, u.ora, u.vendtakimi, u.vende,
          u.shofer_id, p.emri AS shofer_emri
        FROM udhetimet u
        LEFT JOIN profilet p ON p.github_id = u.shofer_id
        WHERE u.id = ${udhetimId}
      `,
      tx`
        SELECT k.id::text, p.emri AS udhetar_emri, k.status,
          k.krijuar_me::text AS krijuar_me
        FROM udhetim_kerkesa k
        JOIN profilet p ON p.github_id = k.udhetar_id
        WHERE k.udhetim_id = ${udhetimId}
          AND k.udhetar_id = ${profili?.id ?? null}
        LIMIT 1
      `,
      tx`
        SELECT k.id::text, p.emri AS udhetar_emri, k.status,
          k.krijuar_me::text AS krijuar_me
        FROM udhetim_kerkesa k
        JOIN profilet p ON p.github_id = k.udhetar_id
        JOIN udhetimet u ON u.id = k.udhetim_id
        WHERE k.udhetim_id = ${udhetimId}
          AND u.shofer_id = ${profili?.id ?? null}
        ORDER BY k.krijuar_me, k.id
      `,
    ],
    { isolationLevel: "RepeatableRead", readOnly: true },
  );
  const udhetimi = udhetimet[0];
  if (!udhetimi) return null;

  const jamShoferi = Boolean(profili && udhetimi.shofer_id === profili.id);
  const kerkesaIme: GjendjaUdhetimit["kerkesaIme"] = teMiAt[0]
    ? {
        id: String(teMiAt[0].id),
        udhetarEmri: String(teMiAt[0].udhetar_emri),
        status: teMiAt[0].status as "ne_pritje" | "pranuar",
        krijuarMe: String(teMiAt[0].krijuar_me),
      }
    : null;
  const kerkesat: GjendjaUdhetimit["kerkesat"] = jamShoferi
    ? rreshtat.map((rresht) => ({
        id: String(rresht.id),
        udhetarEmri: String(rresht.udhetar_emri),
        status: rresht.status as "ne_pritje" | "pranuar",
        krijuarMe: String(rresht.krijuar_me),
      }))
    : [];

  return {
    udhetim: {
      id: String(udhetimi.id),
      nisja: String(udhetimi.nisja),
      destinacioni: String(udhetimi.destinacioni),
      ora: String(udhetimi.ora),
      vendtakimi: String(udhetimi.vendtakimi),
      vende: Number(udhetimi.vende),
      shoferEmri: udhetimi.shofer_emri ? String(udhetimi.shofer_emri) : null,
    },
    iKycur: Boolean(profili),
    jamShoferi,
    kerkesaIme,
    kerkesat,
  };
}

export async function krijoKerkesen(udhetimId: string) {
  const profili = await profiliIm();
  if (!profili) return { rezultat: "hyr" as const };

  const sql = getSql();
  const udhetimet = await sql`
    SELECT vende, shofer_id FROM udhetimet WHERE id = ${udhetimId}
  `;
  const udhetimi = udhetimet[0];
  if (!udhetimi) return { rezultat: "mungon" as const };
  if (udhetimi.shofer_id === profili.id) return { rezultat: "shofer" as const };
  if (!udhetimi.shofer_id) return { rezultat: "pa_shofer" as const };

  await sql`
    INSERT INTO udhetim_kerkesa (udhetim_id, udhetar_id)
    SELECT ${udhetimId}, ${profili.id}
    FROM udhetimet
    WHERE id = ${udhetimId} AND vende > 0
      AND shofer_id IS NOT NULL AND shofer_id <> ${profili.id}
    ON CONFLICT (udhetim_id, udhetar_id) DO NOTHING
  `;

  const ekzistueset = await sql`
    SELECT id::text FROM udhetim_kerkesa
    WHERE udhetim_id = ${udhetimId} AND udhetar_id = ${profili.id}
    LIMIT 1
  `;
  if (ekzistueset[0]) return { rezultat: "ruajtur" as const };

  const gjendjaFundit = await sql`
    SELECT vende, shofer_id FROM udhetimet WHERE id = ${udhetimId}
  `;
  if (!gjendjaFundit[0]) return { rezultat: "mungon" as const };
  if (gjendjaFundit[0].shofer_id === profili.id) return { rezultat: "shofer" as const };
  if (!gjendjaFundit[0].shofer_id) return { rezultat: "pa_shofer" as const };
  return { rezultat: "vende" as const };
}

export async function pranoKerkesen(udhetimId: string, kerkesaId: string) {
  const profili = await profiliIm();
  if (!profili) return { rezultat: "hyr" as const };
  if (!/^\d+$/.test(kerkesaId)) return { rezultat: "mungon" as const };

  const sql = getSql();
  const ekzistonUdhetimi = await sql`
    SELECT id, shofer_id FROM udhetimet WHERE id = ${udhetimId}
  `;
  if (!ekzistonUdhetimi[0]) return { rezultat: "mungon" as const };
  if (ekzistonUdhetimi[0].shofer_id !== profili.id) {
    return { rezultat: "ndaluar" as const };
  }

  const [pronari, ndryshimet] = await sql.transaction([
    sql`
      SELECT id FROM udhetimet
      WHERE id = ${udhetimId} AND shofer_id = ${profili.id}
      FOR UPDATE
    `,
    sql`
      WITH pranuar AS (
        UPDATE udhetim_kerkesa
        SET status = 'pranuar', perditesuar_me = NOW()
        WHERE id = ${kerkesaId}::bigint
          AND udhetim_id = ${udhetimId}
          AND status = 'ne_pritje'
          AND EXISTS (
            SELECT 1 FROM udhetimet
            WHERE id = ${udhetimId}
              AND shofer_id = ${profili.id}
              AND vende > 0
          )
        RETURNING udhetim_id
      )
      UPDATE udhetimet u
      SET vende = u.vende - 1
      FROM pranuar
      WHERE u.id = pranuar.udhetim_id AND u.vende > 0
      RETURNING u.id
    `,
  ]);
  if (pronari.length === 0) return { rezultat: "ndaluar" as const };

  const kerkesat = await sql`
    SELECT status FROM udhetim_kerkesa
    WHERE id = ${kerkesaId}::bigint AND udhetim_id = ${udhetimId}
    LIMIT 1
  `;
  if (!kerkesat[0]) return { rezultat: "mungon" as const };
  if (kerkesat[0].status === "pranuar") {
    return {
      rezultat: ndryshimet.length > 0 ? "pranuar" as const : "ishte_pranuar" as const,
    };
  }

  const vendet = await sql`SELECT vende FROM udhetimet WHERE id = ${udhetimId}`;
  return Number(vendet[0]?.vende ?? 0) < 1
    ? { rezultat: "plot" as const }
    : { rezultat: "ne_pritje" as const };
}
