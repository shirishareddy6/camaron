-- ============================================================
-- Camaron Platform — Database Schema v1
-- Run: psql -U camaron_user -d camaron -f 001_init.sql
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUMS ────────────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('farmer', 'vendor', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE product_category AS ENUM ('feed', 'health_care', 'equipment', 'other');
CREATE TYPE pond_status AS ENUM ('active', 'fallow', 'harvested');

-- ── USERS ─────────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone         VARCHAR(15) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE,
  name          VARCHAR(255),
  role          user_role NOT NULL DEFAULT 'farmer',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone  ON users(phone);
CREATE INDEX idx_users_role   ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- ── FARMER PROFILES ───────────────────────────────────────────────────────────

CREATE TABLE farmer_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  state           VARCHAR(100),
  district        VARCHAR(100),
  village         VARCHAR(100),
  pincode         VARCHAR(10),
  total_pond_area NUMERIC(10, 2),  -- acres
  experience_years INT,
  aadhaar_number  VARCHAR(20),
  bank_account    VARCHAR(30),
  ifsc_code       VARCHAR(15),
  community       VARCHAR(100),
  gender          VARCHAR(20),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ── VENDOR PROFILES ───────────────────────────────────────────────────────────

CREATE TABLE vendor_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name   VARCHAR(255) NOT NULL,
  gst_number      VARCHAR(20),
  state           VARCHAR(100),
  district        VARCHAR(100),
  address         TEXT,
  pincode         VARCHAR(10),
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ── PRODUCTS ──────────────────────────────────────────────────────────────────

CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) UNIQUE NOT NULL,
  category        product_category NOT NULL DEFAULT 'feed',
  description     TEXT,
  features        JSONB NOT NULL DEFAULT '[]',
  image_url       TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active   ON products(is_active);

-- ── VENDOR INVENTORY ─────────────────────────────────────────────────────────

CREATE TABLE vendor_inventory (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id       UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id),
  price_per_unit  NUMERIC(12, 2) NOT NULL,
  unit            VARCHAR(20) NOT NULL DEFAULT 'kg',    -- kg, bag (25kg), etc.
  stock_qty       INT NOT NULL DEFAULT 0,
  min_order_qty   INT NOT NULL DEFAULT 1,
  is_available    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(vendor_id, product_id)
);

CREATE INDEX idx_inventory_vendor  ON vendor_inventory(vendor_id);
CREATE INDEX idx_inventory_product ON vendor_inventory(product_id);

-- ── PONDS ─────────────────────────────────────────────────────────────────────

CREATE TABLE ponds (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id       UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
  name            VARCHAR(100) NOT NULL,
  area_acres      NUMERIC(8, 2),
  shrimp_variety  VARCHAR(100),      -- vannamei, black tiger
  stocking_date   DATE,
  expected_harvest DATE,
  status          pond_status NOT NULL DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ponds_farmer ON ponds(farmer_id);
CREATE INDEX idx_ponds_status ON ponds(status);

-- ── ORDERS ───────────────────────────────────────────────────────────────────

CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number    VARCHAR(20) UNIQUE NOT NULL,
  buyer_id        UUID NOT NULL REFERENCES users(id),
  vendor_id       UUID NOT NULL REFERENCES vendor_profiles(id),
  status          order_status NOT NULL DEFAULT 'pending',
  total_amount    NUMERIC(14, 2) NOT NULL,
  delivery_address TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer  ON orders(buyer_id);
CREATE INDEX idx_orders_vendor ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ── ORDER ITEMS ───────────────────────────────────────────────────────────────

CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  inventory_id    UUID NOT NULL REFERENCES vendor_inventory(id),
  quantity        INT NOT NULL,
  unit_price      NUMERIC(12, 2) NOT NULL,
  subtotal        NUMERIC(14, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- ── OTP STORE ─────────────────────────────────────────────────────────────────
-- (used as fallback; primary store is Redis)
CREATE TABLE otp_attempts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone       VARCHAR(15) NOT NULL,
  attempts    INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── AUDIT LOG ─────────────────────────────────────────────────────────────────

CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  entity      VARCHAR(100),
  entity_id   UUID,
  meta        JSONB,
  ip          INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user    ON audit_log(user_id);
CREATE INDEX idx_audit_action  ON audit_log(action);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- ── AUTO-UPDATE updated_at ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['users','farmer_profiles','vendor_profiles','products',
                              'vendor_inventory','ponds','orders']
  LOOP
    EXECUTE format('CREATE TRIGGER trg_%s_updated_at
      BEFORE UPDATE ON %s
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()', tbl, tbl);
  END LOOP;
END;
$$;

-- ── ORDER NUMBER SEQUENCE ─────────────────────────────────────────────────────

CREATE SEQUENCE order_seq START 10000 INCREMENT 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'CAM-' || LPAD(nextval('order_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();
