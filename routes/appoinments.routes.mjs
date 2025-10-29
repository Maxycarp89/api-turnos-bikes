import {Router} from "express"
import createAppoinment from "../controllers/appoinments-controller/createAppoinment.mjs"



const appoinmentsRoutes = Router()

appoinmentsRoutes.post("/turnos", createAppoinment)





export default appoinmentsRoutes