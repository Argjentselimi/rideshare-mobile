import { lexoGjendjenUdhetimit, pranoKerkesen } from "@/lib/kerkesat";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  {
    params,
  }: { params: Promise<{ id: string; kerkesaId: string }> },
) {
  const { id, kerkesaId } = await params;
  try {
    const pranimi = await pranoKerkesen(id, kerkesaId);
    if (pranimi.rezultat === "hyr") {
      return Response.json({ error: "Hyr në llogarinë e shoferit." }, { status: 401 });
    }
    if (pranimi.rezultat === "ndaluar") {
      return Response.json({ error: "Vetëm shoferi pronar mund ta pranojë kërkesën." }, { status: 403 });
    }
    if (pranimi.rezultat === "mungon") {
      return Response.json({ error: "Kërkesa nuk u gjet." }, { status: 404 });
    }

    const gjendja = await lexoGjendjenUdhetimit(id);
    if (pranimi.rezultat === "plot") {
      return Response.json(
        { error: "Nuk ka vende të lira.", gjendja },
        { status: 409, headers: { "Cache-Control": "no-store, max-age=0" } },
      );
    }
    return Response.json(
      {
        gjendja,
        message:
          pranimi.rezultat === "ishte_pranuar"
            ? "Kërkesa ishte pranuar më parë; vendet nuk u ndryshuan."
            : "Pranimi u ruajt në server.",
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return Response.json(
      { error: "Pranimi nuk u ruajt. Kontrollo lidhjen dhe provo përsëri." },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
