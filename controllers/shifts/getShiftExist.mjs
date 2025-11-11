import { clienteAxios } from "../../utils/clienteAxios.mjs";
import "dotenv/config";

const getShiftExist = async (req, res) => {
    try {
        // Iniciar sesión
        const loginData = await clienteAxios.post("/b1s/v1/Login", {
            UserName: process.env.NODE_MASTER_USER,
            CompanyDB: process.env.NODE_DATABASE_SAP,
            Password: process.env.NODE_MASTER_PASSWORD,
        });

        const { U_dni, U_Fecha} = req.query;

        if (!U_dni || !U_Fecha) {
            return res.status(400).json({ error: "Datos faltantes" });
        }

        const uriDecode = decodeURI(`U_dni eq '${U_dni}' and U_Fecha eq '${U_Fecha}' and U_State ne 'Anulado'`);

        // Obtener turnos
        const resultShiftExist = await clienteAxios.get(
            `/b1s/v1/TURNOS?$filter=${uriDecode}`,
            {
                headers: {
                    Cookie: loginData.headers["set-cookie"][0],
                    Prefer: "odata.maxpagesize=0",
                },
            }
        );

        const data = resultShiftExist.data.value;
        

        if (data.length === 0) {
            return res.status(200).json({ exists: false, message: "No se encontraron turnos cargados por el cliente para esa fecha" });
        }

        res.status(200).json({ exists: true, data: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

export default getShiftExist;
