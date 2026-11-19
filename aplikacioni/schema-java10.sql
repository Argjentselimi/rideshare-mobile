-- Run after schema-java05.sql and schema-java09.sql in the RideShare Neon database.
-- A traveler has one request per trip; accepting it consumes one free seat once.
CREATE TABLE IF NOT EXISTS udhetim_kerkesa (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  udhetim_id TEXT NOT NULL REFERENCES udhetimet(id) ON DELETE CASCADE,
  udhetar_id TEXT NOT NULL REFERENCES profilet(github_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ne_pritje'
    CHECK (status IN ('ne_pritje', 'pranuar')),
  krijuar_me TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  perditesuar_me TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (udhetim_id, udhetar_id)
);

CREATE INDEX IF NOT EXISTS udhetim_kerkesa_udhetim_id_idx
  ON udhetim_kerkesa (udhetim_id, krijuar_me);
