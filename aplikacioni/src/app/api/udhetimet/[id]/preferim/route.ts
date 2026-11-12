import { getSql } from "@/lib/db";
import { profiliIm } from "@/lib/lejet";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Kërkesa nuk është e vlefshme." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Kërkesa nuk është e vlefshme." }, { status: 400 });
  }

  const { id } = await params;
  if (!id || id.length > 64) {
    return Response.json({ error: "Udhëtimi nuk është i vlefshëm." }, { status: 400 });
  }

  try {
    const profili = await profiliIm();
    if (!profili) {
      return Response.json({ error: "Hyr për ta ruajtur udhëtimin." }, { status: 401 });
    }

    const sql = getSql();
    const saved = await sql`
      INSERT INTO udhetimet_preferuara (github_id, udhetim_id)
      SELECT ${profili.id}, udhetimet.id
      FROM udhetimet
      WHERE udhetimet.id = ${id}
      ON CONFLICT (github_id, udhetim_id) DO NOTHING
      RETURNING udhetim_id
    `;

    if (saved.length === 0) {
      const trip = await sql`SELECT id FROM udhetimet WHERE id = ${id}`;
      if (trip.length === 0) {
        return Response.json({ error: "Udhëtimi nuk u gjet." }, { status: 404 });
      }
    }

    const countRows = await sql`
      SELECT COUNT(*)::int AS numer
      FROM udhetimet_preferuara
      WHERE github_id = ${profili.id}
    `;

    return Response.json(
      { iRuajtur: true, numer: Number(countRows[0]?.numer ?? 0) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Nuk u ruajt. Provo përsëri." },
      { status: 503 },
    );
  }
}
