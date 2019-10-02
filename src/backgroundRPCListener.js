import * as rpc from "./misc/rpc";
import * as log from "./misc/log";

log.debug("backgroundRPCListener.js");

(async () => {
    await rpc.listenFromBackgroundScript();
})();
