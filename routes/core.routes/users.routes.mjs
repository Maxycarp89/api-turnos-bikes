import { Router } from "express";
import {
  login,
  loginAgain,
  logout,
  users,
} from "../../controllers/core/session.controllers/index.mjs";
import getAsigneeCode from "../../controllers/core/asigneeCode.mjs";

const usersRoutes = Router();

//* POST
usersRoutes.post("/login", login);
usersRoutes.post("/loginAgain", loginAgain);
usersRoutes.post("/logout", logout);
usersRoutes.post("/getAsigneeCode", getAsigneeCode);

//* GET
usersRoutes.get("/users", users);

export default usersRoutes;