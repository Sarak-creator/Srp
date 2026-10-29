-- ============================================================
-- Migration: Add bottle balance ledger tracking columns to orders table
-- Created at: 2026-10-29
-- ============================================================

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS previous_empty_containers_held INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_empty_containers_held INT DEFAULT 0;

COMMENT ON COLUMN orders.previous_empty_containers_held IS 'Customer empty 20L containers held before this order';
COMMENT ON COLUMN orders.total_empty_containers_held IS 'Customer total empty 20L containers held after this order';

