import axios from "axios";
import "dotenv/config";

export const clienteAxios = axios.create({
  baseURL: process.env.BASE_SAP_API,
})