/** @param {NS} ns */

export async function main(ns) {
  // Define excluded servers that should not be visited
    let excludedServers = [
        "home",
        "darkweb"
    ];

    // Define skipped servers that should be ignored temporarily
    let skippedServers = [];

    // Define servers to hack and then exclude from further scanning
    let hackThenExclude = [
        "avmnite-02h",
        "CSEC",
        "I.I.I.I",
        "The-Cave",
        "run4theh111z",
        "w0r1d_d43m0n",
        "."
    ];

    // Define the filename for the hacking script
    const justHack = "justHack.js";

    // Get information about the player
    const info = ns.getPlayer();
    const playerHackLevel = info.skills.hacking;
    const noRamAvailable = [];

    // Initialize variables
    let serverFoundCount = 0;
    const visited = {
        'home': 0
    };
    const queue = ['home'];

    // Start exploring servers using breadth-first search
    while (queue.length > 0) {
        // Get the next server to visit from the queue
        const serverName = queue.shift();
        const depth = visited[serverName];

        // Scan the server for available connections
        const scanRes = ns.scan(serverName);
        scanRes.forEach(server => {
            // If the server has not been visited before, add it to the queue
            if (!visited.hasOwnProperty(server)) {
                visited[server] = depth + 1;
                queue.push(server);
            }
        });

        // Increment the count of visited servers
        serverFoundCount += 1;

        // Check ports on the server and perform hacking
        const { portList, portCount } = await portChecker(ns, serverName);
        await hackServer(
            ns,
            serverName,
            playerHackLevel,
            justHack,
            portList,
            portCount,
            hackThenExclude,
            skippedServers,
            excludedServers,
            noRamAvailable
        );
    }

    // Get the number of servers with no available RAM
    let amountOfServers = noRamAvailable.length;

    // Check if there are servers with no available RAM
    if (amountOfServers > 0) {
        // Commented out code for killing running scripts on servers with no RAM
        /*for (let running in noRamAvailable) {
            if (ns.isRunning(justHack, "home", noRamAvailable[running])) {
                ns.kill(justHack, "home", noRamAvailable[running]);
            }
        }*/

        // Print information about running scripts on servers with no RAM
        ns.tprint("Running scripts now from home, on servers with no RAM but root access");
        ns.tprint(`There is a total of ${amountOfServers} servers meeting that criteria`);

        // Calculate available RAM on the home server
        const homeRamAvailable = ns.getServerMaxRam("home");
        ns.tprint(`There is a total of ${homeRamAvailable}GB RAM on the home server`);

        // Calculate available RAM for each script
        const ramAvailable = Math.floor((homeRamAvailable / amountOfServers) - 10);
        ns.tprint(`There is a total of ${ramAvailable}GB RAM available for each script`);

        // Calculate the RAM required to run each script
        const newScriptRam = ns.getScriptRam(justHack, "home"); //2.4GB
        ns.tprint(`There is ${newScriptRam}GB required to run each script`);

        // Calculate the number of threads (processes) that can run the script
        const newThreads = Math.floor(ramAvailable / newScriptRam);
        ns.tprint(`Each process will have ${newThreads} to run the script`);

        // Run the script on each server with no available RAM
        for (let homeTarget in noRamAvailable) {
            // Run the script and get the process ID (PID)
            let pid = ns.run(justHack, newThreads, noRamAvailable[homeTarget]);
            if (pid > 0) {
                ns.tprint(`Script successfully ran with PID[${pid}] and target was ${noRamAvailable[homeTarget]}`);
            } else {
                ns.tprint(`Something went wrong on home server targeting ${noRamAvailable[homeTarget]}`);
            }
        }
    }

    // Initialize skippedOutput variable to store skipped server information
    let skippedOutput = "Skipped Servers ::: ";

    // Loop through the skippedServers array and concatenate server information to skippedOutput
    for (let value in skippedServers) {
        // Append server name and value to skippedOutput
        skippedOutput += `${value}-`;
        skippedOutput += skippedServers[value];
        skippedOutput += " ";
    }

    // Print the skipped servers and the total number of servers found
    ns.tprint(`${skippedOutput} \nTotal Servers Found = ${serverFoundCount}`);
}//##END MAIN ##//

