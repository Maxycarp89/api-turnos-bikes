import { clienteAxios } from "../../utils/clienteAxios.mjs"

const patchShiftList = async (req, res) => {
    const cookies = req.header('Authorization')
    const { body } = req
    console.log(body)
    try {
        for (let i = 0; i < body.length; i++) {
            await clienteAxios.patch(`/b1s/v1/ADMTURNOS(${body[i].DocEntry})`, body[i], {
                headers: { Cookie: cookies }
            })
        }
        return res.status(200).send(body)
    } catch (error) {
        return res.status(400).send(error)
    }
}

export default patchShiftList