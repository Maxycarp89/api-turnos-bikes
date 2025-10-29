import { clienteAxios } from "../../utils/clienteAxios.mjs";

const getShiftMonth = async(req,res) =>{
  const cookies = req.header("Authorization");
  const {FechInicio,FechFinal, BPLId} = req.query;

try {
  const shiftsExist = await clienteAxios.get(
    `/b1s/v1/TURNOS?$filter=(U_Fecha ge '${FechInicio}' and U_Fecha le '${FechFinal}')and U_BPLId eq ${BPLId}&$select=DocEntry,CreateDate,U_BPLId,U_customer,U_custmrName,U_Telephone,U_Street,U_City,U_subject,U_status,U_callType,U_priority,U_problemTyp,U_descrption,U_ProSubType,U_origin,U_BPType,U_itemCode,U_itemName,U_Chasis,U_Motor,U_State,U_Fecha,U_internalSN,U_StartTime&$orderby=U_Fecha desc`,
    {
      headers: {
        Cookie: `${cookies}`,
        Prefer: "odata.maxpagesize=0",
      },
    }
  );
 // console.log("soy shiftsExist",shiftsExist.data);
  if (shiftsExist)
  return res
    .status(200)
    .send({ shiftsExist: shiftsExist.data.value });
} catch (error) {
  console.log(error);
    return res.status(400).send(error);
}

}

export default getShiftMonth