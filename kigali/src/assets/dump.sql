CREATE TABLE IF NOT EXISTS remindertable(
    id INTEGER PRIMARY KEY,
    r_title TEXT, 
    r_description TEXT,
    r_date TEXT,
    r_time TEXT,
    r_food TEXT,
    r_foodIcon TEXT
);

INSERT or IGNORE INTO remindertable(id, r_title, r_description, r_date, r_time, r_food, r_foodIcon) VALUES (1, 'Xanax', '2', "2020-12-03", "10:25:22", "after meal", "assets/icon/utensils-solid.png");
INSERT or IGNORE INTO remindertable(id, r_title, r_description, r_date, r_time, r_food, r_foodIcon) VALUES (2, 'Paracetamol', '2', "2020-12-03", "12:16:22", "before meal", "assets/icon/utensils-solid.png");