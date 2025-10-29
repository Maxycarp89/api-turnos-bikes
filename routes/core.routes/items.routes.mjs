import { Router } from "express";
import usuarioPtoEmision from "../../controllers/core/usuarioPtoEmision.mjs";

const itemsRoutes = Router();

itemsRoutes.get("/usuarioPtoEmision", usuarioPtoEmision);


export default itemsRoutes;