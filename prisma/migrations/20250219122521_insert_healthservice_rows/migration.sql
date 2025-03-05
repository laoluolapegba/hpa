INSERT INTO "HealthService" ("id", "name", "serviceOptionId") VALUES 
('ewq4rn3x1fyy9yfuevlyjftu', 'Ambulance Emergency Care', NULL),
('lgua1cv1nh03xp29byl8kerr', 'Ambulance Patient Transport', NULL),
('fb152rzo7s2biykx1lkhno8p', 'ANC - Antenatal Care', NULL),
('p1fhfn5e8qsmfdpyneqpzdjk', 'ART - Assisted Reproductive Technology', NULL),
('s3atv9d3bjrdf9ctia6zrvoa', 'Blood Banking', NULL),
('ebm8p1q2ipextmy7yagnwcm6', 'Chemistry', (SELECT id from "HealthServiceOption" WHERE "name" = 'Medical Laboratory')),
('sywj2va1p94b1trc9khghie8', 'Convalescent Care', NULL),
('j3avnrp4n3ik6ey8zlvhyqpj', 'CT Scan - Computerized Tomography Scan', (SELECT id from "HealthServiceOption" WHERE "name" = 'Radio Diagnostic Center')),
('i8kzo6vp3zxx4ln02o79c17p', 'Cytogenetics', NULL),
('oxnjqdvrovis0dputul5oc40', 'Delivery', NULL),
('kfyq5xir8h1dq677bkt2spex', 'Dental', (SELECT id from "HealthServiceOption" WHERE "name" = 'Dental Clinic')),
('pkmwxmxx0pvwo63m6mwxexqv', 'Dental Surgery', (SELECT id from "HealthServiceOption" WHERE "name" = 'Dental Clinic')),
('t7nk1wzb0gyklrardu42370g', 'Dermatology', NULL),
('igluak6i9q7km7geex5df4ks', 'Dialysis', NULL),
('qp8rgua2kjy6liobu5m4t97a', 'ECG - Electrocardiogram', (SELECT id from "HealthServiceOption" WHERE "name" = 'Radio Diagnostic Center')),
('p6gdfm81hoer2vnpa10y1j38', 'Echocardiography', (SELECT id from "HealthServiceOption" WHERE "name" = 'Radio Diagnostic Center')),
('i1fw81g7wc0kmfjfiwjm4kzj', 'EEG - Electroencephalogram', (SELECT id from "HealthServiceOption" WHERE "name" = 'Radio Diagnostic Center')),
('biqy92hv75479m9xj2cwlhfu', 'Endoscopy', (SELECT id from "HealthServiceOption" WHERE "name" = 'Radio Diagnostic Center')),
('e4xgkluiubnn5yn8qfo5qv6n', 'Eye Surgery', (SELECT id from "HealthServiceOption" WHERE "name" = 'Optical Center')),
('w605960yurznyl6ivpbgw9w1', 'Family Planning', NULL),
('mlgvycbf5jymyu89ucwag1bk', 'General Nursing Care', NULL),
('yk769ys1xqolkcbd1ymk9fbx', 'General Surgery', NULL),
('vkc1jcz1k4nv5nvt4weld3er', 'Haematology', (SELECT id from "HealthServiceOption" WHERE "name" = 'Medical Laboratory')),
('jor06sdc8a0eygxl4jx1hora', 'Histopathology', (SELECT id from "HealthServiceOption" WHERE "name" = 'Medical Laboratory')),
('o33ogtmyhtqd5mvwel4gjn6v', 'Home based care', NULL),
('wmyp2zbvokz0q6b6yedc6wrm', 'Immunization', NULL),
('sz4hnewb30ncme1eietn98ot', 'Internal Medicine', NULL),
('eewsio58ramoy4wejxu8mfm9', 'Karyotyping', NULL),
('gcopega44646kqpn9s3ziub5', 'Mammography', (SELECT id from "HealthServiceOption" WHERE "name" = 'Radio Diagnostic Center')),
('l6s4srifpgag7l1jqqrhrfp5', 'Medical Aesthetics', NULL),
('eybrdwk6nqhdl1al25sgk0dj', 'Medical SPA', NULL),
('bh3gjhie2afvzdqu93xg14g5', 'Microbiology / Parasitology', (SELECT id from "HealthServiceOption" WHERE "name" = 'Medical Laboratory')),
('p2ma9dfr0dcx6u5wp4f2qfyu', 'Morgue / Mortuary Services', NULL),
('c7mg5gbn4ap02n39wkp64qcw', 'MRI - Magnetic Resonance Imaging', (SELECT id from "HealthServiceOption" WHERE "name" = 'Radio Diagnostic Center')),
('m45q2g603o2e5u4ozp3fibrg', 'Neurosurgery', NULL),
('jaorjq75l6k824mtdfcyx47u', 'Obstetrics &amp; Gynaecology', NULL),
('jfffjms7zis8uwwp5somi1l8', 'Oncogenetics', NULL),
('f29v6ltuy9lfwgnnzpuimygx', 'Oncology', NULL),
('x4wgj70crcukjfsz46ikpfqu', 'Ophthalmology', NULL),
('dpnghynl7b1kcf6xy7hgk6m6', 'Optometry', (SELECT id from "HealthServiceOption" WHERE "name" = 'Optical Center')),
('ahne2ffup162dh6qdzou2fpq', 'Oral and Maxillofacial Surgery', NULL),
('kkeomrb5afqghkc5s1cqidv5', 'Orthodontics', NULL),
('fawyv7eqin43q7sp2muyoud2', 'Orthopaedic Surgery', NULL),
('v9rmpxch93zs4ebytgwco3w5', 'Paediatrics', NULL),
('sjvbg8yo4i1hf6mdfjxxau86', 'Paedodontics', NULL),
('dj8zomm7rr9snpxi3i9enrdv', 'Periodontology', NULL),
('b8eljzi53fnxgy0yo71cjc68', 'Physiotherapy', (SELECT id from "HealthServiceOption" WHERE "name" = 'Physiotherapy Clinic')),
('upbs8ywk6si9vz3mrrv1m8rf', 'Plastic Surgery', NULL),
('v7hkvs0mwcibgi3ph5sxkvj4', 'Polymerase Chain Reaction (PCR)', NULL),
('metmgnpmr5s2fbea6sgos6cr', 'Pre-implantation Genetic Diagnosis (PIGD)', NULL),
('h3uccrefrng6fj60gpo06957', 'Preventive Care', NULL),
('yyp6yw8hd2b9yt57gi840pds', 'Primary Health Care', NULL),
('xak81eqgybupkticxyo4j8pf', 'Psychiatry', NULL),
('earsm6pgqzgnl2otz5wwg7x9', 'Radiotherapy / Sonography', (SELECT id from "HealthServiceOption" WHERE "name" = 'Radiotherapy Center Clinic')),
('gg159623e474ngpft9zh214k', 'Scaling and Polishing', (SELECT id from "HealthServiceOption" WHERE "name" = 'Dental Clinic')),
('glmhmdmpowzmt6oambcpmwec', 'Scan', (SELECT id from "HealthServiceOption" WHERE "name" = 'Radio Diagnostic Center')),
('t36kgr42hcbadqiq4ognxs6n', 'Sequencing', NULL),
('pofzhwpjgpyu92djg0kq5wrf', 'Serology', (SELECT id from "HealthServiceOption" WHERE "name" = 'Medical Laboratory')),
('z7u15ii2qqob2owcescjh8vp', 'SNP Analysis', NULL),
('ps17ai2ot09n6i6bhpmozb5w', 'SPA and Beauty Clinic', NULL),
('elx5chcul8yfg1sw2ck1u7js', 'Urology', NULL),
('ku7styylge8cgau92avorszk', 'X-ray', (SELECT id from "HealthServiceOption" WHERE "name" = 'Radio Diagnostic Center'));
