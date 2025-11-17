import { clienteAxios } from "../../../utils/clienteAxios.mjs";
import "dotenv/config";

let postData = [];
let cookies = {};

export const login = async (req, res) => {
  const { UserName, Password } = req.body;
  const currentAccount = [];
  if (postData.length > 0) {
    for (let i = 0; i < postData.length; i++) {
      if (
        postData[i].UserName.includes(UserName) &&
        postData[i].Password.includes(Password)
      ) {
        currentAccount.push(postData[i]);
      }
    }
    if (currentAccount.length > 0) {
      const loginData = await clienteAxios.post(
        "/b1s/v1/Login",
        currentAccount[0]
      );
      const rolUser = await clienteAxios.get(
        `/b1s/v1/sml.svc/YUH_UNIDADNEGOCIOUSUARIO2025?$filter=USER_CODE eq '${UserName}'`,
        {
          headers: {
            Cookie: loginData.headers["set-cookie"][0],
          },
        }
      );
      const offices = await clienteAxios.get(
        `/b1s/v1/sml.svc/YUH_SUCUSUARIO2025?$select=BPLId, BPLName, U_NAME,AliasName&$filter=USER_CODE eq '${UserName}'&$orderby=BPLId`,
        {
          headers: {
            Cookie: loginData.headers["set-cookie"][0],
            Prefer: "odata.maxpagesize=0",
          },
        }
      );

      const sucuFiltered = offices.data.value.filter(
        (sucu) => sucu.U_Name !== null && sucu.AliasName !== null
      );
      const asigneeCode = await clienteAxios.get(
        `/b1s/v1/Users?$filter=UserCode eq '${UserName}'&$select=InternalKey`,
        {
          headers: {
            Cookie: loginData.headers["set-cookie"][0],
          },
        }
      );
      return res.json({
        session: loginData.headers,
        rol: rolUser.data.value,
        sucu: sucuFiltered,
        asignee: asigneeCode.data.value[0].InternalKey
      });
    } else {
      try {
        const loginData = await clienteAxios.post("/b1s/v1/Login", {
          UserName,
          Password,
          CompanyDB: process.env.NODE_DATABASE_SAP,
        });
        if (loginData.headers) {
          postData.push({
            UserName,
            Password,
            CompanyDB: process.env.NODE_DATABASE_SAP,
          });
          const rolUser = await clienteAxios.get(
            `/b1s/v1/sml.svc/YUH_UNIDADNEGOCIOUSUARIO2025?$filter=USER_CODE eq '${UserName}'`,
            {
              headers: {
                Cookie: loginData.headers["set-cookie"][0],
              },
            }
          );
          const offices = await clienteAxios.get(
            `/b1s/v1/sml.svc/YUH_SUCUSUARIO2025?$select=BPLId, BPLName, U_NAME,AliasName&$filter=USER_CODE eq '${UserName}'&$orderby=BPLId`,
            {
              headers: {
                Cookie: loginData.headers["set-cookie"][0],
                Prefer: "odata.maxpagesize=0",
              },
            }
          );
          const asigneeCode = await clienteAxios.get(
            `/b1s/v1/Users?$filter=UserCode eq '${UserName}'&$select=InternalKey`,
            {
              headers: {
                Cookie: loginData.headers["set-cookie"][0],
              },
            }
          );
          const sucuFiltered = offices.data.value.filter(
            (sucu) => sucu.U_Name !== null && sucu.AliasName !== null
          );
          return res.json({
            session: loginData.headers,
            rol: rolUser.data.value,
            sucu: sucuFiltered,
            asignee: asigneeCode.data.value[0].InternalKey
          });
        }
      } catch (error) {
        res.status(401).send({ error: "Fallo al iniciar sesión" });
      }
    }
  } else {
    try {
      const loginData = await clienteAxios.post("/b1s/v1/Login", {
        UserName,
        Password,
        CompanyDB: process.env.NODE_DATABASE_SAP,
      });
      if (loginData.headers) {
        postData.push({
          UserName,
          Password,
          CompanyDB: process.env.NODE_DATABASE_SAP,
        });
        const rolUser = await clienteAxios.get(
          `/b1s/v1/sml.svc/YUH_UNIDADNEGOCIOUSUARIO2025?$filter=USER_CODE eq '${UserName}'`,
          {
            headers: {
              Cookie: loginData.headers["set-cookie"][0],
            },
          }
        );
        const offices = await clienteAxios.get(
          `/b1s/v1/sml.svc/YUH_SUCUSUARIO2025?$select=BPLId, BPLName, U_NAME,AliasName&$filter=USER_CODE eq '${UserName}'&$orderby=BPLId`,
          {
            headers: {
              Cookie: loginData.headers["set-cookie"][0],
              Prefer: "odata.maxpagesize=0",
            },
          }
        );
        const asigneeCode = await clienteAxios.get(
          `/b1s/v1/Users?$filter=UserCode eq '${UserName}'&$select=InternalKey`,
          {
            headers: {
              Cookie: loginData.headers["set-cookie"][0],
            },
          }
        );
        const sucuFiltered = offices.data.value.filter(
          (sucu) => sucu.U_Name !== null && sucu.AliasName !== null
        );
        return res.json({
          session: loginData.headers,
          rol: rolUser.data.value,
          sucu: sucuFiltered,
          asignee: asigneeCode.data.value[0].InternalKey
        });
      }
    } catch (error) {
      res.status(401).send({ error: "Fallo al iniciar sesión" });
    }
  }
};

