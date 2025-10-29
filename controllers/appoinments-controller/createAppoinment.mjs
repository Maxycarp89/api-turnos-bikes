import { clienteAxios } from "../../utils/clienteAxios.mjs";
import nodemailer from "nodemailer";

const createAppoinment = async (req, res) => {
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
    U_customer,
  } = req.body;

  try {
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

    const horarioToCheck = horarios.find(horario => horario.hs === U_StartTime);

    if (horarioToCheck.ocupado >= horarioToCheck.cantrecep) {
      return res.status(400).send({
        error: "El turno solicitado ya no está disponible. Seleccione otro horario u otra fecha",
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
        U_customer,
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
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }

    // Configurar transporte de correo para IceWarp WebClient
    const transporter = nodemailer.createTransport({
      host: 'webmail.yuhmak.com.ar', 
      port: 366, 
      secure: false, 
      tls: {
        rejectUnauthorized: false
      },
      auth: {
        user: 'turnos-services@yuhmak.com.ar',
        pass: 'hda41se@36re-36',
      },
      debug: true
    });

    // Configurar detalles del correo
    const mailOptions = {
      from: 'turnos-services@yuhmak.com.ar',
      to: U_Email.toLowerCase(),
      subject: 'Confirmación de Turno',
      text: `Estimado ${U_custmrName},\n\nSu turno ha sido creado con éxito para el ${formatDate(U_Fecha)} a las ${U_StartTime} en la sucursal ${U_BPLName}.\n\nSaludos,\nYuhmak-Service`
    };

    // Enviar el correo y capturar la respuesta
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error al enviar correo:', error);
        return res.status(400).send({
          error: "Ocurrió un problema al crear el turno y enviar el correo.",
        });
      }
     
      res.status(200).send({ resp: "Turno creado con éxito y correo enviado" });
    });

  } catch (error) {
    console.log(error.message);
    res.status(400).send({
      error: "Ocurrió un problema al crear el turno. Esto puede deberse a que el turno ya se haya creado.",
    });
  }
};

export default createAppoinment;
