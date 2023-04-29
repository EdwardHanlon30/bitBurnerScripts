# bitBurnerScripts
Scripts created for bitBurner game available on steam.
The onBoot.js script requires to also have the justHack.js script available on the home server.
The onBoot.js file always runs from the home server.
It will copy the justHack.js file to the target server if a hack is possible

Some servers that are found have 0 RAM but plenty of money - these servers need to be hacked by running the justHack script from home.
These servers are stored in an array called noRamAvailable.

At the bottom of main you will find the following.

        // Commented out code for killing running scripts on home targeting servers with no RAM
        /*for (let running in noRamAvailable) {
            if (ns.isRunning(justHack, "home", noRamAvailable[running])) {
                ns.kill(justHack, "home", noRamAvailable[running]);
            }
        }*/
        
This is commented out, because you dont want to always kill them scripts when running this onBoot.js script.
But this is important code that needs to be ran every now and again, for the following reason.
        
        // Calculate available RAM on the home server
        const homeRamAvailable = ns.getServerMaxRam("home");

        // Calculate the RAM required to run each script
        const newScriptRam = ns.getScriptRam(justHack, "home"); //2.4GB
        
        // Get the number of servers with no available RAM
        const amountOfServers = noRamAvailable.length;
        
        // Calculate available RAM for each script (-10 to keep some RAM for home server)
        const ramAvailable = Math.floor((homeRamAvailable / amountOfServers) - 10);

        // Calculate the number of threads (processes) that can run the script
        const newThreads = Math.floor(ramAvailable / newScriptRam);
        
        
Reason: 
At some point you will find servers with no RAM and they will be pushed to the array.

Using the calculations above, the amount of threads available to each script will be calculated.

Then the script justHack.js will be ran on home, targeting the servers, and the threads calculated will be passed as a parameter.

If your hack level increases and you run the Onboot,js script again, if no new servers are added to noRamAvailable array 
you will just get the following output

  // ns.tprint(`Something went wrong on home server targeting ${noRamAvailable[homeTarget]} or the script is already running`);

I will change this to do a ns.isRunning() before trying to run the script.

But, if new servers are added you will need to kill the running scripts on home, this is so the threads can be calculated again evenly with the extra server added.

Files could do with some more comments etc 

Any suggestions welcome to improve the functionality
