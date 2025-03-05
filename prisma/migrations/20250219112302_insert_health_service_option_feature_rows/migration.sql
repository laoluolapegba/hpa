INSERT INTO "HealthServiceOptionFeature" ("id", "description", "serviceOptionId") VALUES 
('j9zujwbppmxk05bb0lcxvl4q', 'Equipment available in Electrotherapy room', (SELECT id from "HealthServiceOption" WHERE "name" = 'Physiotherapy Clinic')),
('gedgoxvmyhwnpgr8o4ms1xbj', 'Equipment available in the Gymnasium', (SELECT id from "HealthServiceOption" WHERE "name" = 'Physiotherapy Clinic')),
('a8r1npy4fbcowxp81oix30ks', 'Equipment available', (SELECT id from "HealthServiceOption" WHERE "name" = 'Dental Clinic')),
('fumaz80xijaa53clcxhtk1lu', 'Discipline covered', (SELECT id from "HealthServiceOption" WHERE "name" = 'Radio Diagnostic Center')),
('tin13ipab7jxif67mk8ttbix', 'Equipment in Optical Workshop', (SELECT id from "HealthServiceOption" WHERE "name" = 'Optical Center')),
('hxvnzwwsei79nbhsjm82idsh', 'Equipment in Retraction room', (SELECT id from "HealthServiceOption" WHERE "name" = 'Optical Center')),
('s7ilw5g4olrog0u5h1u6v19j', 'Discipline Covered', (SELECT id from "HealthServiceOption" WHERE "name" = 'Medical Laboratory')),
('udusho0betu9lukpr38k6b99', 'Equipment available', (SELECT id from "HealthServiceOption" WHERE "name" = 'Medical Laboratory')),
('fmyfb11bmo874b699v21n8ny', 'Equipment available', (SELECT id from "HealthServiceOption" WHERE "name" = 'Radiotherapy Center Clinic')),
('kyib7vr4w03n48k3fktlx4s7', 'Protective measures', (SELECT id from "HealthServiceOption" WHERE "name" = 'Radiotherapy Center Clinic'));
