const express = require("express");
const path = require("path");
const app = express();

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port =
  externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;

if (externalUrl) {
  const hostname = "0.0.0.0";
  app.listen(port, hostname, () => {
    console.log(`Server locally running at http://${hostname}:${port}/ and from
    outside on ${externalUrl}`);
  });
} else {
  http
    .createServer(app)
    .listen(port, function () {
      console.log(`Server running at http://localhost:${port}/`);
    });
}

app.use(express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(4, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
