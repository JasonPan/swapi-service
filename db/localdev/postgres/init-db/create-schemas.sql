CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS swapi_dev;

CREATE TABLE IF NOT EXISTS swapi_dev.query (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  callback_url text NULL,
  "status" text NOT NULL,
  CONSTRAINT query_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS swapi_dev.subquery (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  "path" text NOT NULL,
  query_id uuid NOT NULL,
  result json NULL,
  CONSTRAINT subquery_pkey PRIMARY KEY (id),
  CONSTRAINT fk_subquery_query FOREIGN KEY (query_id) REFERENCES swapi_dev.query(id) ON DELETE SET NULL
);
