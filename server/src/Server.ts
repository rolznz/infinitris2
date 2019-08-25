import Simulation from "@core/Simulation";
import * as WebSocket from "ws";

const simulation = new Simulation();

const wss = new WebSocket.Server({ host: "127.0.0.1", port: 9001 });

wss.on("connection", function connection(ws) {
    console.log("New connection");

    ws.on("close", () => {
       console.log("Connection closed");
    });
    ws.on("message", function incoming(message) {
        console.log("received: %s", message);
    });

    ws.send("Welcome to Infinitris 2");
});