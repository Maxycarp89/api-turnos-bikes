import { clienteAxios } from "../../../utils/clienteAxios.mjs";

const getBussinessPartner = async (req, res) => {
  const cookies = req.header("Authorization");
  const { Search } = req.query;
  try {
    const { data } = await clienteAxios.get(
      `/b1s/v1/BusinessPartners?$select=FederalTaxID,CardCode,CardName,Address,FederalTaxID,Cellular,City,Country,EmailAddress&$filter=contains(CardCode, '${Search.toUpperCase()}') or contains(FederalTaxID, '${Search.toUpperCase()}') or contains(CardName, '${Search.toUpperCase()}')`,
      {
        headers: {
          Cookie: cookies,
        },
      }
    );
    return res.status(200).send(data.value);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export default getBussinessPartner;
