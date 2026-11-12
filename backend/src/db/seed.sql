-- Fictional demo data only. Demo password for every account: Demo@12345
-- Safe to re-run: clears existing rows first.
BEGIN;
TRUNCATE ai_analyses, contact_enquiries, citizen_feedback, attachments, department_assignments, grievance_history, grievances, users, departments CASCADE;

INSERT INTO departments (id, code, name, description) VALUES
  ('00000000-0000-4000-8000-000000000101','PWD','Public Works (PWD)','Roads, bridges and public buildings.'),
  ('00000000-0000-4000-8000-000000000102','HLT','Health & Family Welfare','Hospitals, public health programmes and medical services.'),
  ('00000000-0000-4000-8000-000000000103','EDU','General Education','Schools, teachers and student welfare.'),
  ('00000000-0000-4000-8000-000000000104','WRD','Water Resources','Drinking water supply, irrigation and sanitation.'),
  ('00000000-0000-4000-8000-000000000105','TRN','Transport','Public transport, licensing and road safety.'),
  ('00000000-0000-4000-8000-000000000106','AGR','Agriculture','Farmer support, inputs and crop programmes.'),
  ('00000000-0000-4000-8000-000000000107','HOM','Home (Police)','Law and order, public safety and citizen security.'),
  ('00000000-0000-4000-8000-000000000108','REV','Revenue','Certificates, land records, pensions and public services.');

INSERT INTO users (id, name, email, mobile, password_hash, role, department_id) VALUES
  ('00000000-0000-4000-8000-000000000201','Demo CMO Administrator','cmo@demo.test','9876543210','$2a$10$LTDJnoJ/rQHbYDRk6X.JMurl9DdNWk8jjdss0XkBWQeo2c/sbppDW','CMO_ADMIN',NULL),
  ('00000000-0000-4000-8000-000000000202','Demo Citizen','citizen@demo.test','9876543210','$2a$10$LTDJnoJ/rQHbYDRk6X.JMurl9DdNWk8jjdss0XkBWQeo2c/sbppDW','CITIZEN',NULL),
  ('00000000-0000-4000-8000-000000000203','Asha Demo','asha@demo.test','9876543210','$2a$10$LTDJnoJ/rQHbYDRk6X.JMurl9DdNWk8jjdss0XkBWQeo2c/sbppDW','CITIZEN',NULL),
  ('00000000-0000-4000-8000-000000000210','PWD Demo Officer','officer.pwd@demo.test','9876543210','$2a$10$LTDJnoJ/rQHbYDRk6X.JMurl9DdNWk8jjdss0XkBWQeo2c/sbppDW','OFFICER','00000000-0000-4000-8000-000000000101'),
  ('00000000-0000-4000-8000-000000000211','HLT Demo Officer','officer.hlt@demo.test','9876543210','$2a$10$LTDJnoJ/rQHbYDRk6X.JMurl9DdNWk8jjdss0XkBWQeo2c/sbppDW','OFFICER','00000000-0000-4000-8000-000000000102'),
  ('00000000-0000-4000-8000-000000000212','EDU Demo Officer','officer.edu@demo.test','9876543210','$2a$10$LTDJnoJ/rQHbYDRk6X.JMurl9DdNWk8jjdss0XkBWQeo2c/sbppDW','OFFICER','00000000-0000-4000-8000-000000000103'),
  ('00000000-0000-4000-8000-000000000213','WRD Demo Officer','officer.wrd@demo.test','9876543210','$2a$10$LTDJnoJ/rQHbYDRk6X.JMurl9DdNWk8jjdss0XkBWQeo2c/sbppDW','OFFICER','00000000-0000-4000-8000-000000000104'),
  ('00000000-0000-4000-8000-000000000214','TRN Demo Officer','officer.trn@demo.test','9876543210','$2a$10$LTDJnoJ/rQHbYDRk6X.JMurl9DdNWk8jjdss0XkBWQeo2c/sbppDW','OFFICER','00000000-0000-4000-8000-000000000105'),
  ('00000000-0000-4000-8000-000000000215','AGR Demo Officer','officer.agr@demo.test','9876543210','$2a$10$LTDJnoJ/rQHbYDRk6X.JMurl9DdNWk8jjdss0XkBWQeo2c/sbppDW','OFFICER','00000000-0000-4000-8000-000000000106'),
  ('00000000-0000-4000-8000-000000000216','HOM Demo Officer','officer.hom@demo.test','9876543210','$2a$10$LTDJnoJ/rQHbYDRk6X.JMurl9DdNWk8jjdss0XkBWQeo2c/sbppDW','OFFICER','00000000-0000-4000-8000-000000000107'),
  ('00000000-0000-4000-8000-000000000217','REV Demo Officer','officer.rev@demo.test','9876543210','$2a$10$LTDJnoJ/rQHbYDRk6X.JMurl9DdNWk8jjdss0XkBWQeo2c/sbppDW','OFFICER','00000000-0000-4000-8000-000000000108');

