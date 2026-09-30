CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Enums
CREATE TYPE college_status AS ENUM ('active', 'incomplete', 'inactive');
CREATE TYPE admin_role AS ENUM ('super_admin', 'staff');
CREATE TYPE gender_enum AS ENUM ('Men', 'Women');
CREATE TYPE venue_status AS ENUM ('tba', 'confirmed', 'postponed', 'cancelled');
CREATE TYPE portal_phase AS ENUM ('initial', 'detailed');
CREATE TYPE override_state AS ENUM ('auto', 'force_open', 'force_close');
CREATE TYPE form_status AS ENUM ('draft', 'submitted', 'unlocked');
CREATE TYPE notif_type AS ENUM ('auto', 'manual');
CREATE TYPE notif_audience AS ENUM ('public', 'all_colleges', 'one_college');
CREATE TYPE outbox_status AS ENUM ('queued', 'sent', 'failed');
CREATE TYPE actor_type AS ENUM ('admin', 'college', 'system');

-- Base Functions (Updated At trigger)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Tables

CREATE TABLE colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE,
    temp_code TEXT,
    name TEXT NOT NULL,
    status college_status DEFAULT 'active',
    contact_phones TEXT[],
    default_athletics_zone TEXT,
    region TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_colleges_modtime BEFORE UPDATE ON colleges FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE college_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    email CITEXT UNIQUE NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    auth_user_id UUID UNIQUE, -- linked to auth.users in Supabase
    activated_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ
);

CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE,
    email CITEXT UNIQUE NOT NULL,
    full_name TEXT,
    role admin_role DEFAULT 'staff',
    is_active BOOLEAN DEFAULT true,
    mfa_enabled BOOLEAN DEFAULT false
);

CREATE TABLE sports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    display_order INT NOT NULL,
    group_name TEXT,
    is_team_sport BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE sport_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sport_id UUID REFERENCES sports(id) ON DELETE CASCADE,
    gender gender_enum NOT NULL,
    code TEXT UNIQUE NOT NULL,
    display_name TEXT,
    max_players INT DEFAULT 12,
    display_order INT,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(sport_id, gender)
);

CREATE TABLE event_venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sport_event_id UUID REFERENCES sport_events(id) ON DELETE CASCADE UNIQUE,
    host_college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
    venue_text TEXT,
    location TEXT,
    start_date DATE,
    end_date DATE,
    status venue_status DEFAULT 'tba',
    contact_name TEXT,
    contact_phone TEXT,
    remarks TEXT,
    updated_by UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_event_venues_modtime BEFORE UPDATE ON event_venues FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE portal_windows (
    phase portal_phase PRIMARY KEY,
    opens_at TIMESTAMPTZ NOT NULL,
    closes_at TIMESTAMPTZ NOT NULL,
    manual_override override_state DEFAULT 'auto',
    instructions TEXT,
    updated_by UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_portal_windows_modtime BEFORE UPDATE ON portal_windows FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE college_window_extensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    phase portal_phase NOT NULL,
    extended_until TIMESTAMPTZ NOT NULL,
    reason TEXT,
    granted_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE initial_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    sport_event_id UUID REFERENCES sport_events(id) ON DELETE CASCADE,
    participating BOOLEAN,
    submitted_at TIMESTAMPTZ,
    version INT DEFAULT 1,
    last_changed_by UUID,
    deleted_at TIMESTAMPTZ,
    UNIQUE(college_id, sport_event_id)
);

CREATE TABLE initial_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    version INT NOT NULL,
    submitted_by_email CITEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    snapshot JSONB NOT NULL,
    ip_address TEXT
);

CREATE TABLE detailed_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    sport_event_id UUID REFERENCES sport_events(id) ON DELETE CASCADE,
    reference_no TEXT UNIQUE,
    status form_status DEFAULT 'draft',
    pe_director_name TEXT,
    director_name TEXT,
    form_date DATE,
    certified BOOLEAN DEFAULT false,
    seal_path TEXT,
    pe_signature_path TEXT,
    director_signature_path TEXT,
    scanned_copy_path TEXT,
    version INT DEFAULT 1,
    submitted_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    UNIQUE(college_id, sport_event_id)
);

CREATE TABLE detailed_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    detailed_form_id UUID REFERENCES detailed_forms(id) ON DELETE CASCADE,
    serial_no INT NOT NULL,
    full_name TEXT NOT NULL,
    father_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    qualifying_exam_name TEXT NOT NULL,
    qualifying_exam_date_year TEXT NOT NULL,
    hall_ticket_or_fees_receipt_no TEXT NOT NULL,
    present_class TEXT NOT NULL,
    present_course TEXT NOT NULL,
    course_duration TEXT NOT NULL,
    first_admission_law_university DATE NOT NULL,
    first_admission_present_course DATE NOT NULL,
    remarks TEXT
);

CREATE TABLE detailed_submission_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    detailed_form_id UUID REFERENCES detailed_forms(id) ON DELETE CASCADE,
    version INT NOT NULL,
    snapshot JSONB NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_by CITEXT
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type notif_type DEFAULT 'manual',
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    audience notif_audience DEFAULT 'public',
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    pinned BOOLEAN DEFAULT false,
    publish_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notification_reads (
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    college_email_id UUID REFERENCES college_emails(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (notification_id, college_email_id)
);

CREATE TABLE email_outbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    to_addresses TEXT[] NOT NULL,
    cc TEXT[],
    subject TEXT NOT NULL,
    html TEXT NOT NULL,
    text TEXT,
    attachments JSONB,
    status outbox_status DEFAULT 'queued',
    attempts INT DEFAULT 0,
    last_error TEXT,
    related_college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
    kind TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

CREATE TABLE reminder_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phase portal_phase NOT NULL,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    kind TEXT NOT NULL
);

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_type actor_type NOT NULL,
    actor_id UUID,
    college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    before JSONB,
    after JSONB,
    reason TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

CREATE TABLE import_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    import_batch_id UUID NOT NULL,
    row_number INT,
    raw_row JSONB,
    issue_type TEXT,
    message TEXT,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper function for portal windows
CREATE OR REPLACE FUNCTION is_phase_open(p_phase portal_phase, p_college_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    v_window RECORD;
    v_extension RECORD;
BEGIN
    -- Check for college-specific extension first
    IF p_college_id IS NOT NULL THEN
        SELECT * INTO v_extension FROM college_window_extensions 
        WHERE phase = p_phase AND college_id = p_college_id AND extended_until > NOW()
        ORDER BY extended_until DESC LIMIT 1;
        
        IF FOUND THEN
            RETURN TRUE;
        END IF;
    END IF;

    -- Check global window
    SELECT * INTO v_window FROM portal_windows WHERE phase = p_phase;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    IF v_window.manual_override = 'force_open' THEN
        RETURN TRUE;
    ELSIF v_window.manual_override = 'force_close' THEN
        RETURN FALSE;
    END IF;

    -- Auto mode
    IF NOW() >= v_window.opens_at AND NOW() <= v_window.closes_at THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
