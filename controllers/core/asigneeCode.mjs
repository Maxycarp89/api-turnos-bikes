import { clienteAxios } from "../../utils/clienteAxios.mjs";

const getAsigneeCode = async (req, res) => {
  const cookies = req.header("Authorization");
  const { User } = req.body;
  const { data } = await clienteAxios.get(
    `/b1s/v1/Users?$filter=UserCode eq '${User}'&$select=InternalKey`,
    {
      headers: {
        Cookie: `${cookies}`,
      },
    }
  );
  return res.send({ asigneeCode: data.value[0].InternalKey });
};

export default getAsigneeCode;