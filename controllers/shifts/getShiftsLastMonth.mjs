import { clienteAxios } from "../../utils/clienteAxios.mjs";

const getShiftsLastMonth = async (req, res) => {
  const cookies = req.header("Authorization");
  const { FechInicio, FechFinal, BPLId } = req.query;
  try {
    const { data } = await clienteAxios.get(
      `/b1s/v1/ADMTURNOS?$filter=(U_Fecha ge '${FechInicio}' and U_Fecha le '${FechFinal}') and U_BPLId eq ${BPLId}&$orderby=U_Fecha asc`,
      {
        headers: {
          Cookie: `${cookies}`,
          Prefer: "odata.maxpagesize=0",
        },
      }
    );
    const shiftsExist = await clienteAxios.get(
      `/b1s/v1/TURNOS?$filter=(CreateDate ge '${FechInicio}' and CreateDate le '${FechFinal}')  and U_BPLId eq ${BPLId}&$select=DocEntry,CreateDate,U_customer,U_custmrName,U_Telephone,U_Street,U_City,U_subject,U_status,U_callType,U_priority,U_problemTyp,U_descrption,U_ProSubType,U_origin,U_BPType,U_itemCode,U_itemName,U_Chasis,U_Motor,U_internalSN,U_StartTime,U_State,U_Fecha&$orderby=CreateDate asc`,
      {
        headers: {
          Cookie: `${cookies}`,
          Prefer: "odata.maxpagesize=0",
        },
      }
    );
    if (!data.value.length)
      return res
        .status(200)
        .send({ shifts: data.value, shiftsExist: shiftsExist.data.value });
    const dataMaped = data.value.map((e) => {
      return {
        ...e,
        U_HorarioRecep: JSON.parse(e.U_HorarioRecep),
      };
    });
    return res
      .status(200)
      .send({ shifts: dataMaped, shiftsExist: shiftsExist.data.value });
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
};

export default getShiftsLastMonth;
