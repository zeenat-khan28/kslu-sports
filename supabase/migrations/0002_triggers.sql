-- Trigger to enforce phase rules for initial_responses
CREATE OR REPLACE FUNCTION enforce_initial_phase()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip check if admin is making the change
    IF is_admin() THEN
        RETURN NEW;
    END IF;

    -- For colleges, phase must be open
    IF NOT is_phase_open('initial', NEW.college_id) THEN
        RAISE EXCEPTION 'Initial confirmation phase is closed.';
    END IF;

    -- Prevent changing YES to NO if detailed form exists
    IF TG_OP = 'UPDATE' AND OLD.participating = true AND NEW.participating = false THEN
        IF EXISTS (SELECT 1 FROM detailed_forms WHERE college_id = NEW.college_id AND sport_event_id = NEW.sport_event_id) THEN
            RAISE EXCEPTION 'Cannot remove participation because a detailed form already exists. Contact admin.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_enforce_initial_phase
BEFORE INSERT OR UPDATE ON initial_responses
FOR EACH ROW EXECUTE PROCEDURE enforce_initial_phase();

-- Trigger to enforce rules for detailed_forms
CREATE OR REPLACE FUNCTION enforce_detailed_phase()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip check if admin
    IF is_admin() THEN
        RETURN NEW;
    END IF;

    -- For colleges, phase must be open
    IF NOT is_phase_open('detailed', NEW.college_id) THEN
        RAISE EXCEPTION 'Detailed confirmation phase is closed.';
    END IF;

    -- Must have participating = true in initial responses
    IF NOT EXISTS (
        SELECT 1 FROM initial_responses 
        WHERE college_id = NEW.college_id 
        AND sport_event_id = NEW.sport_event_id 
        AND participating = true
    ) THEN
        RAISE EXCEPTION 'Cannot create detailed form: You did not select YES for this sport in the initial confirmation.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_enforce_detailed_phase
BEFORE INSERT OR UPDATE ON detailed_forms
FOR EACH ROW EXECUTE PROCEDURE enforce_detailed_phase();
