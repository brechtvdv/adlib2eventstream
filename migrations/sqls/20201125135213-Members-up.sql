CREATE TABLE GeneratedAtTimeToMembers (
    id INTEGER PRIMARY KEY,
    institution TEXT NOT NULL,
    database TEXT NOT NULL,
    generatedAtTime DATE NOT NULL,
    URI TEXT,
    CONSTRAINT GeneratedAtTimeToMembers_fk_URI FOREIGN KEY (URI)
        REFERENCES Members(URI) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Members (
  URI TEXT NOT NULL,
  institution TEXT NOT NULL,
  database TEXT NOT NULL,
  generatedAtTime DATE NOT NULL,
  payload TEXT DEFAULT '{}'
);

CREATE INDEX GeneratedAtTimeToMembers_index_institution ON GeneratedAtTimeToMembers(institution);
CREATE INDEX GeneratedAtTimeToMembers_index_database ON GeneratedAtTimeToMembers(database);
CREATE INDEX GeneratedAtTimeToMembers_index_generatedAtTime ON GeneratedAtTimeToMembers(generatedAtTime);
CREATE INDEX Members_index_URI ON Members(URI);
CREATE INDEX Members_index_institution ON Members(institution);
CREATE INDEX Members_index_database ON Members(database);
