CREATE TABLE GeneratedAtTimeToobjecten (
    id INTEGER PRIMARY KEY,
    generatedAtTime DATE NOT NULL,
    URI TEXT,
    CONSTRAINT GeneratedAtTimeToObject_fk_URI FOREIGN KEY (URI)
        REFERENCES objecten(URI) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE objecten (
  URI TEXT NOT NULL,
  generatedAtTime DATE NOT NULL,
  payload TEXT DEFAULT '{}'
);

CREATE INDEX GeneratedAtTimeToobjecten_index_generatedAtTime ON GeneratedAtTimeToobjecten(generatedAtTime);
CREATE INDEX objecten_index_URI ON objecten(URI);
