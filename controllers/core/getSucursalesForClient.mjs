import { clienteAxios } from "../../utils/clienteAxios.mjs";
import "dotenv/config";

const getSucursal = async (req, res) => {
  try {
    const loginData = await clienteAxios.post("/b1s/v1/Login", {
      UserName: process.env.NODE_MASTER_USER,
      CompanyDB: process.env.NODE_DATABASE_SAP,
      Password: process.env.NODE_MASTER_PASSWORD,
    });

    const userName = process.env.NODE_MASTER_USER; 
   

    const uriDecode = decodeURI(`USER_CODE eq '${userName}'`);
  
    const result = await clienteAxios.get(
      `/b1s/v1/sml.svc/YUH_SUCUSUARIO2025?$select=BPLId,BPLName,Street,U_NAME,AliasName&$filter=(${uriDecode} and( BPLId eq 68 or BPLId eq 81 or BPLId eq 128)) &$orderby=BPLId`,
      {
        headers: {
          Cookie: loginData.headers["set-cookie"][0],
          Prefer: "odata.maxpagesize=0",
        },
      }
    );

    const sucuFiltered = result.data.value.filter(
      (sucu) => sucu.U_NAME !== null && sucu.AliasName !== null
    );
  
    res.json(sucuFiltered);
    return sucuFiltered;
    
  } catch (error) {
    console.log(error);
    throw new Error("No se encontraron sucursales");
  }
};

export default getSucursal;
