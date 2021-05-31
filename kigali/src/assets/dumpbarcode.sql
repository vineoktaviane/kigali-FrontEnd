CREATE TABLE IF NOT EXISTS barcodetable(
    id INTEGER PRIMARY KEY,
    r_ean INTEGER, 
    r_name TEXT,
    r_description TEXT,
    r_effect TEXT,
    r_dosage TEXT
);

INSERT or IGNORE INTO barcodetable(id, r_ean, r_name, r_description, r_effect, r_dosage) VALUES (1, 8717159044176,'Exceem cream', 'A soothing and protective cream or ointment keeps the skin supple and prevents the skin from drying out. Itching, flakiness, chapping and burning areas will diminish within a few days. Other complaints, such as eczema or psoriasis, are better controlled.', "Very rare (affects less than 1 in 100 people) this cream might give you hypersensitivity and irritation", "Apply the cream or ointment to the skin as needed. Usually 1 to 2 times a day is sufficient, but sometimes it is necessary more often if the skin feels dry. You can determine this yourself.");
