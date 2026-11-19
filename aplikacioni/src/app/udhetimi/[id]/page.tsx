import Link from "next/link";
import { notFound } from "next/navigation";
import { gjejUdhetimin } from "@/lib/udhetimet";
import { lexoGjendjenPreferimit } from "@/lib/preferimet";
import PreferimiUdhetimit from "@/components/PreferimiUdhetimit";
import ZgjedhVendtakimin from "@/components/ZgjedhVendtakimin";
import GjendjaUdhetimit from "@/components/GjendjaUdhetimit";

export const dynamic = "force-dynamic";

export default async function Detajet({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let udhetim;
  try {
    udhetim = await gjejUdhetimin(id);
  } catch {
    return (
      <main>
        <h1>RideShare</h1>
        <p role="alert">Nuk u lidhëm me databazën. Provo përsëri.</p>
        <Link href="/">← Kthehu te lista</Link>
      </main>
    );
  }

  if (!udhetim) {
    notFound();
  }

  let preferimi = { iKycur: false, iRuajtur: false, numer: 0 };
  let gabimPreferimi = false;
  try {
    preferimi = await lexoGjendjenPreferimit(id);
  } catch {
    gabimPreferimi = true;
  }

  return (
    <main className="trip-page">
      <Link href="/">← Kthehu te lista</Link>
      <GjendjaUdhetimit udhetimId={id} udhetimFillestar={udhetim} />
      {gabimPreferimi ? (
        <section className="favorite-panel" aria-labelledby="favorite-title">
          <h2 id="favorite-title">Të preferuarat</h2>
          <p role="alert">
            Preferimet nuk mund të lexohen. Kontrollo dhe apliko migrimin `schema-java09.sql` në Neon.
          </p>
        </section>
      ) : (
        <PreferimiUdhetimit
          udhetimId={id}
          iKycur={preferimi.iKycur}
          fillimishtIRuajtur={preferimi.iRuajtur}
          fillimishtNumer={preferimi.numer}
        />
      )}
      <ZgjedhVendtakimin />
    </main>
  );
}
