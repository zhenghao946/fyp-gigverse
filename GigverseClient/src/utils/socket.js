import { io } from "socket.io-client";
import BASE_URL from "../screens/BASE_URL";

export default socket = io(`${BASE_URL}`, { transports: ['websocket'], upgrade: false })