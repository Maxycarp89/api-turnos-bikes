import { Router } from "express";
import coreRoutes from "./core.routes/index.mjs";
import shiftsRoutes from "./shifts.routes.mjs";
import customerRoutes from "./customer.routes.mjs";
import appoinmentsRoutes from "./appoinments.routes.mjs";
import sucursalesRoutes from "./core.routes/sucursales.routes.mjs";





const routes = Router();

routes.use("/", coreRoutes);
routes.use("/", customerRoutes);
routes.use("/", appoinmentsRoutes);
routes.use("/", shiftsRoutes);
routes.use("/", sucursalesRoutes);

//routes.use("/", shiftsRoutes);


export default routes;
