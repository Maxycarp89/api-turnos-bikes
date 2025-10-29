import { clienteAxios } from "../../../utils/clienteAxios.mjs";

const createClient = async (req, res) => {
  const cookies = req.header("Authorization");
  const {
    CardName,
    FederalTaxID,
    Cellular,
    Address,
    EmailAddress,
    Series,
    County,
    City,
    U_B1SYS_VATCtg,
    ZipCode,
    U_B1SYS_FiscIdType,
  } = req.body;
  try {
    await clienteAxios.post(
      `/b1s/v1/BusinessPartners`,
      {
        CardName,
        FederalTaxID,
        Cellular,
        Address,
        EmailAddress,
        Series,
        County,
        City,
        U_B1SYS_VATCtg,
        ZipCode,
        U_B1SYS_FiscIdType,
      },
      {
        headers: {
          Cookie: `${cookies}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.status(200).send({ resp: "Cliente cargado con éxito" });
  } catch (error) {
    res
      .status(400)
      .send({
        error:
          "Ocurrio un problema al cargar el cliente. Esto se puede deber a que el cliente ya esté cargado.",
      });
  }
};

export default createClient;
