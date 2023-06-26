const express = require("express");
const bodyParser = require("body-parser");
const routes = require("../router");

const app = express();
app.use(bodyParser.json());

const PORT = 8000;

app.use("/", routes.auth);
app.use("/profile", routes.profile);
app.use("/blog", routes.blog);

app.listen(PORT, () => {
  console.log(`server listen on port:${PORT}`);
});
