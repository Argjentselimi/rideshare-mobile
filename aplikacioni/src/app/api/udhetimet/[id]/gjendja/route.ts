import { lexoGjendjenUdhetimit } from "@/lib/kerkesat";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const gjendja = await lexoGjendjenUdhetimit(id);
    if (!gjendja) {
      return Response.json({ error: "Udhëtimi nuk u gjet." }, { status: 404 });
    }
    return Response.json(gjendja, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return Response.json(
      { error: "Gjendja nuk mund të lexohet tani." },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
