import { clienteAxios } from "../../utils/clienteAxios.mjs";
import "dotenv/config";

const shipmentEmision = async (req, res) => {
  const cookies = req.header("Authorization");
  const { BPLName } = req.query;
  try {
    const { data } = await clienteAxios.get(
      `/b1s/v1/sml.svc/YUH_SUCUSUARIO2025?$filter=BPLName eq '${BPLName}'&$select=BPLId`,
      {
        headers: {
          Cookie: `${cookies}`,
          Prefer: "odata.maxpagesize=1",
        },
      }
    );
    const ptoEmision = await clienteAxios.get(
      `/b1s/v1/sml.svc/YUH_USUARIOPTOEMISION?$filter=USER_CODE eq '${process.env.NODE_DEFAULT_USER_SAP}' and BPLId eq ${data.value[0].BPLId}`,
      {
        headers: {
          Cookie: `${cookies}`,
          Prefer: "odata.maxpagesize=1",
        },
      }
    );
    return res.status(200).send(ptoEmision.data.value);
  } catch (error) {
    console.log(error)
    return res.status(400).send(error);
  }
};

export default shipmentEmision