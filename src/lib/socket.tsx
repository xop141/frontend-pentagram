import { io } from "socket.io-client";
import {API} from '@/utils/api'
const socket = io(API, {
  withCredentials: true,
});

export default socket;
