import Simulation from "@core/Simulation";
import "../styles/client.css";

export default class Client
{
    constructor()
    {
        const simulation = new Simulation();  // just testing
        const url = "ws://127.0.0.1:9001";  // TODO: use wss://
        const ws = new WebSocket(url);
        ws.onopen = () => {
            console.log("Connected.");
        };

        ws.onclose = () => {
            console.log("Disconnected");
        };

        ws.onmessage = event => {
            console.log("Received message:", event.data);
            ws.send("Thanks");
        };
    }
}

// entry point
// tslint:disable-next-line: no-unused-expression
new Client();

if (module.hot) {
    module.hot.accept();
}