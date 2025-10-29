import { clienteAxios } from "../../utils/clienteAxios.mjs";

const usuarioPtoEmision = async (req, res) => {
  const cookies = req.header("Authorization");
  const { UserCode, Warehouse } = req.query;
  try {
    const { data } = await clienteAxios.get(
      `/b1s/v1/sml.svc/YUH_USUARIOPTOEMISION?$filter=USER_CODE eq '${UserCode}' and BPLId eq ${Warehouse}`,
      {
        headers: {
          Cookie: `${cookies}`,
        },
      }
    );
    return res.send(data.value);
  } catch (error) {
    console.log(error)
    res.status(400).send(error);
  }
};

export default usuarioPtoEmision;
