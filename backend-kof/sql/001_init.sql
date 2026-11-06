-- MESCE — schema de desenvolvimento APENAS na branch Neon mesce-dev-2026-11.
-- Não executar em produção. Todos os valores pessoais armazenados cifrados no backend.
-- Auth0 sub é identificador pseudônimo: continua dado pessoal e deve permanecer protegido.
CREATE SCHEMA IF NOT EXISTS mesce_dev;

CREATE TABLE IF NOT EXISTS mesce_dev.actors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_sub text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('COORDINATOR', 'MINISTER')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mesce_dev.ministers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid UNIQUE REFERENCES mesce_dev.actors(id) ON DELETE SET NULL,
  name_ciphertext text NOT NULL,
  phone_ciphertext text,
  phone_hmac char(64),
  started_on date,
  monthly_limit smallint CHECK (monthly_limit IS NULL OR monthly_limit > 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mesce_dev.assisted_people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ciphertext text NOT NULL,
  address_ciphertext text NOT NULL,
  phone_ciphertext text,
  family_contact_ciphertext text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mesce_dev.celebrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurs_on date NOT NULL,
  starts_at time NOT NULL,
  location_code text NOT NULL,
  kind text NOT NULL,
  required_ministers smallint NOT NULL CHECK (required_ministers BETWEEN 1 AND 30),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mesce_dev.impediments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  minister_id uuid NOT NULL REFERENCES mesce_dev.ministers(id),
  scope text NOT NULL CHECK (scope IN ('CELEBRATION','DAY','PERIOD')),
  celebration_id uuid REFERENCES mesce_dev.celebrations(id),
  days date[],
  starts_on date,
  ends_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (scope='CELEBRATION' AND celebration_id IS NOT NULL AND days IS NULL AND starts_on IS NULL AND ends_on IS NULL)
    OR
    (scope='DAY' AND celebration_id IS NULL AND days IS NOT NULL AND cardinality(days)>0 AND starts_on IS NULL AND ends_on IS NULL)
    OR
    (scope='PERIOD' AND celebration_id IS NULL AND days IS NULL AND starts_on IS NOT NULL AND ends_on IS NOT NULL AND starts_on<=ends_on)
  )
);

CREATE TABLE IF NOT EXISTS mesce_dev.visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assisted_id uuid NOT NULL REFERENCES mesce_dev.assisted_people(id),
  visits_on date NOT NULL,
  required_ministers smallint NOT NULL CHECK(required_ministers BETWEEN 1 AND 8),
  CHECK(EXTRACT(ISODOW FROM visits_on)=7),
  UNIQUE (assisted_id,visits_on)
);

CREATE TABLE IF NOT EXISTS mesce_dev.schedule_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  minister_id uuid NOT NULL REFERENCES mesce_dev.ministers(id),
  celebration_id uuid REFERENCES mesce_dev.celebrations(id),
  visit_id uuid REFERENCES mesce_dev.visits(id),
  version_number integer NOT NULL CHECK (version_number>0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((celebration_id IS NOT NULL) <> (visit_id IS NOT NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS one_celebration_assignment
ON mesce_dev.schedule_assignments(celebration_id,minister_id,version_number) WHERE celebration_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS one_visit_assignment
ON mesce_dev.schedule_assignments(visit_id,minister_id,version_number) WHERE visit_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS mesce_dev.audit_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id uuid REFERENCES mesce_dev.actors(id),
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Nenhum ministro/assistido/usuário real é inserido nesta migration.
