import { io } from "socket.io-client";

const socket = io("https://qkart-server-fkju.onrender.com", {
    autoConnect: false,
});

export default socket;