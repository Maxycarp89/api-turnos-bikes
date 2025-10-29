import { clienteAxios } from "../../utils/clienteAxios.mjs"

const createShiftList = async (req, res) => {
    const cookies = req.header('Authorization')
    const { body } = req
    console.log(body)
    try {
        let created = []
        for (let i = 0; i < body.length; i++) {
            const { data } = await clienteAxios.post('/b1s/v1/ADMTURNOS', body[i], {
                headers: { Cookie: cookies }
            })
            created = [...created, data]
        }
        const createdMaped = created.map((e) => {
            return {
                ...e,
                U_HorarioRecep: JSON.parse(e.U_HorarioRecep)
            }
        })
        console.log(createdMaped.U_HorarioRecep)
        return res.status(200).send(createdMaped)
    } catch (error) {
        return res.status(400).send(error)
    }
}

export default createShiftList