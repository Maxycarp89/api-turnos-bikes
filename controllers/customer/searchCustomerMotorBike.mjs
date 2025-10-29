import { clienteAxios } from "../../utils/clienteAxios.mjs";
import "dotenv/config";

const searchCustomerMotorbike = async (req, res) => {
  const loginData = await clienteAxios.post("/b1s/v1/Login", {
    UserName: process.env.NODE_MASTER_USER,
    CompanyDB: process.env.NODE_DATABASE_SAP,
    Password: process.env.NODE_MASTER_PASSWORD,
  });
  const { DNI, Client, Chasis, Motor, Serie, ClientName } = req.query;
  let data = [];
  let uriDecode;
  if (DNI) {
    uriDecode = decodeURI(
      `LicTradNum eq '${DNI.toString().toUpperCase()}' and contains(ItemCode, 'M0')`
    );
  } else if (Client) {
    uriDecode = decodeURI(
      `CardCode eq '${Client.toString().toUpperCase()}' and contains(ItemCode, 'M0')`
    );
  } else if (Chasis) {
    uriDecode = decodeURI(
      `U_Chasis eq '${Chasis.toString().toUpperCase()}' and contains(ItemCode, 'M0')`
    );
  } else if (Motor) {
    uriDecode = decodeURI(
      `U_Motor eq '${Motor.toString().toUpperCase()}' and contains(ItemCode, 'M0')`
    );
  } else if (Serie) {
    uriDecode = decodeURI(
      `IntrSerial eq '${Serie.toString().toUpperCase()}' and contains(ItemCode, 'M0')`
    );
  } else if (ClientName) {
    uriDecode = decodeURI(
      `contains(CardName, '${ClientName.toString().toUpperCase()}') and contains(ItemCode, 'M0')`
    );
  }
  const resultClienteYProductos = await clienteAxios.get(
    `/b1s/v1/sml.svc/YUH_CLIENTEYPRODASOCIADOS2?$filter=${uriDecode}`,
    {
      headers: {
        Cookie: loginData.headers["set-cookie"][0],
        Prefer: "odata.maxpagesize=0",
      },
    }
  );
  data = [...resultClienteYProductos.data.value];
  if (data.length === 0) {
    if (Client || DNI) {
      if (Client) {
        uriDecode = decodeURI(
          `$select=CustomerName,Resolution,ItemCode,ItemDescription,Status,U_Motor,U_Chasis,BPBillToAddress,U_Modelo,U_Patente,U_Marca,U_NombColor,BPeMail,Telephone,U_Kilometraje,InternalSerialNum,CustomerCode,City&$filter=CustomerCode eq '${Client}' and contains(ItemCode, 'M0')&$orderby=ServiceCallID desc`
        );
        const historyLastService = await clienteAxios(
          `/b1s/v1/ServiceCalls?${uriDecode}`,
          {
            headers: {
              Cookie: loginData.headers["set-cookie"][0],
              Prefer: "odata.maxpagesize=1",
            },
          }
        );
        data = [...historyLastService.data.value];
        if (data.length > 0) {
          res.send(data);
        } else {
          uriDecode = decodeURI(
            `CardCode eq '${Client.toString().toUpperCase()}'`
          );
          const bussinessPartner = await clienteAxios.get(
            `/b1s/v1/BusinessPartners?$select=CardCode,CardName,FederalTaxID,City,Address,Cellular,EmailAddress&$filter=${uriDecode}`,
            {
              headers: {
                Cookie: loginData.headers["set-cookie"][0],
              },
            }
          );
          data = [...bussinessPartner.data.value];
          if (data.length > 0) {
            res.send(data);
          } else {
            res.send(data);
          }
        }
      } else {
        uriDecode = decodeURI(
          `FederalTaxID eq '${DNI.toString().toUpperCase()}'`
        );
        const bussinessPartner = await clienteAxios.get(
          `/b1s/v1/BusinessPartners?$select=CardCode,CardName,FederalTaxID,City,Address,Cellular,EmailAddress&$filter=${uriDecode}`,
          {
            headers: {
              Cookie: loginData.headers["set-cookie"][0],
            },
          }
        );
        if (bussinessPartner.data.value.length > 0) {
          uriDecode = decodeURI(
            `$select=CustomerName,Resolution,ItemCode,ItemDescription,Status,U_Motor,U_Chasis,BPBillToAddress,U_Modelo,U_Patente,U_NombColor,U_Marca,BPeMail,Telephone,U_Kilometraje,InternalSerialNum,CustomerCode,City&$filter=CustomerCode eq '${bussinessPartner.data.value[0].CardCode}' and contains(ItemCode, 'M0')&$orderby=ServiceCallID desc`
          );
          const historyLastService = await clienteAxios(
            `/b1s/v1/ServiceCalls?${uriDecode}`,
            {
              headers: {
                Cookie: loginData.headers["set-cookie"][0],
                Prefer: "odata.maxpagesize=1",
              },
            }
          );
          if (historyLastService.data.value.length > 0) {
            data = [...historyLastService.data.value];
            res.send(data);
          } else {
            data = [...bussinessPartner.data.value];
            res.send(data);
          }
        } else {
          res.send(data);
        }
      }
    } else if (Chasis) {
      uriDecode = decodeURI(
        `$select=CustomerName,Resolution,ItemCode,ItemDescription,Status,U_Motor,U_Chasis,BPBillToAddress,U_Modelo,U_Patente,U_Marca,U_NombColor,BPeMail,Telephone,U_Kilometraje,InternalSerialNum,CustomerCode,City&$filter=U_Chasis eq '${Chasis}' and contains(ItemCode, 'M0')&$orderby=ServiceCallID desc`
      );
      const historyLastService = await clienteAxios(
        `/b1s/v1/ServiceCalls?${uriDecode}`,
        {
          headers: {
            Cookie: loginData.headers["set-cookie"][0],
            Prefer: "odata.maxpagesize=1",
          },
        }
      );
      if (historyLastService.data.value.length > 0) {
        data = [...historyLastService.data.value];
        res.send(data);
      } else {
        res.send(data);
      }
    } else if (Motor) {
      uriDecode = decodeURI(
        `$select=CustomerName,Resolution,ItemCode,ItemDescription,Status,U_Motor,U_Chasis,BPBillToAddress,U_Modelo,U_Patente,U_NombColor,U_Marca,BPeMail,Telephone,U_Kilometraje,InternalSerialNum,CustomerCode,City&$filter=U_Motor eq '${Motor}' and contains(ItemCode, 'M0')&$orderby=ServiceCallID desc`
      );
      const historyLastService = await clienteAxios(
        `/b1s/v1/ServiceCalls?${uriDecode}`,
        {
          headers: {
            Cookie: loginData.headers["set-cookie"][0],
            Prefer: "odata.maxpagesize=1",
          },
        }
      );
      if (historyLastService.data.value.length > 0) {
        data = [...historyLastService.data.value];
        res.send(data);
      } else {
        res.send(data);
      }
    } else if (Serie) {
      uriDecode = decodeURI(
        `$select=CustomerName,Resolution,ItemCode,ItemDescription,Status,U_Motor,U_Chasis,BPBillToAddress,U_Modelo,U_Patente,U_NombColor,U_Marca,BPeMail,Telephone,U_Kilometraje,InternalSerialNum,CustomerCode,City&$filter=InternalSerialNum eq '${Serie.toString().toUpperCase()}' and contains(ItemCode, 'M0')&$orderby=ServiceCallID desc`
      );
      const historyLastService = await clienteAxios(
        `/b1s/v1/ServiceCalls?${uriDecode}`,
        {
          headers: {
            Cookie: loginData.headers["set-cookie"][0],
            Prefer: "odata.maxpagesize=1",
          },
        }
      );
      if (historyLastService.data.value.length > 0) {
        data = [...historyLastService.data.value];
        res.send(data);
      } else {
        res.send(data);
      }
    } else {
      res.send(data);
    }
  } else {
    res.send(data);
  }
};

export default searchCustomerMotorbike;
