"use client";

import { useEffect, useRef, useState } from "react";
import type { GjendjaUdhetimit as TipiGjendjes } from "@/lib/gjendja-udhetimit";

const INTERVALI_MS = 5000;

type Props = {
  udhetimId: string;
  udhetimFillestar: {
    id: string;
    nisja: string;
    destinacioni: string;
    ora: string;
    vendtakimi: string;
    vende: number;
  };
};

type Pergjigjja = {
  error?: string;
  message?: string;
  gjendja?: TipiGjendjes;
};

export default function GjendjaUdhetimit({ udhetimId, udhetimFillestar }: Props) {
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

  const udhetimi = gjendja?.udhetim ?? { ...udhetimFillestar, shoferEmri: null };
  const vendet = udhetimi.vende;
  const kerkesaIme = gjendja?.kerkesaIme ?? null;
  const veprimiBllokuar = !lidhur || dukeVepruar || !gjendja || !navigatorOnline();
  const callbackUrl = encodeURIComponent(`/udhetimi/${udhetimId}`);

  return (
    <section className="sync-panel" aria-labelledby="sync-title">
      <div className="sync-brand">
        <div>
          <h2 id="sync-title">RideShare</h2>
          <p>
            {gjendja?.iKycur
              ? `${gjendja.emriPerdoruesit ?? "Përdoruesi"} · ${gjendja.jamShoferi ? "Shofer" : "Udhëtar"}`
              : "Udhëtim i përbashkët"}
          </p>
        </div>
        <span className="sync-live-indicator">● Live</span>
      </div>
      <p className="sync-trip-index">UDHËTIMI {udhetimi.id}</p>
      <article className="sync-trip-card">
        <p className="sync-route">{udhetimi.nisja} → {udhetimi.destinacioni}</p>
        <h3>Nisja {udhetimi.ora}</h3>
        <p className="sync-driver-name">{udhetimi.shoferEmri ?? "Shoferi nuk është caktuar"}</p>
        <div className="sync-trip-stats">
          <div>
            <span>Vende të lira</span>
            <strong>{vendet}</strong>
          </div>
          <div>
            <span>Statusi</span>
            <strong>{vendet > 0 ? "Aktiv" : "I mbushur"}</strong>
          </div>
        </div>
      </article>

      {!gjendja ? (
        <section className="request-card request-empty">
          <p className="request-label">KËRKESA</p>
          <p className="request-status">Po lexohet…</p>
        </section>
      ) : !gjendja.iKycur ? (
        <section className="request-card request-empty">
          <p className="request-label">KËRKESA IME</p>
          <p className="request-status">Pa kërkesë</p>
          <p>
            <a href={`/api/auth/signin?callbackUrl=${callbackUrl}`}>Hyr me GitHub</a> për të kërkuar ose menaxhuar vendet.
          </p>
        </section>
      ) : gjendja.jamShoferi ? (
        <div className="request-list">
          {gjendja.kerkesat.length === 0 ? (
            <section className="request-card request-empty">
              <p className="request-label">KËRKESAT E UDHËTARËVE</p>
              <p className="request-status">Pa kërkesë</p>
              <p>Ende pa kërkesa.</p>
            </section>
          ) : (
            gjendja.kerkesat.map((kerkesa) => (
              <article className="request-card" key={kerkesa.id}>
                <p className="request-label">KËRKESA E {kerkesa.udhetarEmri}</p>
                <p className={`request-status ${kerkesa.status === "pranuar" ? "is-accepted" : "is-pending"}`}>
                  {kerkesa.status === "pranuar" ? "U pranua" : "Në pritje"}
                </p>
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
        <section className="passenger-request request-card">
          <p className="request-label">KËRKESA IME</p>
          {kerkesaIme ? (
            <p className={`request-status ${kerkesaIme.status === "pranuar" ? "is-accepted" : "is-pending"}`}>
              {kerkesaIme.status === "pranuar" ? "U pranua · vendi u konfirmua" : "Në pritje · kërkesa u dërgua"}
            </p>
          ) : (
            <>
              <p className="request-status">Pa kërkesë</p>
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
        </section>
      )}

      <p className={`connection-status ${lidhur ? "is-connected" : "is-reconnecting"}`} role="status" aria-live="polite">
        {lidhur ? "Gjendja u lexua nga serveri" : "Po rilidhemi · të dhënat mund të jenë të vjetra"}
      </p>
      <p className="polling-hint">Përditësim automatik çdo 5 sekonda</p>
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
