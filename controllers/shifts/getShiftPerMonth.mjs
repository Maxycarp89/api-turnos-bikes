import { clienteAxios } from "../../utils/clienteAxios.mjs";
import "dotenv/config";




const getShiftPerMonth = async (req, res) => {

  const today = new Date();
const startOfMonth = new Date(today);
startOfMonth.setDate(today.getDate() + 1);  // Mover al día siguiente

const endOfPeriod = new Date(startOfMonth);
endOfPeriod.setDate(startOfMonth.getDate() + 60);  // 30 días después de startOfMonth

const formattedStartOfMonth = startOfMonth.toISOString().split("T")[0];
const formattedEndOfPeriod = endOfPeriod.toISOString().split("T")[0];

//console.log(formattedStartOfMonth, formattedEndOfPeriod);

  const {BPLId} = req.query;  
  //console.log(BPLId); 
  
  const loginData = await clienteAxios.post("/b1s/v1/Login", {
    UserName: process.env.NODE_MASTER_USER,
    CompanyDB: process.env.NODE_DATABASE_SAP,
    Password: process.env.NODE_MASTER_PASSWORD,
  });
 

  try {
    const { data } = await clienteAxios.get(
      `/b1s/v1/ADMTURNOS/?$filter=(U_Fecha ge ${formattedStartOfMonth} and U_Fecha le ${formattedEndOfPeriod}) and U_BPLId eq ${BPLId} &$orderby=U_Fecha asc`,
      {
        headers: {
          Cookie: loginData.headers["set-cookie"][0],
          Prefer: "odata.maxpagesize=0",
        },
      }
    );
    //console.log(data);
    if (!data.value.length) return res.send(data.value);
    const dataMaped = data.value.map((e) => {
      return {
        ...e,
        U_HorarioRecep: JSON.parse(e.U_HorarioRecep),
      };
    });
    return res.status(200).send(dataMaped);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
};

export default getShiftPerMonth;
