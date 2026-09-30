-- Seed Portal Settings
INSERT INTO app_settings (key, value) VALUES 
('academic_year', '"2025-26"'),
('manager_name', '"Dr. Khalid Khan"'),
('default_max_players', '12'),
('auto_reminders_enabled', 'true'),
('cc_college_on_receipts', 'true'),
('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

-- Seed Sports
DO $$ 
DECLARE
    v_chess UUID;
    v_badminton UUID;
    v_cc UUID;
    v_kabaddi UUID;
    v_volleyball UUID;
    v_tt UUID;
    v_basketball UUID;
    v_cricket UUID;
    v_football UUID;
    v_yoga UUID;
    v_throwball UUID;
    
    v_ath_hub UUID;
    v_ath_man UUID;
    v_ath_bn UUID;
    v_ath_bs UUID;
    v_ath_kal UUID;
    v_ath_mys UUID;
    v_ath_inter UUID;
BEGIN
    INSERT INTO sports (name, display_order, group_name, is_team_sport) VALUES 
    ('Chess', 1, NULL, true) RETURNING id INTO v_chess;
    
    INSERT INTO sports (name, display_order, group_name, is_team_sport) VALUES 
    ('Badminton', 2, NULL, true) RETURNING id INTO v_badminton;
    
    INSERT INTO sports (name, display_order, group_name, is_team_sport) VALUES 
    ('Cross Country', 3, NULL, true) RETURNING id INTO v_cc;
    
    INSERT INTO sports (name, display_order, group_name, is_team_sport) VALUES 
    ('Kabaddi', 4, NULL, true) RETURNING id INTO v_kabaddi;
    
    INSERT INTO sports (name, display_order, group_name, is_team_sport) VALUES 
    ('Volleyball', 5, NULL, true) RETURNING id INTO v_volleyball;
    
    INSERT INTO sports (name, display_order, group_name, is_team_sport) VALUES 
    ('Table Tennis', 6, NULL, true) RETURNING id INTO v_tt;
    
    INSERT INTO sports (name, display_order, group_name, is_team_sport) VALUES 
    ('Basketball', 7, NULL, true) RETURNING id INTO v_basketball;
    
    INSERT INTO sports (name, display_order, group_name, is_team_sport) VALUES 
    ('Cricket', 8, NULL, true) RETURNING id INTO v_cricket;
    
    INSERT INTO sports (name, display_order, group_name, is_team_sport) VALUES 
    ('Football', 9, NULL, true) RETURNING id INTO v_football;
    
    INSERT INTO sports (name, display_order, group_name, is_team_sport) VALUES 
    ('Yoga', 10, NULL, true) RETURNING id INTO v_yoga;
    
    INSERT INTO sports (name, display_order, group_name, is_team_sport) VALUES 
    ('Throwball & Tennikoit', 11, NULL, true) RETURNING id INTO v_throwball;

    -- Athletics Group
    INSERT INTO sports (name, display_order, group_name, is_team_sport) VALUES 
    ('Athletics Selection Trials - Hubballi Zone', 12, 'Athletics', false) RETURNING id INTO v_ath_hub;
    
    INSERT INTO sports (name, display_order, group_name, is_team_sport) VALUES 
    ('Athletics Selection Trials - Mangalore Zone', 13, 'Athletics', false) RETURNING id INTO v_ath_man;
    
    INSERT INTO sports (name, display_order, group_name, is_team_sport) VALUES 
    ('Athletics Selection Trials - Bangalore North Zone', 14, 'Athletics', false) RETURNING id INTO v_ath_bn;
    
    INSERT INTO sports (name, display_order, group_name, is_team_sport) VALUES 
    ('Athletics Selection Trials - Bangalore South Zone', 15, 'Athletics', false) RETURNING id INTO v_ath_bs;
    
    INSERT INTO sports (name, display_order, group_name, is_team_sport) VALUES 
    ('Athletics Selection Trials - Kalburgi Zone', 16, 'Athletics', false) RETURNING id INTO v_ath_kal;
    
    INSERT INTO sports (name, display_order, group_name, is_team_sport) VALUES 
    ('Athletics Selection Trials - Mysore Zone', 17, 'Athletics', false) RETURNING id INTO v_ath_mys;
    
    INSERT INTO sports (name, display_order, group_name, is_team_sport) VALUES 
    ('Inter Zonal Athletics', 18, 'Athletics', false) RETURNING id INTO v_ath_inter;


    -- Insert Events
    INSERT INTO sport_events (sport_id, gender, code, display_name) VALUES 
    (v_chess, 'Men', 'CHESS-M', 'Chess - Men'), (v_chess, 'Women', 'CHESS-W', 'Chess - Women'),
    (v_badminton, 'Men', 'BADMINTON-M', 'Badminton - Men'), (v_badminton, 'Women', 'BADMINTON-W', 'Badminton - Women'),
    (v_cc, 'Men', 'CC-M', 'Cross Country - Men'), (v_cc, 'Women', 'CC-W', 'Cross Country - Women'),
    (v_kabaddi, 'Men', 'KABADDI-M', 'Kabaddi - Men'), (v_kabaddi, 'Women', 'KABADDI-W', 'Kabaddi - Women'),
    (v_volleyball, 'Men', 'VOLLEYBALL-M', 'Volleyball - Men'), (v_volleyball, 'Women', 'VOLLEYBALL-W', 'Volleyball - Women'),
    (v_tt, 'Men', 'TT-M', 'Table Tennis - Men'), (v_tt, 'Women', 'TT-W', 'Table Tennis - Women'),
    (v_basketball, 'Men', 'BASKETBALL-M', 'Basketball - Men'), (v_basketball, 'Women', 'BASKETBALL-W', 'Basketball - Women'),
    (v_cricket, 'Men', 'CRICKET-M', 'Cricket - Men'),
    (v_football, 'Men', 'FOOTBALL-M', 'Football - Men'),
    (v_yoga, 'Men', 'YOGA-M', 'Yoga - Men'), (v_yoga, 'Women', 'YOGA-W', 'Yoga - Women'),
    (v_throwball, 'Women', 'THROWBALL-W', 'Throwball & Tennikoit - Women'),
    
    (v_ath_hub, 'Men', 'ATH-HUB-M', 'Athletics (Hubballi) - Men'), (v_ath_hub, 'Women', 'ATH-HUB-W', 'Athletics (Hubballi) - Women'),
    (v_ath_man, 'Men', 'ATH-MAN-M', 'Athletics (Mangalore) - Men'), (v_ath_man, 'Women', 'ATH-MAN-W', 'Athletics (Mangalore) - Women'),
    (v_ath_bn, 'Men', 'ATH-BN-M', 'Athletics (Bangalore North) - Men'), (v_ath_bn, 'Women', 'ATH-BN-W', 'Athletics (Bangalore North) - Women'),
    (v_ath_bs, 'Men', 'ATH-BS-M', 'Athletics (Bangalore South) - Men'), (v_ath_bs, 'Women', 'ATH-BS-W', 'Athletics (Bangalore South) - Women'),
    (v_ath_kal, 'Men', 'ATH-KAL-M', 'Athletics (Kalburgi) - Men'), (v_ath_kal, 'Women', 'ATH-KAL-W', 'Athletics (Kalburgi) - Women'),
    (v_ath_mys, 'Men', 'ATH-MYS-M', 'Athletics (Mysore) - Men'), (v_ath_mys, 'Women', 'ATH-MYS-W', 'Athletics (Mysore) - Women'),
    (v_ath_inter, 'Men', 'ATH-INT-M', 'Inter Zonal Athletics - Men'), (v_ath_inter, 'Women', 'ATH-INT-W', 'Inter Zonal Athletics - Women');
END $$;
