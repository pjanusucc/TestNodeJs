const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = process.env.PORT || 3000; // Use the environment variable PORT if available, otherwise default to 3000

const db = new sqlite3.Database("example.db");

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INT, name TEXT)");

  db.get(
    "SELECT COUNT(*) AS count FROM users WHERE id = ?",
    [1],
    (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
      if (row.count === 0) {
        const stmt = db.prepare("INSERT INTO users VALUES (?, ?)");
        stmt.run(1, "John Doe");
        stmt.run(2, "Jane Smith");
        stmt.finalize();
      }
    },
  );
});

app.get("/", (req, res) => {
  db.all("SELECT id, name FROM users", (err, rows) => {
    if (err) {
      res.status(500).send("Error retrieving data from database");
      return;
    }

    //HTML output
    let html = "<!DOCTYPE html><html><head><title>Users</title></head><body>";
    html += "<h1>Users</h1>";
    html += "<ul>";
    rows.forEach((row) => {
      html += `<li>${row.id}: ${row.name}</li>`;
    });
    html += "</ul>";
    html += "</body></html>";

    res.send(html);
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Closed the database connection.");
    process.exit(0);
  });
});
