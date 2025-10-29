import { Router } from "express";
import searchCustomerMotorbike from "../controllers/customer/searchCustomerMotorBike.mjs";


const customerRoutes = Router();


customerRoutes.get("/searchCustomerMotorbike", searchCustomerMotorbike);


export default customerRoutes;