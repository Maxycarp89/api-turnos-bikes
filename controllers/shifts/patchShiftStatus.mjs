import { clienteAxios } from "../../utils/clienteAxios.mjs";

const patchShiftStatus = async (req, res) => {
  


  const cookies = req.header("Authorization");
  const { DocEntry } = req.params;
  const { U_State, U_BPLId, U_StartTime, U_Fecha } = req.body;

  try {
    await clienteAxios.patch(
      `/b1s/v1/TURNOS(${DocEntry})`,
      { U_State: req.body.U_State},
       
      {
        headers: { Cookie: cookies },
      }
    );
    if (U_State === 'Anulado') {
      console.log("U_State..." + U_State)
      const fechaToUpdate = U_Fecha;
      const horarioToUpdate = U_StartTime;
      const BPLId = U_BPLId;

      const admTurnoData = await clienteAxios.get(
        `/b1s/v1/ADMTURNOS?$filter=U_Fecha eq '${fechaToUpdate}' and U_BPLId eq ${BPLId}`,
        {
          headers: {
            Cookie: cookies,
            Prefer: "odata.maxpagesize=0",
            "Content-Type": "application/json",
          },
        }
      );

      const admTurno = admTurnoData.data.value[0];
      let horarios = JSON.parse(admTurno.U_HorarioRecep.replace(/'/g, '"'));

      horarios.forEach((horario) => {
        if (horario.hs === horarioToUpdate) {
          horario.ocupado -= 1;
          if (horario.ocupado < horario.cantrecep)
          horario.habilitad = "S";
        }
      });

      const horarioRecepActualizado = JSON.stringify(horarios);
      console.log("Patch Shift Status OK",horarioRecepActualizado); 
      await clienteAxios.patch(
        `/b1s/v1/ADMTURNOS(${admTurno.DocEntry})`,
        {
          U_Fecha: fechaToUpdate,
          U_HorarioRecep: horarioRecepActualizado,
        },
        {
          headers: {
            Cookie: cookies,
            "Content-Type": "application/json",
          },
        },
        
      );
    }


    return res.status(200).send();
  } catch (error) {
    console.error("Error al actualizar el estado del turno:", error);
    return res.status(400).send(error);
  }
};

export default patchShiftStatus;
