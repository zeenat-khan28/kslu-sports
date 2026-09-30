ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sport_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_window_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE initial_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE initial_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE detailed_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE detailed_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE detailed_submission_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_issues ENABLE ROW LEVEL SECURITY;

-- Security Definer helper to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE auth_user_id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security Definer helper to check college ownership
CREATE OR REPLACE FUNCTION belongs_to_college(c_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM college_emails 
    WHERE auth_user_id = auth.uid() AND college_id = c_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies (Admins can do everything)
-- To keep it simple, we grant ALL to admins on all tables.
CREATE POLICY admin_all_colleges ON colleges FOR ALL USING (is_admin());
CREATE POLICY admin_all_college_emails ON college_emails FOR ALL USING (is_admin());
CREATE POLICY admin_all_admins ON admins FOR ALL USING (is_admin());
CREATE POLICY admin_all_sports ON sports FOR ALL USING (is_admin());
CREATE POLICY admin_all_sport_events ON sport_events FOR ALL USING (is_admin());
CREATE POLICY admin_all_event_venues ON event_venues FOR ALL USING (is_admin());
CREATE POLICY admin_all_portal_windows ON portal_windows FOR ALL USING (is_admin());
CREATE POLICY admin_all_college_window_extensions ON college_window_extensions FOR ALL USING (is_admin());
CREATE POLICY admin_all_initial_responses ON initial_responses FOR ALL USING (is_admin());
CREATE POLICY admin_all_initial_submissions ON initial_submissions FOR ALL USING (is_admin());
CREATE POLICY admin_all_detailed_forms ON detailed_forms FOR ALL USING (is_admin());
CREATE POLICY admin_all_detailed_players ON detailed_players FOR ALL USING (is_admin());
CREATE POLICY admin_all_detailed_submission_history ON detailed_submission_history FOR ALL USING (is_admin());
CREATE POLICY admin_all_notifications ON notifications FOR ALL USING (is_admin());
CREATE POLICY admin_all_notification_reads ON notification_reads FOR ALL USING (is_admin());
CREATE POLICY admin_all_email_outbox ON email_outbox FOR ALL USING (is_admin());
CREATE POLICY admin_all_reminder_log ON reminder_log FOR ALL USING (is_admin());
CREATE POLICY admin_all_audit_log ON audit_log FOR SELECT USING (is_admin());
CREATE POLICY admin_all_app_settings ON app_settings FOR ALL USING (is_admin());
CREATE POLICY admin_all_import_issues ON import_issues FOR ALL USING (is_admin());

-- Public (Anon) Policies
CREATE POLICY public_read_sports ON sports FOR SELECT USING (is_active = true);
CREATE POLICY public_read_sport_events ON sport_events FOR SELECT USING (is_active = true);
CREATE POLICY public_read_event_venues ON event_venues FOR SELECT USING (true);
CREATE POLICY public_read_portal_windows ON portal_windows FOR SELECT USING (true);
CREATE POLICY public_read_notifications ON notifications FOR SELECT USING (audience = 'public' AND (expires_at IS NULL OR expires_at > NOW()));

-- College Policies
CREATE POLICY college_read_own ON colleges FOR SELECT USING (belongs_to_college(id));
CREATE POLICY college_read_emails ON college_emails FOR SELECT USING (belongs_to_college(college_id));
CREATE POLICY college_read_windows ON college_window_extensions FOR SELECT USING (belongs_to_college(college_id));
CREATE POLICY college_all_initial_responses ON initial_responses FOR ALL USING (belongs_to_college(college_id));
CREATE POLICY college_all_initial_submissions ON initial_submissions FOR ALL USING (belongs_to_college(college_id));
CREATE POLICY college_all_detailed_forms ON detailed_forms FOR ALL USING (belongs_to_college(college_id));
CREATE POLICY college_all_detailed_players ON detailed_players FOR ALL USING (
    EXISTS (SELECT 1 FROM detailed_forms WHERE id = detailed_form_id AND belongs_to_college(college_id))
);
CREATE POLICY college_all_detailed_history ON detailed_submission_history FOR ALL USING (
    EXISTS (SELECT 1 FROM detailed_forms WHERE id = detailed_form_id AND belongs_to_college(college_id))
);
CREATE POLICY college_read_notifications ON notifications FOR SELECT USING (
    audience = 'all_colleges' OR (audience = 'one_college' AND belongs_to_college(college_id))
);
CREATE POLICY college_all_notif_reads ON notification_reads FOR ALL USING (
    EXISTS (SELECT 1 FROM college_emails WHERE id = college_email_id AND auth_user_id = auth.uid())
);

-- Note: No one can UPDATE or DELETE audit_log, not even admins. Service role handles INSERTS.