INSERT INTO grievances (id, reference_id, citizen_id, district, category, subject, description, priority, status, due_date, ai_summary, ai_suggested_category, ai_suggested_priority, ai_is_fallback, created_at) VALUES
  ('00000000-0000-4000-8000-000000000301','CMK-2026-001000','00000000-0000-4000-8000-000000000202','Kannur','Public Infrastructure','Large potholes on town road','Several deep potholes on the main road near the bus stand have caused two minor accidents this week. Please repair the road urgently.','HIGH','IN_PROGRESS',now() - interval '9 days' + interval '7 days','Large potholes on town road','Public Infrastructure','HIGH',TRUE,now() - interval '9 days'),
  ('00000000-0000-4000-8000-000000000302','CMK-2026-001001','00000000-0000-4000-8000-000000000203','Ernakulam','Healthcare','Medicine shortage at taluk hospital','The taluk hospital pharmacy has been out of basic diabetes medicines for two weeks and patients are forced to buy them outside.','MEDIUM','UNDER_REVIEW',now() - interval '5 days' + interval '15 days','Medicine shortage at taluk hospital','Healthcare','MEDIUM',TRUE,now() - interval '5 days'),
  ('00000000-0000-4000-8000-000000000303','CMK-2026-001002','00000000-0000-4000-8000-000000000202','Kozhikode','Water & Sanitation','No drinking water supply for 6 days','There has been no drinking water supply in our ward for six days and families depend on tankers. This is an emergency for elderly residents.','HIGH','RESOLVED',now() - interval '20 days' + interval '7 days','No drinking water supply for 6 days','Water & Sanitation','HIGH',TRUE,now() - interval '20 days'),
  ('00000000-0000-4000-8000-000000000304','CMK-2026-001003','00000000-0000-4000-8000-000000000203','Thrissur','Education','Shortage of teachers in government school','The government higher secondary school has no mathematics teacher this academic year and students are worried about exams.','MEDIUM','SUBMITTED',now() - interval '2 days' + interval '15 days','Shortage of teachers in government school','Education','MEDIUM',TRUE,now() - interval '2 days'),
  ('00000000-0000-4000-8000-000000000305','CMK-2026-001004','00000000-0000-4000-8000-000000000202','Kasaragod','Transport','Bus service discontinued on rural route','The only bus on our rural route was discontinued last month, leaving school students without transport.','MEDIUM','SUBMITTED',now() - interval '3 days' + interval '15 days','Bus service discontinued on rural route','Transport','MEDIUM',TRUE,now() - interval '3 days'),
  ('00000000-0000-4000-8000-000000000306','CMK-2026-001005','00000000-0000-4000-8000-000000000203','Alappuzha','Agriculture','Delay in paddy procurement payment','Farmers in our padasekharam have not received payment for paddy supplied three months ago.','MEDIUM','IN_PROGRESS',now() - interval '40 days' + interval '15 days','Delay in paddy procurement payment','Agriculture','MEDIUM',TRUE,now() - interval '40 days'),
  ('00000000-0000-4000-8000-000000000307','CMK-2026-001006','00000000-0000-4000-8000-000000000202','Malappuram','Public Services','Income certificate pending for 45 days','My application for an income certificate has been pending at the village office for 45 days without any update.','LOW','REOPENED',now() - interval '50 days' + interval '30 days','Income certificate pending for 45 days','Public Services','LOW',TRUE,now() - interval '50 days'),
  ('00000000-0000-4000-8000-000000000308','CMK-2026-001007','00000000-0000-4000-8000-000000000203','Thiruvananthapuram','Police & Safety','Street lights not working near market','Street lights near the market have been off for weeks and women feel unsafe at night. Please restore them.','MEDIUM','UNDER_REVIEW',now() - interval '12 days' + interval '15 days','Street lights not working near market','Police & Safety','MEDIUM',TRUE,now() - interval '12 days'),
  ('00000000-0000-4000-8000-000000000309','CMK-2026-001008','00000000-0000-4000-8000-000000000202','Kollam','Public Infrastructure','Damaged culvert causing waterlogging','A damaged culvert near the junction is causing waterlogging during every rain and houses nearby are affected.','MEDIUM','SUBMITTED',now() - interval '1 days' + interval '15 days','Damaged culvert causing waterlogging','Public Infrastructure','MEDIUM',TRUE,now() - interval '1 days'),
  ('00000000-0000-4000-8000-000000000310','CMK-2026-001009','00000000-0000-4000-8000-000000000203','Wayanad','Healthcare','No ambulance at primary health centre','The primary health centre has had no working ambulance for a month; emergency patients must be taken by private vehicles.','HIGH','IN_PROGRESS',now() - interval '8 days' + interval '7 days','No ambulance at primary health centre','Healthcare','HIGH',TRUE,now() - interval '8 days');

