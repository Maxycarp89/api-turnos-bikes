import { clienteAxios } from "../../utils/clienteAxios.mjs";

const getSucu = async (req, res) => {
  
  const cookies = req.header("Authorization");
  const { UserName } = req.query;
  const uriDecode = decodeURI(`USER_CODE eq '${UserName}'`);
  let sucur = [];
  try {
    const result = await clienteAxios.get(
      `/b1s/v1/sml.svc/YUH_SUCUSUARIO?$select=BPLId, BPLName, U_NAME,AliasName&$filter=${uriDecode}&$orderby=BPLId`,
      {
        headers: {
          Cookie: `${cookies}`,
          Prefer: "odata.maxpagesize=0",
        },
      }
    );
    const sucuFiltered = result.data.value.filter(
      (sucu) => sucu.U_Name !== null && sucu.AliasName !== null
    );
    sucur = [...sucuFiltered];
    res.status(200).send(sucur);
  } catch (error) {
    res.status(401).send("No se encontraron sucursales para este usuario");
  }
};

export default getSucu;
