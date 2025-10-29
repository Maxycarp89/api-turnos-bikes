import {Router} from "express";

import getBussinessPartner from "../../controllers/core/bussines-partner.controller/getBussinessPartner.mjs"
import createClient from "../../controllers/core/bussines-partner.controller/CreateClient.mjs";


const bussinesRoutes = Router();

bussinesRoutes.get("/getBussinessPartner", getBussinessPartner);
bussinesRoutes.post("/createClient", createClient);

export default bussinesRoutes;