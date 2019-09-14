import Client from "./Client";
import SinglePlayerClient from "./SinglePlayerClient";

// entry point
(() => {
    if (window.location.href.indexOf("single-player=true") >= 0)
    {
        // tslint:disable-next-line: no-unused-expression
        new SinglePlayerClient();
    }
    else
    {
        const url = "ws://127.0.0.1:9001";  // TODO: use wss://
        // tslint:disable-next-line: no-unused-expression
        new Client(url);
    }
})();

if (module.hot) {
    module.hot.accept();
}