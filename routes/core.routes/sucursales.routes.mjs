import { Router } from "express";
import getSucu from "../../controllers/core/getSucursales.mjs";
import getSucursal from "../../controllers/core/getSucursalesForClient.mjs";


const sucursalesRoutes = Router();

//* GET
sucursalesRoutes.get("/sucursales", getSucu);
sucursalesRoutes.get("/sucursalesClient", getSucursal);

export default sucursalesRoutes;
