import getShiftsLastMonth from "../controllers/shifts/getShiftsLastMonth.mjs"
import createShiftList from "../controllers/shifts/createShiftList.mjs"
import getShiftPerMonth from "../controllers/shifts/getShiftPerMonth.mjs"
import patchShiftList from "../controllers/shifts/patchShiftList.mjs"
import getShiftMonth from "../controllers/shifts/getShiftMonth.mjs"
import patchShiftStatus from "../controllers/shifts/patchShiftStatus.mjs"
import getShiftExist from "../controllers/shifts/getShiftExist.mjs"

import { Router } from "express"

const shiftsRoutes = Router()

shiftsRoutes.get("/getShiftsLastMonth", getShiftsLastMonth)
shiftsRoutes.get("/getShiftPerMonth", getShiftPerMonth)
shiftsRoutes.get("/getShiftMonth",getShiftMonth)
shiftsRoutes.get("/getShiftExist", getShiftExist)
shiftsRoutes.post("/createShiftList", createShiftList)
shiftsRoutes.patch("/patchShiftList", patchShiftList)
shiftsRoutes.patch("/patchShiftStatus/:DocEntry", patchShiftStatus)


export default shiftsRoutes 