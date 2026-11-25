import type postgres from "postgres";

/*
 * Every number on the dashboard, from the events table. Days are counted in UAE time. A "visitor" is one anonymous
 * daily ID (lib/analytics/anon.ts), so "visitors" over a range means visitor-days: someone who comes on three days
 * counts three times. That is the honest limit of counting without cookies.
 */

export type Count = { key: string; n: number };
export type Window = {
  visitors: number;
  pageViews: number;
  clicks: number;
  clickers: number;
  builderSends: number;
  foundingClaims: number;
};
export type Trend = { day: string; visitors: number; clicks: number };
export type Funnel = { visited: number; reachedPrices: number; openedBuilder: number; sentBuilder: number; clicked: number };
export type LocaleSplit = { locale: string; visitors: number; clickers: number };
export type SourceRow = { key: string; visitors: number; clickers: number };

export type Dashboard = {
  days: number;
  current: Window;
  previous: Window;
  trend: Trend[];
  funnel: Funnel;
  clicksByButton: Count[];
  clicksByPackage: Count[];
  clicksByPlan: Count[];
  builderPackages: Count[];
  builderBands: Count[];
  builderCare: Count[];
  builderFounding: number;
  locales: LocaleSplit[];
  devices: SourceRow[];
  sources: SourceRow[];
  campaigns: Count[];
  regions: Count[];
  sections: Count[];
  faqs: Count[];
  pairs: Count[];
  langSwitches: Count[];
  offerCloses: number;
  totalEvents: number;
};

const TZ = "Asia/Dubai";
const ESTIMATE_PATHS = ["/estimate", "/ar/estimate"];

