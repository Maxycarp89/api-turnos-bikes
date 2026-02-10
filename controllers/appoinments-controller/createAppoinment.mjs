import { clienteAxios } from "../../utils/clienteAxios.mjs";
import nodemailer from "nodemailer";
import getBussinessPartner from "../core/bussines-partner.controller/getBussinessPartner.mjs";
import createClient from "../core/bussines-partner.controller/CreateClient.mjs";

const createAppoinment = async (req, res) => {
  // Login SAP
  const loginData = await clienteAxios.post("/b1s/v1/Login", {
    UserName: process.env.NODE_MASTER_USER,
    CompanyDB: process.env.NODE_DATABASE_SAP,
    Password: process.env.NODE_MASTER_PASSWORD,
  });

  const {
    U_custmrName,
    U_Telephone,
    U_city,
    U_Chasis,
    U_Motor,
    U_Street,
    U_descrption,
    U_StartTime,
    U_itemCode,
    U_BPLId,
    U_Fecha,
    U_State,
    U_problemTyp,
    U_Email,
    U_dni,
    U_BPLName,
    U_internalSN,
    U_ProSubType,
    U_TipoOrigen,
    ZipCode,
  } = req.body;

  let CardCode = null;
  try {  
    let clienteEncontrado = null;
    try {
      const { data } = await clienteAxios.get(
        `/b1s/v1/BusinessPartners?$select=FederalTaxID,CardCode,CardName,Address,FederalTaxID,Cellular,City,Country,EmailAddress&$filter=contains(FederalTaxID, '${U_dni}')`,
        {
          headers: {
            Cookie: loginData.headers["set-cookie"][0],
          },
        }
      );
      if (data.value && data.value.length > 0) {
        clienteEncontrado = data.value[0];
        CardCode = clienteEncontrado.CardCode;
      }
    } catch (e) {
      console.log("Error al buscar cliente:", e);
    }


    // Si no se encontró, crear cliente
    if (!CardCode) {
      try {
        const createResp = await clienteAxios.post(
          `/b1s/v1/BusinessPartners`,
          {
            CardName: U_custmrName,
            FederalTaxID: U_dni,
            Cellular: U_Telephone,
            Address: U_Street,
            EmailAddress: U_Email,
            Series: 146,
            County:null,
            City: U_city,
            U_B1SYS_VATCtg: "CF",
            ZipCode: ZipCode,
            U_B1SYS_FiscIdType: "96",
          },
          {
            headers: {
              Cookie: loginData.headers["set-cookie"][0],
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Respuesta de creación de cliente:", createResp.data, createResp.status);
        if (createResp.status === 201) {
          const { data } = await clienteAxios.get(
            `/b1s/v1/BusinessPartners?$select=FederalTaxID,CardCode&$filter=contains(FederalTaxID, '${U_dni}')`,
            {
              headers: {
                Cookie: loginData.headers["set-cookie"][0],
              },
            }
          );
          if (data.value && data.value.length > 0) {
            CardCode = data.value[0].CardCode;
            console.log("CardCode encontrado tras crear cliente:", CardCode);
          }
        }
        if (!CardCode) {
          console.error("No se pudo obtener el CardCode tras crear el cliente. Respuesta:", createResp.data, createResp.headers);
        }
      } catch (e) {
        console.error("Error al crear cliente-->", e);
        return res.status(400).send({ error: "No se pudo crear el cliente automáticamente.", detalle: e?.response?.data || e.message });
      }
    }

    if (!CardCode) {
      return res
        .status(400)
        .send({ error: "No se pudo obtener el código de cliente (CardCode)." });
    }

    // Consulta previa para verificar disponibilidad
    const admTurnoData = await clienteAxios.get(
      `/b1s/v1/ADMTURNOS?$filter=U_Fecha eq '${U_Fecha}' and U_BPLId eq ${U_BPLId}`,
      {
        headers: {
          Cookie: loginData.headers["set-cookie"][0],
          Prefer: "odata.maxpagesize=0",
          "Content-Type": "application/json",
        },
      }
    );

    const admTurno = admTurnoData.data.value[0];
    let horarios = JSON.parse(admTurno.U_HorarioRecep.replace(/'/g, '"'));

    const horarioToCheck = horarios.find(
      (horario) => horario.hs === U_StartTime
    );

    if (horarioToCheck.ocupado >= horarioToCheck.cantrecep) {
      return res.status(400).send({
        error:
          "El turno solicitado ya no está disponible. Seleccione otro horario u otra fecha",
      });
    }

    // Crear turno en /TURNOS
    await clienteAxios.post(
      `/b1s/v1/TURNOS`,
      {
        U_Fecha,
        U_custmrName,
        U_Telephone,
        U_city,
        U_Chasis,
        U_Motor,
        U_Street,
        U_descrption,
        U_StartTime,
        U_itemCode,
        U_BPLId,
        U_State,
        U_problemTyp,
        U_Email,
        U_dni,
        U_BPLName,
        U_internalSN,
        U_customer: CardCode,
        U_ProSubType,
        U_TipoOrigen,
      },
      {
        headers: {
          Cookie: loginData.headers["set-cookie"][0],
          Prefer: "odata.maxpagesize=0",
          "Content-Type": "application/json",
        },
      }
    );

    // Actualizar en /ADMTURNOS
    horarioToCheck.ocupado += 1;
    if (horarioToCheck.ocupado >= horarioToCheck.cantrecep) {
      horarioToCheck.habilitad = "N";
    }

    const horarioRecepActualizado = JSON.stringify(horarios);

    await clienteAxios.patch(
      `/b1s/v1/ADMTURNOS(${admTurno.DocEntry})`,
      {
        U_Fecha: U_Fecha,
        U_HorarioRecep: horarioRecepActualizado,
      },
      {
        headers: {
          Cookie: loginData.headers["set-cookie"][0],
          "Content-Type": "application/json",
        },
      }
    );

    function formatDate(dateString) {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    }

    // Función para crear transporter con credenciales específicas
    const createTransporter = (user, pass) => {
      return nodemailer.createTransport({
        host: "webmail.yuhmak.com.ar",
        port: 366,
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
        auth: {
          user,
          pass,
        },
        debug: true,
      });
    };

    // Función para crear opciones de correo
    const createMailOptions = (fromEmail) => ({
      from: fromEmail,
      to: U_Email.toLowerCase(),
      subject: "Confirmación de Turno",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="cid:yuhmakLogo" style="width: 200px; margin-bottom: 20px;"/>
          <p>Estimado ${U_custmrName},</p>
          <p>Su turno ha sido creado con éxito para el ${formatDate(
            U_Fecha
          )} a las ${U_StartTime} en la sucursal ${U_BPLName}.</p>
          <p>Saludos,<br>Yuhmak-Service</p>
        </div>
      `,
      attachments: [
        {
          filename: "logo.png",
          path: "./utils/logo.png",
          cid: "yuhmakLogo",
        },
      ],
    });

    // Función para enviar correo con promesa
    const sendMailAsync = (transporter, mailOptions) => {
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) reject(error);
          else resolve(info);
        });
      });
    };

    // Intentar enviar con la primera casilla
    try {
      const transporter1 = createTransporter(
        process.env.NODE_USER_MAILING,
        process.env.NODE_PASSWORD_MAILING
      );
      const mailOptions1 = createMailOptions(process.env.NODE_USER_MAILING);
      await sendMailAsync(transporter1, mailOptions1);
      res.status(200).send({ resp: "Turno creado con éxito y correo enviado" });
    } catch (error1) {
      console.log("Error al enviar correo con casilla principal:", error1);
      
      // Intentar con la segunda casilla (fallback)
      try {
        const transporter2 = createTransporter(
          process.env.NODE_USER_MAILING_BIKES,
          process.env.NODE_PASSWORD_MAILING_BIKES
        );
        const mailOptions2 = createMailOptions(process.env.NODE_USER_MAILING_BIKES);
        await sendMailAsync(transporter2, mailOptions2);
        console.log("Correo enviado exitosamente con casilla de respaldo");
        res.status(200).send({ resp: "Turno creado con éxito y correo enviado" });
      } catch (error2) {
        console.log("Error al enviar correo con casilla de respaldo:", error2);
        return res.status(400).send({
          error: "El turno fue creado pero hubo un error al enviar el correo electrónico.",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).send({
      error:
        "Ocurrió un problema al crear el turno. Esto puede deberse a que el turno ya se haya creado.",
    });
  }
};

export default createAppoinment;