INSERT INTO grievance_history (grievance_id, from_status, to_status, remarks, changed_by, changed_at) VALUES
  ('00000000-0000-4000-8000-000000000301',NULL,'SUBMITTED','Grievance submitted by citizen','00000000-0000-4000-8000-000000000202',now() - interval '216 hours'),
  ('00000000-0000-4000-8000-000000000301','SUBMITTED','UNDER_REVIEW','CMO review started','00000000-0000-4000-8000-000000000201',now() - interval '204 hours'),
  ('00000000-0000-4000-8000-000000000301','UNDER_REVIEW','IN_PROGRESS','Forwarded to PWD','00000000-0000-4000-8000-000000000201',now() - interval '180 hours'),
  ('00000000-0000-4000-8000-000000000302',NULL,'SUBMITTED','Grievance submitted by citizen','00000000-0000-4000-8000-000000000203',now() - interval '120 hours'),
  ('00000000-0000-4000-8000-000000000302','SUBMITTED','UNDER_REVIEW','CMO review started','00000000-0000-4000-8000-000000000201',now() - interval '108 hours'),
  ('00000000-0000-4000-8000-000000000303',NULL,'SUBMITTED','Grievance submitted by citizen','00000000-0000-4000-8000-000000000202',now() - interval '480 hours'),
  ('00000000-0000-4000-8000-000000000303','SUBMITTED','UNDER_REVIEW','CMO review started','00000000-0000-4000-8000-000000000201',now() - interval '468 hours'),
  ('00000000-0000-4000-8000-000000000303','UNDER_REVIEW','IN_PROGRESS','Forwarded to WRD','00000000-0000-4000-8000-000000000201',now() - interval '444 hours'),
  ('00000000-0000-4000-8000-000000000303','IN_PROGRESS','RESOLVED','Report approved; grievance resolved','00000000-0000-4000-8000-000000000201',now() - interval '420 hours'),
  ('00000000-0000-4000-8000-000000000304',NULL,'SUBMITTED','Grievance submitted by citizen','00000000-0000-4000-8000-000000000203',now() - interval '48 hours'),
  ('00000000-0000-4000-8000-000000000305',NULL,'SUBMITTED','Grievance submitted by citizen','00000000-0000-4000-8000-000000000202',now() - interval '72 hours'),
  ('00000000-0000-4000-8000-000000000306',NULL,'SUBMITTED','Grievance submitted by citizen','00000000-0000-4000-8000-000000000203',now() - interval '960 hours'),
  ('00000000-0000-4000-8000-000000000306','SUBMITTED','UNDER_REVIEW','CMO review started','00000000-0000-4000-8000-000000000201',now() - interval '948 hours'),
  ('00000000-0000-4000-8000-000000000306','UNDER_REVIEW','IN_PROGRESS','Forwarded to AGR','00000000-0000-4000-8000-000000000201',now() - interval '924 hours'),
  ('00000000-0000-4000-8000-000000000307',NULL,'SUBMITTED','Grievance submitted by citizen','00000000-0000-4000-8000-000000000202',now() - interval '1200 hours'),
  ('00000000-0000-4000-8000-000000000307','SUBMITTED','UNDER_REVIEW','CMO review started','00000000-0000-4000-8000-000000000201',now() - interval '1188 hours'),
  ('00000000-0000-4000-8000-000000000307','UNDER_REVIEW','IN_PROGRESS','Forwarded to REV','00000000-0000-4000-8000-000000000201',now() - interval '1164 hours'),
  ('00000000-0000-4000-8000-000000000307','IN_PROGRESS','RESOLVED','Report approved; grievance resolved','00000000-0000-4000-8000-000000000201',now() - interval '1140 hours'),
  ('00000000-0000-4000-8000-000000000307','RESOLVED','REOPENED','Reopened by citizen: issue not actually fixed','00000000-0000-4000-8000-000000000202',now() - interval '1116 hours'),
  ('00000000-0000-4000-8000-000000000308',NULL,'SUBMITTED','Grievance submitted by citizen','00000000-0000-4000-8000-000000000203',now() - interval '288 hours'),
  ('00000000-0000-4000-8000-000000000308','SUBMITTED','UNDER_REVIEW','CMO review started','00000000-0000-4000-8000-000000000201',now() - interval '276 hours'),
  ('00000000-0000-4000-8000-000000000309',NULL,'SUBMITTED','Grievance submitted by citizen','00000000-0000-4000-8000-000000000202',now() - interval '24 hours'),
  ('00000000-0000-4000-8000-000000000310',NULL,'SUBMITTED','Grievance submitted by citizen','00000000-0000-4000-8000-000000000203',now() - interval '192 hours'),
  ('00000000-0000-4000-8000-000000000310','SUBMITTED','UNDER_REVIEW','CMO review started','00000000-0000-4000-8000-000000000201',now() - interval '180 hours'),
  ('00000000-0000-4000-8000-000000000310','UNDER_REVIEW','IN_PROGRESS','Forwarded to HLT','00000000-0000-4000-8000-000000000201',now() - interval '156 hours');

