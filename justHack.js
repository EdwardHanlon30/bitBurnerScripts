export async function main(ns) {

    const target = ns.args[0] || ns.getHostname();
    ns.tprint(`args[0] = ${ns.args[0]} - ns.getHostname() = ${ns.getHostname()}`);
    const securityThresh = ns.getServerMinSecurityLevel(target) + 5;
    const moneyThresh = ns.getServerMaxMoney(target) * 0.75;
    ns.tprint(`Hostname from within justHack.js === ${target}`);
    if(target === undefined || typeof target === 'undefined' || target === NaN)
    {
        ns.tprint("Target not defined");
        return;
    }
    else{
        ns.tprint(`Target === ${target}`);
    }
    while(true) {
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            await ns.grow(target);
        } else {
            await ns.hack(target);
        }
    }

}