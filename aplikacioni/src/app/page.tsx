import Link from "next/link";
import { getServerSession } from "next-auth";
import Hyrja from "@/components/Hyrja";
import { authOptions } from "@/lib/auth";
import { KartaUdhetimi } from "@/components/KartaUdhetimi";
import { lexoUdhetimet, type Udhetim } from "@/lib/udhetimet";

export const dynamic = "force-dynamic";

export default async function Home() {
  // The public trip list should still render if the OAuth secret/provider
  // settings have not been added to the deployment yet.
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    session = null;
  }
  let udhetimet: Udhetim[];
  try {
    udhetimet = await lexoUdhetimet();
  } catch {
    return (
      <main>
        <h1>RideShare</h1>
        <p><Hyrja brenda={Boolean(session)} /></p>
        <p><Link href="/panel">Paneli im</Link></p>
        <p role="alert">Nuk u lidhem me databazen. Provo perseri.</p>
        <a className="action" href="/">Provo perseri</a>
      </main>
    );
  }

  return (
    <main>
      <h1>RideShare - Udhetimet per AAB</h1>
      <p><Hyrja brenda={Boolean(session)} /></p>
        <p><Link href="/panel">Paneli im</Link></p>
      <p>Burimi: Neon - te dhena fiktive per ushtrime</p>
      {udhetimet.length === 0 ? (
        <>
          <p>Nuk ka udhetime per momentin.</p>
          <a className='action' href='/'>Rifresko listen</a>
        </>
      ) : (
        <div className="trip-list">
          {udhetimet.map((udhetim) => (
            <KartaUdhetimi key={udhetim.id} udhetim={udhetim} />
          ))}
        </div>
      )}
    </main>
  );
}
