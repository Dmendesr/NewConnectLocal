import axios from "axios";

export const api = axios.create({
    baseURL: "https://connectlocalapi20240531151731.azurewebsites.net/api"
    
})