import { Router } from "express";
import { login, loginAgain, logout, users } from "../controllers/session.controllers/index.mjs";

const usersRoutes = Router();

//* POST
usersRoutes.post("/login", login);
usersRoutes.post("/loginAgain", loginAgain);
usersRoutes.post("/logout", logout);

//* GET
usersRoutes.get("/users", users);


export default usersRoutes;
