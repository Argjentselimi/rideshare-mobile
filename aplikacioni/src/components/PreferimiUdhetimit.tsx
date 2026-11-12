"use client";

import { useState } from "react";

type Props = {
  udhetimId: string;
  iKycur: boolean;
  fillimishtIRuajtur: boolean;
  fillimishtNumer: number;
};

type Status = "gati" | "dukeRuajtur" | "ruajtur" | "gabim";

export default function PreferimiUdhetimit({
  udhetimId,
  iKycur,
  fillimishtIRuajtur,
  fillimishtNumer,
}: Props) {
  const [iRuajtur, caktoIRuajtur] = useState(fillimishtIRuajtur);
  const [numer, caktoNumer] = useState(fillimishtNumer);
  const [status, caktoStatus] = useState<Status>(
    fillimishtIRuajtur ? "ruajtur" : "gati",
  );

  async function ruajUdhetimin() {
    if (!iKycur || iRuajtur || status === "dukeRuajtur") return;

    const gjendjaEme = { iRuajtur, numer };
    caktoIRuajtur(true);
    caktoNumer(numer + 1);
    caktoStatus("dukeRuajtur");

    try {
      const response = await fetch(`/api/udhetimet/${encodeURIComponent(udhetimId)}/preferim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!response.ok) throw new Error("Ruajtja dështoi.");

      const data = (await response.json()) as { iRuajtur?: boolean; numer?: number };
      if (data.iRuajtur !== true || typeof data.numer !== "number") {
        throw new Error("Përgjigjja e serverit nuk është e vlefshme.");
      }

      caktoIRuajtur(true);
      caktoNumer(data.numer);
      caktoStatus("ruajtur");
    } catch {
      caktoIRuajtur(gjendjaEme.iRuajtur);
      caktoNumer(gjendjaEme.numer);
      caktoStatus("gabim");
    }
  }

  if (!iKycur) {
    const callbackUrl = encodeURIComponent(`/udhetimi/${udhetimId}`);
    return (
      <section className="favorite-panel" aria-labelledby="favorite-title">
        <h2 id="favorite-title">Të preferuarat</h2>
        <p>Preferim personal · jo rezervim</p>
        <a href={`/api/auth/signin?callbackUrl=${callbackUrl}`}>Hyr me GitHub për ta ruajtur</a>
      </section>
    );
  }

  const label =
    status === "dukeRuajtur"
      ? "★ Po ruhet…"
      : status === "ruajtur"
        ? "★ I ruajtur"
        : status === "gabim"
          ? "☆ Provo përsëri"
          : "☆ Ruaj udhëtimin";
  const mesazhi =
    status === "dukeRuajtur"
      ? "Po presim konfirmimin e serverit."
      : status === "ruajtur"
        ? fillimishtIRuajtur && status === "ruajtur"
          ? "Preferimet u lexuan nga serveri."
          : "U ruajt te të preferuarat."
        : status === "gabim"
          ? "Nuk u ruajt. Provo përsëri."
          : "Nuk është te të preferuarat.";

  return (
    <section className="favorite-panel" aria-labelledby="favorite-title">
      <h2 id="favorite-title">Të preferuarat</h2>
      <p className="favorite-count"><strong>{numer}</strong></p>
      <p>Preferim personal · jo rezervim</p>
      <button
        className="action favorite-action"
        type="button"
        onClick={ruajUdhetimin}
        disabled={iRuajtur || status === "dukeRuajtur"}
        aria-pressed={iRuajtur}
        aria-busy={status === "dukeRuajtur"}
      >
        {label}
      </button>
      <p
        className="favorite-message"
        aria-live="polite"
        role={status === "gabim" ? "alert" : undefined}
      >
        {mesazhi}
      </p>
    </section>
  );
}
