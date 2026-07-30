import axios from 'axios';
import {obtenerToken,tokenExpirado} from '../utils/utils.js'

export const http = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 8000,                                 
  headers: { 'Content-Type': 'application/json' }
});



http.interceptors.request.use(
  (config)=>{

    const token = obtenerToken();

    if (token && !tokenExpirado(token)) {
      config.headers.Authorization=`Bearer ${token}`;
    }

    return config
  },
  (error) => Promise.reject(error)
);