export const loginAgain = async (req, res) => {
  const { UserName } = req.body;
  const currentAccount = [];
  try {
    for (let i = 0; i < postData.length; i++) {
      if (postData[i].UserName.includes(UserName)) {
        currentAccount.push(postData[i]);
      }
    }
    const loginData = await clienteAxios.post(
      "/b1s/v1/Login",
      currentAccount[0]
    );
    res.json(loginData.headers);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const logout = async (req, res) => {
  const cookies = req.header("Authorization");
  const { UserName } = req.body;
  postData = postData.filter((e) => {
    if (!e.UserName.includes(UserName)) {
      return e;
    }
  });
  try {
    await clienteAxios.post("/b1s/v1/Logout", {
      headers: {
        Cookie: `${cookies}`,
      },
    });
    res.send({ message: "Logout Succesfully" });
  } catch (error) {
    res.status(400).send(error);
  }
};

export const users = async (req, res) => {
  cookies = req.header("Authorization");
  const { user } = req.query;
  let allBPlaces = [];

  if (!cookies) {
    res.status(401).send({
      error: "Iniciar sesión y guardar el toquen para obtener respuesta",
    });
  }

  try {
    const getUserInfo = async (skip) => {
      try {
        const userWareHouse = await clienteAxios.get(
          "/b1s/v1/Users?$select=UserName,UserCode,MobilePhoneNumber&$filter=UserCode" +
          decodeURI(` eq '${user}'`),
          {
            headers: {
              Cookie: `${cookies}`,
            },
          }
        );
        if (userWareHouse.data["@odata.nextLink"]) {
          allBPlaces = [...allBPlaces, ...userWareHouse.data.value];
          getUserInfo(skip + 20);
        } else {
          allBPlaces = [...allBPlaces, ...userWareHouse.data.value];
          res.send(allBPlaces);
        }
      } catch (error) {
        res.send({
          error:
            "No se pudo llevar a cabo la carga de la información del usuario",
        });
      }
    };
    getUserInfo(0);
  } catch (error) {
    const { response } = error;
    if (
      response &&
      response.status === 401 &&
      response.statusText.includes("Unauthorized")
    ) {
      res
        .status(response.status)
        .send({ message: "Unauthorized", error: response.data.error.message });
    } else {
      res.status(response.status).send({
        message: `Ocurrió un error codigo ${response.data.error.code}`,
        error: response.data.error,
      });
    }
  }
};