// Function to exclude a server from further processing
async function exclude(ns, serv, hackThenExclude, excludedServers, skippedServers) {
    // Get the list of purchased servers
    let myServers = ns.getPurchasedServers();

    // Check if the server is already in the player's purchased servers or if it is the home server
    if (myServers.includes(serv) || ns.getHostname(serv) === "home") {
        // Server is already owned or it is the home server, so skip it
        skippedServers.push(serv);
        return;
    }

    // Check if the server is in the hackThenExclude list and the player has root access to it
    if (hackThenExclude.includes(serv) && ns.hasRootAccess(serv)) {
        // Server is in the hackThenExclude list and the player has root access, so exclude it
        let index = hackThenExclude.indexOf(serv);
        if (index !== -1) {
            // Remove the server from hackThenExclude list
            let cut = hackThenExclude.splice(index, 1)[0];
            ns.tprint(`Removing ${cut} from hackThenExclude`);
            excludedServers.push(serv); // Add the server to the excludedServers list
        }
    }

    return;
}


// Function to check the open ports on a server
async function portChecker(ns, serv) {
    // Initialize the portList object with default values
    let portList = {
        "SSH": "false",
        "FTP": "false",
        "SMTP": "false",
        "HTTP": "false",
        "SQL": "false"
    };

    // Initialize the portCount variable to keep track of the number of open ports
    let portCount = 0;

    // Check if the SSH port is closed on the server and if the "BruteSSH.exe" file exists in the home folder
    if (!ns.getServer(serv).sshPortOpen && ns.fileExists("BruteSSH.exe", "home")) {
        // Execute the brutessh program
        ns.brutessh(serv);
        ns.tprint(`bruteSSHProgram Executed`);
        // Set the SSH port status to "true" and increment the portCount
        portList["SSH"] = "true";
        portCount += 1;
    } else if (ns.getServer(serv).sshPortOpen) {
        // The SSH port is open, so set the SSH port status to "true" and increment the portCount
        portList["SSH"] = "true";
        portCount += 1;
    }

    // Repeat the same process for FTP, SMTP, HTTP, and SQL ports
    if (!ns.getServer(serv).ftpPortOpen && ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(serv);
        ns.tprint(`ftpCrackProgram Executed`);
        portList["FTP"] = "true";
        portCount += 1;
    } else if (ns.getServer(serv).ftpPortOpen) {
        portList["FTP"] = "true";
        portCount += 1;
    }

    if (!ns.getServer(serv).smtpPortOpen && ns.fileExists("relaySMTP.exe", "home")) {
        ns.relaysmtp(serv);
        ns.tprint(`relaySMTPProgram Executed`);
        portList["SMTP"] = "true";
        portCount += 1;
    } else if (ns.getServer(serv).smtpPortOpen) {
        portList["SMTP"] = "true";
        portCount += 1;
    }

    if (!ns.getServer(serv).httpPortOpen && ns.fileExists("HTTPWorm.exe", "home")) {
        ns.httpworm(serv);
        ns.tprint(`httpWormProgram Executed`);
        portList["HTTP"] = "true";
        portCount += 1;
    } else if (ns.getServer(serv).httpPortOpen) {
        portList["HTTP"] = "true";
        portCount += 1;
    }

    if (!ns.getServer(serv).sqlPortOpen && ns.fileExists("SQLInject.exe", "home")) {
        ns.sqlinject(serv);
        ns.tprint(`sqlInjectProgram Executed`);
        portList["SQL"] = "true";
        portCount += 1;
    } else if (ns.getServer(serv).sqlPortOpen) {
        portList["SQL"] = "true";
        portCount += 1;
    }

    // Return the portList object and portCount
    return {
        portList,
        portCount
    };
}

