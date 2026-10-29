-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run

create table if not exists employees (
  id            serial primary key,
  name          text not null,
  email         text not null unique,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

create table if not exists enquiries (
  id              serial primary key,
  name            text not null,
  email           text not null,
  phone           text,
  course_interest text not null,
  message         text,
  claimed_by      int references employees(id),
  claimed_at      timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists enquiries_claimed_by_idx on enquiries(claimed_by);
