-- Vibe & Pixel analytics. Run once with `npm run db:setup` (safe to run again).
-- No IP addresses, names or phone numbers: see lib/analytics/events.ts and lib/analytics/anon.ts.

create table if not exists events (
  id           bigserial primary key,
  ts           timestamptz not null default now(),
  name         text not null,           -- page_view, whatsapp_click, … (lib/analytics/events.ts)
  path         text not null,           -- page path, no query string
  locale       text not null,           -- en | ar
  referrer     text,                    -- referring site's domain only, on page views from other sites
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  device       text,                    -- phone | tablet | desktop
  country      text,                    -- from the host's request headers, when it provides them
  region       text,                    -- e.g. the emirate, when the host provides it
  visitor      text not null,           -- anonymous daily ID (changes every day)
  props        jsonb not null default '{}'::jsonb
);

create index if not exists events_ts_idx on events (ts);
create index if not exists events_name_ts_idx on events (name, ts);
create index if not exists events_visitor_ts_idx on events (visitor, ts);

-- one random salt per UAE day; older ones are deleted, which makes old visitor IDs unlinkable
create table if not exists salts (
  day  date primary key,
  salt text not null
);
