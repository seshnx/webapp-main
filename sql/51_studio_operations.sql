-- =====================================================
-- STUDIO OPERATIONS MODULE - SQL Editor Script
-- =====================================================
-- This script sets up all database tables, columns, and indexes
-- needed for the Studio Operations module
-- (Staff scheduling, inventory management, maintenance tracking)
-- =====================================================
-- Architecture: Neon PostgreSQL (persistent data)
-- Real-time sync: Convex (for live updates)
-- =====================================================

-- =====================================================
-- STUDIO STAFF TABLE
-- =====================================================
-- Staff roster with roles and compensation
CREATE TABLE IF NOT EXISTS studio_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    staff_user_id UUID, -- SeshNx user (NULL if external staff)
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('engineer', 'assistant', 'manager', 'intern', 'technician', 'producer', 'other')),
    pay_rate_type TEXT CHECK (pay_rate_type IN ('hourly', 'per_session', 'percentage', 'salary')),
    pay_rate NUMERIC(10, 2),
    skills TEXT[] DEFAULT '{}',
    availability JSONB DEFAULT '{}'::jsonb, -- e.g., {"monday": ["9:00-17:00"], "unavailable_dates": []}
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    hire_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studio_staff_studio_id ON studio_staff(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_staff_role ON studio_staff(role);
CREATE INDEX IF NOT EXISTS idx_studio_staff_status ON studio_staff(status);
CREATE INDEX IF NOT EXISTS idx_studio_staff_skills ON studio_staff USING GIN(skills);

-- =====================================================
-- STAFF SHIFTS TABLE
-- =====================================================
-- Shift scheduling and time tracking
CREATE TABLE IF NOT EXISTS staff_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES studio_staff(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL, -- Linked booking if applicable
    shift_date TIMESTAMPTZ NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    hours_worked NUMERIC(4, 2),
    pay_amount NUMERIC(10, 2),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'missed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_shifts_staff_id ON staff_shifts(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_date ON staff_shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_status ON staff_shifts(status);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_booking_id ON staff_shifts(booking_id);

-- =====================================================
-- EQUIPMENT MAINTENANCE TABLE
-- =====================================================
-- Maintenance scheduling and tracking for studio equipment
CREATE TABLE IF NOT EXISTS equipment_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    equipment_id TEXT NOT NULL, -- References equipment_database item (stored as text + index)
    equipment_name TEXT NOT NULL, -- Denormalized for performance
    maintenance_type TEXT CHECK (maintenance_type IN ('calibration', 'repair', 'inspection', 'cleaning', 'upgrade', 'replacement')),
    scheduled_date TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'overdue')),
    assigned_to UUID, -- Staff or user assigned
    cost NUMERIC(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_studio_id ON equipment_maintenance(studio_id);
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_status ON equipment_maintenance(status);
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_scheduled_date ON equipment_maintenance(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_equipment_id ON equipment_maintenance(equipment_id);

-- =====================================================
-- INVENTORY ITEMS TABLE
-- =====================================================
-- Inventory catalog for consumables and supplies
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    name TEXT NOT NULL,
    sku TEXT,
    category TEXT,
    unit TEXT CHECK (unit IN ('each', 'box', 'pack', 'set', 'hours', 'sqft', 'kg', 'liters', 'roll')),
    current_stock INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    unit_cost NUMERIC(10, 2),
    vendor TEXT,
    last_restocked_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_studio_id ON inventory_items(studio_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku) WHERE sku IS NOT NULL;

-- =====================================================
-- INVENTORY TRANSACTIONS TABLE
-- =====================================================
-- Track all inventory movements (add, remove, transfer, adjust)
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('add', 'remove', 'transfer', 'adjust')),
    quantity INTEGER NOT NULL, -- Positive for add, negative for remove
    reference_id UUID, -- booking_id, maintenance_id, etc.
    reference_type TEXT, -- 'booking', 'maintenance', 'purchase', 'loss', etc.
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item_id ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON inventory_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_reference ON inventory_transactions(reference_type, reference_id);

-- =====================================================
-- STUDIO TASKS TABLE
-- =====================================================
-- Task management and assignment system
CREATE TABLE IF NOT EXISTS studio_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
    assigned_to UUID, -- Staff or user assigned
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    task_type TEXT CHECK (task_type IN ('one_time', 'recurring', 'template')),
    recurrence_rule JSONB, -- e.g., {"frequency": "weekly", "days": ["monday"], "end_date": "..."}
    completed_by UUID, -- User who completed the task
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studio_tasks_studio_id ON studio_tasks(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_tasks_status ON studio_tasks(status);
CREATE INDEX IF NOT EXISTS idx_studio_tasks_priority ON studio_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_studio_tasks_assigned_to ON studio_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_studio_tasks_due_date ON studio_tasks(due_date);

-- =====================================================
-- FACILITY MAINTENANCE TABLE
-- =====================================================
-- Facility and building maintenance tracking
CREATE TABLE IF NOT EXISTS facility_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    area TEXT NOT NULL CHECK (area IN ('live_room', 'control_room', 'lounge', 'restroom', 'parking', 'exterior', 'other')),
    task_type TEXT CHECK (task_type IN ('cleaning', 'repair', 'inspection', 'upgrade', 'replacement', 'renovation')),
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
    assigned_to UUID, -- Staff or user assigned
    scheduled_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    cost NUMERIC(10, 2),
    photos JSONB DEFAULT '[]'::jsonb, -- Before/after photos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_facility_maintenance_studio_id ON facility_maintenance(studio_id);
CREATE INDEX IF NOT EXISTS idx_facility_maintenance_status ON facility_maintenance(status);
CREATE INDEX IF NOT EXISTS idx_facility_maintenance_priority ON facility_maintenance(priority);
CREATE INDEX IF NOT EXISTS idx_facility_maintenance_area ON facility_maintenance(area);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_studio_staff_updated_at
    BEFORE UPDATE ON studio_staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_studio_tasks_updated_at
    BEFORE UPDATE ON studio_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facility_maintenance_updated_at
    BEFORE UPDATE ON facility_maintenance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update task completed_at when status changes to completed
CREATE OR REPLACE FUNCTION update_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
        NEW.completed_by = NEW.assigned_to; -- Track who completed it
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_completed_at
    BEFORE UPDATE ON studio_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_task_completed_at();

-- Auto-update facility maintenance completed_date
CREATE OR REPLACE FUNCTION update_facility_completed_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_date = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_facility_completed_date
    BEFORE UPDATE ON facility_maintenance
    FOR EACH ROW
    EXECUTE FUNCTION update_facility_completed_date();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE studio_staff IS 'Staff roster - engineers, assistants, managers, interns with compensation details';
COMMENT ON TABLE staff_shifts IS 'Shift scheduling and time tracking - links to bookings for session work';
COMMENT ON TABLE equipment_maintenance IS 'Maintenance scheduling for studio equipment - calibration, repairs, inspections';
COMMENT ON TABLE inventory_items IS 'Inventory catalog for consumables and supplies with stock levels';
COMMENT ON TABLE inventory_transactions IS 'Track all inventory movements - additions, removals, transfers, adjustments';
COMMENT ON TABLE studio_tasks IS 'Task management system - assignable to staff with priority and due dates';
COMMENT ON TABLE facility_maintenance IS 'Facility maintenance tracking - rooms, areas, building maintenance tasks';

-- =====================================================
-- END OF STUDIO OPERATIONS MODULE
-- =====================================================
