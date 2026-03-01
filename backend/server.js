const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/questions", require("./routes/questions.routes"));
app.use("/api/progress", require("./routes/progress.routes"));
app.use("/api/sessions", require("./routes/sessions.routes"));
app.use("/api/resources", require("./routes/resources.routes"));
app.use("/api/study-plan", require("./routes/studyplan.routes"));

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);