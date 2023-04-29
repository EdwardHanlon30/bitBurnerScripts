export async function main(ns) {

    // Get the target server from command-line arguments or use the current server's hostname
    const target = ns.args[0] || ns.getHostname();
    const securityThresh = ns.getServerMinSecurityLevel(target) + 5;
    const moneyThresh = ns.getServerMaxMoney(target) * 0.75;
    ns.tprint(`Hostname from within justHack.js === ${target}`);

    // Check if the target is defined
    if (target === undefined || typeof target === 'undefined' || target === NaN) {
        ns.tprint("Target not defined");
        return;
    } else {
        ns.tprint(`Target === ${target}`);
    }

    // Continuous loop for hacking
    while (true) {
        // If the server security level is above the threshold, weaken the server
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            await ns.weaken(target);
        }
        // If the available money on the server is below the threshold, grow the server
        else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            await ns.grow(target);
        }
        // Otherwise, hack the server
        else {
            await ns.hack(target);
        }
    }
}
