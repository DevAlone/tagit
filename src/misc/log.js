const appName = "tagit";

export function debug(...args) { output("debug", ...args); }
export function info(...args) { output("info", ...args); }
export function warning(...args) { output("warning", ...args); }
export function error(...args) { output("error", ...args); }

function output(level, ...args) {
    console.log(appName + ": [" + level + "] ", ...args);
}