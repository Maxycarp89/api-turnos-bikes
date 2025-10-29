process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import express from "express";
import "dotenv/config";
import initConfig from "./config/index.mjs";
import routes from "./routes/index.mjs";

const app = express();

initConfig(app);

app.use("/api/v1", routes);

app.listen(process.env.PORT_TEST, () => {
  console.log(`Listening on localhost:${process.env.PORT_TEST}`);
});
