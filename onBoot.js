/** @param {NS} ns */

export async function main(ns) {

    let excludedServers = [
      "home",
      "darkweb"
    ];
    let skippedServers = [
      "home",
      "avmnite-02h",
      "CSEC",
      "I.I.I.I",
      "The-Cave",
      "run4theh111z",
      "w0r1d_d43m0n",
      ".",
      "darkweb"
    ];

    let hackThenExclude = [
      "avmnite-02h",
      "CSEC",
      "I.I.I.I",
      "The-Cave",
      "run4theh111z",
      "w0r1d_d43m0n",
      "."
    ];
    const justHack = "justHack.js";
    const info = ns.getPlayer();
    const playerHackLevel = info.skills.hacking;
    let myThreads = 0;
    const noRamAvailable = [];
    
    async function exclude (serv, hackThenExclude)
    {
      if(hackThenExclude.includes(serv) && ns.hasRootAccess(serv))
      {
        
        let index = hackThenExclude.indexOf(serv);
        if (index !== -1)
        {        
          let cut = hackThenExclude.splice(index,1)[0];
          ns.tprint(`Removing ${cut} from hackThenExclude`);
          excludedServers.push(serv);
        }
      }
      return;
    }

    async function portChecker(serv)
    {
      let portList = {
        "SSH" : "false",
        "FTP" : "false",
        "SMTP" : "false",
        "HTTP" : "false",
        "SQL" : "false"
      }
      let portCount =0;

      if(!ns.getServer(serv).sshPortOpen && ns.fileExists("BruteSSH.exe", "home"))
      {
        ns.brutessh(serv);
        ns.tprint(`bruteSSHProgram Executed`);
        portList["SSH"] = "true";
        portCount+=1;
      }else if(ns.getServer(serv).sshPortOpen){portList["SSH"] = "true";portCount+=1;}
      if(!ns.getServer(serv).ftpPortOpen && ns.fileExists("FTPCrack.exe", "home"))
      {
        ns.ftpcrack(serv);
        ns.tprint(`ftpCrackProgram Executed`);
        portList["FTP"] = "true";
        portCount+=1;
      }else if(ns.getServer(serv).ftpPortOpen){portList["FTP"] = "true";portCount+=1;;}
      if(!ns.getServer(serv).smtpPortOpen && ns.fileExists("relaySMTP.exe", "home"))
      {
        ns.relaysmtp(serv);
        ns.tprint(`relaySMTPProgram Executed`);
        portList["SMTP"] = "true";
        portCount+=1;
      }else if(ns.getServer(serv).smtpPortOpen){portList["SMTP"] = "true";portCount+=1;;}
      if(!ns.getServer(serv).httpPortOpen && ns.fileExists("HTTPWorm.exe", "home"))
      {
        ns.httpworm(serv);
        ns.tprint(`httpWormProgram Executed`);
        portList["HTTP"] = "true";
        portCount+=1;
      }else if(ns.getServer(serv).httpPortOpen){portList["HTTP"] = "true";portCount+=1;;}
      if(!ns.getServer(serv).sqlPortOpen && ns.fileExists("SQLInject.exe", "home"))
      {
        ns.sqlinject(serv);
        ns.tprint(`sqlInjectProgram Executed`);
        portList["SQL"] = "true";
        portCount+=1;
      }else if(ns.getServer(serv).sqlPortOpen){portList["SQL"] = "true";portCount+=1;}
      return { portList, portCount };
    }
  
    const hackServer = async (serv, skippedServers, hackThenExclude) => {
      exclude(serv, hackThenExclude);

      let pid = 0;
      if (excludedServers.includes(serv)) {
        ns.tprint(`Skipping server ${serv} as it is excluded`);
        return;
      }
      if (ns.getServerRequiredHackingLevel(serv) <= playerHackLevel) 
      {

        const scriptRam = ns.getScriptRam(justHack);
        if (ns.fileExists(justHack, serv) && !ns.isRunning("justHack.js",serv,serv) ) ns.rm(justHack, serv);
        ns.scp(justHack, serv, "home");
        const servRam = ns.getServerMaxRam(serv);
        if (servRam / scriptRam > 0) myThreads = Math.floor(servRam / scriptRam);
        if(myThreads <= 0 || !isFinite(myThreads)) myThreads = 1;
        ns.tprint(`Root Access ${serv} == ${ns.hasRootAccess(serv)}`);
        if (!ns.hasRootAccess(serv)) 
        {

          const { portList2, portCount } = await portChecker(serv);
          ns.tprint(`portCount = ${portCount}`);
          if( ns.getServerNumPortsRequired(serv) <= portCount && !excludedServers.includes(serv))
          {
            let hostname = ns.getHostname(serv);
            ns.nuke(serv)
            ns.tprint("Server open to Hack!");
            pid = ns.exec(justHack, serv, myThreads, serv) > 0 ? ns.tprint("Execution Successful after Breakdown") : ns.tprint("Execution Failed after Breakdown");
            let index = skippedServers.indexOf(hostname);
            if (index !== -1)
            {
              let removedServer = skippedServers.splice(index,1)[0];
              ns.tprint(`Removed from Skipped Servers :: ${removedServer}`);
            }
            return;
          }
          else
          {
            ns.tprint(`Unable to Hack ${serv} - ${ns.getServerNumPortsRequired(serv)} More ports to be cracked.`);
            for(let key in portList2)
            {
              ns.tprint(`${key} = ${portList2[key]}`);
            }
            //ns.tprint(ns.getServer(serv));
            if(!skippedServers.includes(serv)) skippedServers.push(serv);
            return;
          }
        }
        else if(!servRam > 0)
        {
            ns.tprint(`Insufficient Ram on this server ${serv} to run scripts: RAM ${servRam}`);
            ns.tprint(`Money Available to Hack ${ns.getServerMoneyAvailable(serv)}`);
            noRamAvailable.push(serv);
            return;
        }
        else if(!ns.isRunning("justHack.js",serv,serv) && ns.hasRootAccess(serv) && servRam > 0)
        {
            pid = ns.exec(justHack, serv, myThreads, serv);
            pid > 0 ? ns.tprint(`exec Execution Successful PID = ${pid}`) : ns.tprint("Execution Failed");
        }
        else
        {
            ns.tprint(`JustHack.js already running on ${serv}`);
            return;
        }
      } 
      else 
      {
        if(!skippedServers.includes(serv)) skippedServers.push(serv);
        ns.tprint(`Skipping server ${serv} due to insufficient hacking level\nServer Level ${ns.getServerRequiredHackingLevel(serv)} -v- Player Level ${playerHackLevel}`);
      }
    }
    let serverFoundCount = 0;
    const visited = {'home': 0};
    const queue = ['home'];
    while (queue.length > 0) {
      const serverName = queue.shift();
      const depth = visited[serverName];
      const scanRes = ns.scan(serverName);
      scanRes.forEach(server => {
        if (!visited.hasOwnProperty(server)) {
          visited[server] = depth + 1;
          queue.push(server);
        }
      });
      serverFoundCount+=1;
      await hackServer(serverName, skippedServers, hackThenExclude);
    }

    
    const amountOfServers = noRamAvailable.length;
    if(amountOfServers > 0)
    {
      for(let running in noRamAvailable)
      {
        if(ns.isRunning(justHack,"home",noRamAvailable[running]))
        {
          ns.kill(justHack,"home",noRamAvailable[running]);
        }
      }
      ns.tprint("Running scripts now from home, on servers with no RAM but root access");
      ns.tprint(`There is a total of ${amountOfServers} Servers metting that criteria`);
      const homeRamAvailable = ns.getServerMaxRam("home");
      ns.tprint(`There is a total of ${homeRamAvailable}GB RAM on the home server`);
      const ramAvailable = Math.floor((homeRamAvailable/amountOfServers)-4);
      ns.tprint(`There is a total of ${ramAvailable}GB RAM available for each script`);
      const newScriptRam = ns.getScriptRam(justHack, "home");//2.4Gb
      ns.tprint(`There is ${newScriptRam}GB Required to run each script`); 
      const newThreads = Math.floor(ramAvailable / newScriptRam); //3
      ns.tprint(`Each process will have ${newThreads} to run the script`); 
      //const itteration = Math.floor(homeRamAvailable /ramAvaulable)
      for (let homeTarget in noRamAvailable)
      {
          let pid = ns.run(justHack, newThreads, noRamAvailable[homeTarget]);
          if(pid > 0) 
          {
            ns.tprint(`Script successfull ran with PID[${pid}] and target was ${noRamAvailable[homeTarget]}`);
          }
          else{
            ns.tprint(`Something went wrong on home server targeting ${noRamAvailable[homeTarget]}`);
          }
      }
    }

    let skippedOutput ="Skipped Servers ::: " 
    for(let value in skippedServers)
    {
      skippedOutput += `${value}-`;
      skippedOutput += skippedServers[value];
      skippedOutput += " ";
      //ns.tprint(`${skippedServers[value]}`);
    }
 
    ns.tprint(`${skippedOutput} \nTotal Servers Found = ${serverFoundCount}`);

    /*for (const [key, value] of Object.entries(visited)) {
      ns.tprint(`Key: ${key}, Value: ${value}`);
    }*/
  }
  