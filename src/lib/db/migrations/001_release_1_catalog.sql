do $$
begin
  create type content_visibility as enum ('public', 'unlisted', 'private');
exception
  when duplicate_object then null;
end
$$;

create table if not exists tunes (
  id text primary key,
  slug text not null unique,
  name text not null,
  tune_type text not null,
  summary text not null
);

create table if not exists tune_aliases (
  id text primary key,
  tune_id text not null references tunes(id) on delete cascade,
  name text not null,
  normalized_name text not null unique
);

create table if not exists charts (
  id text primary key,
  slug text not null unique,
  tune_id text not null references tunes(id) on delete cascade,
  title text not null,
  chart_key text not null,
  mode text not null,
  meter text not null check (meter ~ '^[0-9]+/[0-9]+$'),
  content_markdown text not null,
  visibility content_visibility not null
);

create table if not exists sets (
  id text primary key,
  slug text not null unique,
  name text not null,
  summary text not null,
  visibility content_visibility not null
);

create table if not exists set_entries (
  set_id text not null references sets(id) on delete cascade,
  position integer not null check (position > 0),
  tune_id text not null references tunes(id) on delete restrict,
  chart_id text not null references charts(id) on delete restrict,
  primary key (set_id, position)
);

create table if not exists gig_sheets (
  id text primary key,
  slug text not null unique,
  name text not null,
  summary text not null,
  visibility content_visibility not null
);

create table if not exists gig_sheet_entries (
  gig_sheet_id text not null references gig_sheets(id) on delete cascade,
  position integer not null check (position > 0),
  set_id text not null references sets(id) on delete restrict,
  transition_notes text,
  primary key (gig_sheet_id, position)
);

create index if not exists tune_aliases_tune_id_idx on tune_aliases (tune_id);
create index if not exists charts_tune_id_idx on charts (tune_id);
create index if not exists set_entries_tune_id_idx on set_entries (tune_id);
create index if not exists set_entries_chart_id_idx on set_entries (chart_id);
create index if not exists gig_sheet_entries_set_id_idx on gig_sheet_entries (set_id);