INSERT INTO department_assignments (grievance_id, department_id, officer_id, assigned_by, action_taken_report, submitted_at, is_active) VALUES
  ('00000000-0000-4000-8000-000000000301','00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000210','00000000-0000-4000-8000-000000000201',NULL,NULL,TRUE),
  ('00000000-0000-4000-8000-000000000303','00000000-0000-4000-8000-000000000104','00000000-0000-4000-8000-000000000213','00000000-0000-4000-8000-000000000201','Work completed and verified on site.',now() - interval '18 days',TRUE),
  ('00000000-0000-4000-8000-000000000306','00000000-0000-4000-8000-000000000106','00000000-0000-4000-8000-000000000215','00000000-0000-4000-8000-000000000201',NULL,NULL,TRUE),
  ('00000000-0000-4000-8000-000000000307','00000000-0000-4000-8000-000000000108','00000000-0000-4000-8000-000000000217','00000000-0000-4000-8000-000000000201',NULL,NULL,FALSE),
  ('00000000-0000-4000-8000-000000000310','00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000211','00000000-0000-4000-8000-000000000201',NULL,NULL,TRUE);

INSERT INTO contact_enquiries (name, email, subject, message) VALUES ('Demo Visitor','visitor@demo.test','Question about tracking','How long does CMO review usually take?');

COMMIT;
