import { krijoKerkesen, lexoGjendjenUdhetimit } from "@/lib/kerkesat";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const krijimi = await krijoKerkesen(id);
    if (krijimi.rezultat === "hyr") {
      return Response.json({ error: "Hyr në llogari para se të kërkosh vend." }, { status: 401 });
    }
    if (krijimi.rezultat === "mungon") {
      return Response.json({ error: "Udhëtimi nuk u gjet." }, { status: 404 });
    }
    if (krijimi.rezultat === "shofer") {
      return Response.json({ error: "Shoferi nuk mund të kërkojë vend në udhëtimin e vet." }, { status: 403 });
    }
    if (krijimi.rezultat === "pa_shofer") {
      return Response.json({ error: "Ky udhëtim nuk ka shofer pronar të caktuar." }, { status: 409 });
    }
    if (krijimi.rezultat === "vende") {
      return Response.json({ error: "Nuk ka vende të lira." }, { status: 409 });
    }

    const gjendja = await lexoGjendjenUdhetimit(id);
    return Response.json(
      { gjendja, message: "Kërkesa u ruajt në server." },
      { status: 201, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return Response.json(
      { error: "Kërkesa nuk u ruajt. Kontrollo lidhjen dhe provo përsëri." },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
