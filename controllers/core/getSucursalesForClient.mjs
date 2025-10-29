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
      `/b1s/v1/sml.svc/YUH_SUCUSUARIO?$select=BPLId,BPLName,Street,U_NAME,AliasName&$filter=(${uriDecode} and( BPLId eq 71 or BPLId eq 72 or BPLId eq 70 or BPLId eq 61 or BPLId eq 60 or BPLId eq 103 or BPLId eq 129 or BPLId eq 95 or BPLId eq 62 
      or BPLId eq 101 or BPLId eq 102 or BPLId eq 121 or BPLId eq 139 or BPLId eq 76 or BPLId eq 129 or BPLId eq 85 or BPLId eq 86 or BPLId eq 92 or BPLId eq 73
)) &$orderby=BPLId`,
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