// Function to hack a server
const hackServer = async (ns, serv, playerHackLevel, justHack, portList, portCount, hackThenExclude, skippedServers, excludedServers, noRamAvailable) => {

    // Exclude the server based on certain conditions
    exclude(ns, serv, hackThenExclude, excludedServers, skippedServers);

    // Initialize the process ID and thread count
    const pid = 0;
    let myThreads = 0;

    // Check if the server is excluded from hacking
    if (excludedServers.includes(serv)) {
        ns.tprint(`Skipping server ${serv} as it is excluded 197`);
        return;
    }

    // Check if the player's hacking level is sufficient to hack the server
    if (ns.getServerRequiredHackingLevel(serv) <= playerHackLevel) {

        // Calculate the required script RAM and server RAM
        const scriptRam = ns.getScriptRam(justHack);
        const servRam = ns.getServerMaxRam(serv);

        // Remove existing script and transfer a fresh copy to the server
        if (ns.fileExists(justHack, serv) && !ns.isRunning("justHack.js", serv, serv)) {
            ns.rm(justHack, serv);
        }
        ns.scp(justHack, serv, "home");

        // Calculate the number of threads based on available RAM
        if (servRam / scriptRam > 0) {
            myThreads = Math.floor(servRam / scriptRam);
        }
        if (myThreads <= 0 || !isFinite(myThreads)) {
            myThreads = 1;
        }

        // Check if the player has root access to the server
        if (!ns.hasRootAccess(serv)) {

            ns.tprint(`Opened Port Count = ${portCount}`);

            // Check if the required number of ports are cracked to proceed with hacking
            if (ns.getServerNumPortsRequired(serv) <= portCount) {
                let hostname = ns.getHostname(serv);

                // Nuke the server to remove security
                ns.nuke(serv);
                ns.tprint("Server open to Hack!");

                // Execute the hacking script with the specified threads
                pid = ns.exec(justHack, serv, myThreads, serv) > 0 ? ns.tprint("Execution Successful after Breakdown") : ns.tprint("Execution Failed after Breakdown");

                // Remove the server from the skipped servers list
                let index = skippedServers.indexOf(hostname);
                if (index !== -1) {
                    let removedServer = skippedServers.splice(index, 1)[0];
                    ns.tprint(`Removed from Skipped Servers :: ${removedServer}`);
                }
                return;
            } else {
                // Insufficient cracked ports, skip the server
                ns.tprint(`Unable to Hack ${serv} - ${ns.getServerNumPortsRequired(serv)} More ports to be cracked.`);
                for (let key in portList) {
                    ns.tprint(`${key} = ${portList[key]}`);
                }
                if (!skippedServers.includes(serv)) {
                    skippedServers.push(serv);
                }
                return;
            }
        } else if (!servRam > 0) {
            // Insufficient RAM on the server to run scripts
            ns.tprint(`Insufficient Ram on this server ${serv} to run scripts: RAM ${servRam}`);
            ns.tprint(`Money Available to Hack ${ns.getServerMoneyAvailable(serv)}`);

            // Add the server to the list of servers with no available RAM
            if (ns.getServerMoneyAvailable(serv) > 0) {
                noRamAvailable.push(serv);
            }
            return;
        }

                // Check if the hacking script is not already running and the player has root access
        if (!ns.isRunning("justHack.js", serv, serv) && ns.hasRootAccess(serv)) {

            // Check if there is sufficient RAM on the server and the server is not excluded
            if (servRam > 0 && !excludedServers.includes(ns.getHostname(serv))) {

                // Execute the hacking script with the specified threads
                pid = ns.exec(justHack, serv, myThreads, serv);
                pid > 0 ? ns.tprint(`exec Execution Successful PID = ${pid}`) : ns.tprint("Execution Failed");
                return;
            }
        } else {
            ns.tprint(`JustHack.js already running on ${serv}`);
            return;
        }
    } else {
        // Insufficient hacking level, skip the server
        if (!skippedServers.includes(serv)) {
            skippedServers.push(serv);
        }
        ns.tprint(`Skipping server ${serv} due to insufficient hacking level\n${(ns.getServerRequiredHackingLevel(serv)-playerHackLevel)} more Player Levels required`);
        return;
    }
}