export async function loadDashboard(sql: postgres.Sql, days: number): Promise<Dashboard> {
  const since = sql`now() - make_interval(days => ${days})`;
  const before = sql`now() - make_interval(days => ${days * 2})`;
  // one person on one day
  const vd = sql`(visitor || '@' || (ts at time zone ${TZ})::date)`;

  const windowOf = async (from: postgres.PendingQuery<postgres.Row[]>, to: postgres.PendingQuery<postgres.Row[]>) => {
    const [w] = await sql<Window[]>`
      select
        count(distinct ${vd}) filter (where name = 'page_view')::int          as "visitors",
        count(*) filter (where name = 'page_view')::int                        as "pageViews",
        count(*) filter (where name = 'whatsapp_click')::int                   as "clicks",
        count(distinct ${vd}) filter (where name = 'whatsapp_click')::int     as "clickers",
        count(*) filter (where name = 'builder_send')::int                     as "builderSends",
        (count(*) filter (where name = 'whatsapp_click' and props->>'button' = 'offer_bar')
          + count(*) filter (where name = 'builder_send' and (props->>'founding')::boolean))::int as "foundingClaims"
      from events where ts >= ${from} and ts < ${to}`;
    return w;
  };

  const count = (name: string, field: string, limit = 12) => sql<Count[]>`
    select coalesce(props->>${field}, 'unknown') as key, count(*)::int as n
    from events where name = ${name} and ts >= ${since}
    group by 1 order by 2 desc limit ${limit}`;

  const bySource = (expr: postgres.PendingQuery<postgres.Row[]>, limit = 10) => sql<SourceRow[]>`
    with views as (
      select ${vd} as vd, ${expr} as key, ts from events where name = 'page_view' and ts >= ${since}
    ), first as (
      -- each visitor-day's first page view decides where they came from
      select distinct on (vd) vd, key from views order by vd, ts
    ), clicked as (
      select distinct ${vd} as vd from events where name = 'whatsapp_click' and ts >= ${since}
    )
    select first.key, count(*)::int as visitors, count(clicked.vd)::int as clickers
    from first left join clicked using (vd)
    group by 1 order by 2 desc limit ${limit}`;

  const [current, previous, trend, funnel, clicksByButton, clicksByPackage, clicksByPlan, builderPackages, builderBands, builderCare, founding, locales, devices, sources, campaigns, regions, sections, faqs, pairs, langSwitches, closes, total] =
    await Promise.all([
      windowOf(since, sql`now()`),
      windowOf(before, since),
      sql<Trend[]>`
        with days as (
          select generate_series((now() at time zone ${TZ})::date - (${days} - 1), (now() at time zone ${TZ})::date, interval '1 day')::date as day
        )
        select to_char(days.day, 'YYYY-MM-DD') as day,
          count(distinct ${vd}) filter (where e.name = 'page_view')::int as visitors,
          count(e.id) filter (where e.name = 'whatsapp_click')::int as clicks
        from days left join events e on (e.ts at time zone ${TZ})::date = days.day
        group by days.day order by days.day`,
      sql<Funnel[]>`
        select
          count(distinct ${vd}) filter (where name = 'page_view')::int as "visited",
          count(distinct ${vd}) filter (where (name = 'section_reach' and props->>'section' = 'prices') or (name = 'page_view' and path = any(${ESTIMATE_PATHS})))::int as "reachedPrices",
          count(distinct ${vd}) filter (where name = 'page_view' and path = any(${ESTIMATE_PATHS}))::int as "openedBuilder",
          count(distinct ${vd}) filter (where name = 'builder_send')::int as "sentBuilder",
          count(distinct ${vd}) filter (where name = 'whatsapp_click')::int as "clicked"
        from events where ts >= ${since}`.then((r) => r[0]),
      count("whatsapp_click", "button"),
      sql<Count[]>`select props->>'package' as key, count(*)::int as n from events
        where name = 'whatsapp_click' and ts >= ${since} and props ? 'package' group by 1 order by 2 desc`,
      sql<Count[]>`select props->>'plan' as key, count(*)::int as n from events
        where name = 'whatsapp_click' and ts >= ${since} and props ? 'plan' group by 1 order by 2 desc`,
      count("builder_send", "package"),
      count("builder_send", "band"),
      count("builder_send", "care"),
      sql<{ n: number }[]>`select count(*)::int as n from events where name = 'builder_send' and ts >= ${since} and (props->>'founding')::boolean`.then((r) => r[0].n),
      sql<LocaleSplit[]>`
        select locale,
          count(distinct ${vd}) filter (where name = 'page_view')::int as visitors,
          count(distinct ${vd}) filter (where name = 'whatsapp_click')::int as clickers
        from events where ts >= ${since} group by locale order by 2 desc`,
      bySource(sql`coalesce(device, 'unknown')`),
      bySource(sql`coalesce(utm_source, referrer, 'direct')`),
      sql<Count[]>`select utm_campaign as key, count(*)::int as n from events
        where name = 'page_view' and ts >= ${since} and utm_campaign is not null group by 1 order by 2 desc limit 10`,
      sql<Count[]>`select coalesce(country || coalesce('-' || region, ''), 'unknown') as key, count(distinct ${vd})::int as n
        from events where name = 'page_view' and ts >= ${since} group by 1 order by 2 desc limit 10`,
      sql<Count[]>`select props->>'section' as key, count(distinct ${vd})::int as n from events
        where name = 'section_reach' and ts >= ${since} group by 1 order by 2 desc`,
      count("faq_open", "tab"),
      count("compare_pick", "pair", 8),
      count("lang_switch", "to"),
      sql<{ n: number }[]>`select count(*)::int as n from events where name = 'offer_close' and ts >= ${since}`.then((r) => r[0].n),
      sql<{ n: number }[]>`select count(*)::int as n from events`.then((r) => r[0].n),
    ]);

  return {
    days,
    current,
    previous,
    trend,
    funnel,
    clicksByButton,
    clicksByPackage,
    clicksByPlan,
    builderPackages,
    builderBands,
    builderCare,
    builderFounding: founding,
    locales,
    devices,
    sources,
    campaigns,
    regions,
    sections,
    faqs,
    pairs,
    langSwitches,
    offerCloses: closes,
    totalEvents: total,
  };
}
