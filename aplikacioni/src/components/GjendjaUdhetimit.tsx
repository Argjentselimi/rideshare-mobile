"use client";

import { useEffect, useRef, useState } from "react";
import type { GjendjaUdhetimit as TipiGjendjes } from "@/lib/gjendja-udhetimit";

const INTERVALI_MS = 5000;

type Props = {
  udhetimId: string;
  vendeFillestare: number;
};

type Pergjigjja = {
  error?: string;
  message?: string;
  gjendja?: TipiGjendjes;
};

export default function GjendjaUdhetimit({ udhetimId, vendeFillestare }: Props) {
  const [gjendja, caktoGjendjen] = useState<TipiGjendjes | null>(null);
  const [lidhur, caktoLidhur] = useState(false);
  const [dukeVepruar, caktoDukeVepruar] = useState(false);
  const [mesazhiVeprimit, caktoMesazhinVeprimit] = useState("");
  const [gabimVeprimi, caktoGabiminVeprimit] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollNeVazhdim = useRef(false);
  const kontrolluesi = useRef<AbortController | null>(null);
  const perseritMenjehere = useRef(false);
  const veprimiNeVazhdim = useRef(false);
  const versioni = useRef(0);
  const rilexoRef = useRef<() => void>(() => {});

  useEffect(() => {
    let iMbyllur = false;

    function planifikoVazhdimin() {
      if (timer.current) clearTimeout(timer.current);
      if (iMbyllur) return;
      timer.current = setTimeout(() => void rilexo(), INTERVALI_MS);
    }

    async function rilexo() {
      if (iMbyllur) return;
      if (pollNeVazhdim.current) return;
      if (veprimiNeVazhdim.current) {
        planifikoVazhdimin();
        return;
      }

      pollNeVazhdim.current = true;
      const versioniLeximit = versioni.current;
      const controller = new AbortController();
      kontrolluesi.current = controller;
      try {
        const response = await fetch(
          `/api/udhetimet/${encodeURIComponent(udhetimId)}/gjendja`,
          { cache: "no-store", signal: controller.signal },
        );
        if (!response.ok) throw new Error("Leximi dështoi.");
        const data = (await response.json()) as TipiGjendjes;
        if (!iMbyllur && versioniLeximit === versioni.current) {
          caktoGjendjen(data);
          caktoLidhur(true);
        }
      } catch {
        if (
          !iMbyllur &&
          !controller.signal.aborted &&
          versioniLeximit === versioni.current
        ) {
          caktoLidhur(false);
        }
      } finally {
        if (kontrolluesi.current === controller) kontrolluesi.current = null;
        pollNeVazhdim.current = false;
        if (perseritMenjehere.current && !veprimiNeVazhdim.current) {
          perseritMenjehere.current = false;
          void rilexo();
        } else {
          planifikoVazhdimin();
        }
      }
    }

    rilexoRef.current = () => {
      if (timer.current) clearTimeout(timer.current);
      if (pollNeVazhdim.current) {
        perseritMenjehere.current = true;
        kontrolluesi.current?.abort();
        return;
      }
      void rilexo();
    };

    function uRikthyeOnline() {
      caktoLidhur(false);
      rilexoRef.current();
    }
    function doliOffline() {
      caktoLidhur(false);
      kontrolluesi.current?.abort();
    }

    void rilexo();
    window.addEventListener("online", uRikthyeOnline);
    window.addEventListener("offline", doliOffline);
    return () => {
      iMbyllur = true;
      if (timer.current) clearTimeout(timer.current);
      kontrolluesi.current?.abort();
      window.removeEventListener("online", uRikthyeOnline);
      window.removeEventListener("offline", doliOffline);
      rilexoRef.current = () => {};
    };
  }, [udhetimId]);

  async function kryejVeprimin(url: string) {
    if (dukeVepruar || !lidhur || !navigator.onLine) return;
    caktoDukeVepruar(true);
    veprimiNeVazhdim.current = true;
    versioni.current += 1;
    kontrolluesi.current?.abort();
    caktoGabiminVeprimit(false);
    caktoMesazhinVeprimit("");

    try {
      const response = await fetch(url, {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = (await response.json()) as Pergjigjja;
      if (data.gjendja) {
        caktoGjendjen(data.gjendja);
        caktoLidhur(true);
      }
      if (!response.ok) throw new Error(data.error ?? "Veprimi dështoi.");
      caktoMesazhinVeprimit(data.message ?? "Gjendja u ruajt.");
    } catch (error) {
      caktoGabiminVeprimit(true);
      caktoMesazhinVeprimit(
        error instanceof Error
          ? error.message
          : "Veprimi dështoi. Të dhënat e fundit ruhen në ekran.",
      );
      if (!navigator.onLine) caktoLidhur(false);
    } finally {
      veprimiNeVazhdim.current = false;
      caktoDukeVepruar(false);
      rilexoRef.current();
    }
  }

  const vendet = gjendja?.udhetim.vende ?? vendeFillestare;
  const kerkesaIme = gjendja?.kerkesaIme ?? null;
  const veprimiBllokuar = !lidhur || dukeVepruar || !gjendja || !navigatorOnline();
  const callbackUrl = encodeURIComponent(`/udhetimi/${udhetimId}`);

  return (
    <section className="sync-panel" aria-labelledby="sync-title">
      <h2 id="sync-title">Gjendja e udhëtimit</h2>
      <div className="sync-trip-summary">
        <p><strong>Vende të lira:</strong> <span className="seat-count">{vendet}</span></p>
        <p><strong>Shoferi:</strong> {gjendja?.udhetim.shoferEmri ?? "Pa shofer të caktuar"}</p>
      </div>

      {!gjendja ? (
        <p role="status">Po lexohet gjendja nga serveri…</p>
      ) : !gjendja.iKycur ? (
        <p>
          <a href={`/api/auth/signin?callbackUrl=${callbackUrl}`}>Hyr me GitHub</a> për të kërkuar ose menaxhuar vendet.
        </p>
      ) : gjendja.jamShoferi ? (
        <div className="request-list">
          <h3>Kërkesat për udhëtimin tim</h3>
          {gjendja.kerkesat.length === 0 ? (
            <p>Ende pa kërkesa.</p>
          ) : (
            gjendja.kerkesat.map((kerkesa) => (
              <article className="request-card" key={kerkesa.id}>
                <p><strong>{kerkesa.udhetarEmri}</strong></p>
                <p>Statusi: {kerkesa.status === "pranuar" ? "U pranua" : "Në pritje"}</p>
                {kerkesa.status === "ne_pritje" && (
                  <button
                    className="action"
                    type="button"
                    disabled={veprimiBllokuar || vendet < 1}
                    aria-busy={dukeVepruar}
                    onClick={() => void kryejVeprimin(
                      `/api/udhetimet/${encodeURIComponent(udhetimId)}/kerkesa/${encodeURIComponent(kerkesa.id)}/prano`,
                    )}
                  >
                    {dukeVepruar ? "Po ruhet…" : vendet < 1 ? "Nuk ka vende" : "Prano kërkesën"}
                  </button>
                )}
              </article>
            ))
          )}
        </div>
      ) : (
        <div className="passenger-request">
          <h3>Kërkesa ime</h3>
          {kerkesaIme ? (
            <p className="request-status">
              {kerkesaIme.status === "pranuar" ? "U pranua · vendi u konfirmua" : "Në pritje · kërkesa u dërgua"}
            </p>
          ) : (
            <>
              <p>Pa kërkesë</p>
              <button
                className="action"
                type="button"
                disabled={veprimiBllokuar || vendet < 1 || !gjendja.udhetim.shoferEmri}
                aria-busy={dukeVepruar}
                onClick={() => void kryejVeprimin(
                  `/api/udhetimet/${encodeURIComponent(udhetimId)}/kerkesa`,
                )}
              >
                {dukeVepruar
                  ? "Po dërgohet…"
                  : vendet < 1
                    ? "Nuk ka vende të lira"
                    : !gjendja.udhetim.shoferEmri
                      ? "Prit caktimin e shoferit"
                      : "Kërko një vend"}
              </button>
            </>
          )}
        </div>
      )}

      <p className="connection-status" role="status" aria-live="polite">
        {lidhur ? "Gjendja u lexua nga serveri · përditësim automatik çdo 5 sekonda" : "Po rilidhemi · të dhënat e shfaqura mund të jenë të vjetra"}
      </p>
      {mesazhiVeprimit && (
        <p className="action-message" role={gabimVeprimi ? "alert" : "status"} aria-live="polite">
          {mesazhiVeprimit}
        </p>
      )}
      {!lidhur && (
        <p className="offline-action-note">Veprimet që kërkojnë rrjet janë të bllokuara.</p>
      )}
    </section>
  );
}

function navigatorOnline() {
  return typeof navigator === "undefined" || navigator.onLine;
}
