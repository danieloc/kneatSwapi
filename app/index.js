/**
 * Created by Daniel on 5/10/2017.
 */
const readline = require('readline');
var swapiLib = require('./swapiLib');

//The readline interface is created here. The application does not close until the interface is closed.
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//Application Starts Here
startApplication();

function startApplication() {
    //Readline asks a question, and a callback is passed to the function.
    rl.question('How many MegaLights do you need to travel?(No Decimal Points)', function (distance) {
        var regex=/^[0-9]+$/;
        if(distance.match(regex)) {
            rl.question('Would you like to only see starships with known MGLT values?(y/n)', function (showUnknownMGLT) {
                //The "makeStarshipRequests" takes an array [1,2,3] that cause a fetch for pages 1, 2 and 3 asynchronously from Swapi.co.
                var pagesToRequest = [1, 2, 3];
                //Matching the Regex was found on http://stackoverflow.com/questions/177719/javascript-case-insensitive-search
                swapiLib.makeStarshipRequests(pagesToRequest).then(function (starships) {
                    Promise.all(starships.map(function (starship) {
                        if (showUnknownMGLT.toLowerCase().indexOf('y' || 'yes') != -1||(showUnknownMGLT.toLowerCase().indexOf('n' || 'no') !== -1 && starship.MGLT !== "unknown")) {
                            var numberOfStops = swapiLib.getNumberOfStops(distance, starship.consumables, starship.MGLT);
                            console.log(starship.name + ": " + numberOfStops)
                        }
                    })).then(askToContinue());
                });
            });
        }
        else {
            console.log("Please restart the program and enter the desired distance in MGLT eg. 100000");
            askToContinue();
        }
    })
}

function askToContinue() {
    rl.question('Would you like to continue/restart? (y/n): ', function (answer) {
        if(answer.toLowerCase().indexOf('y' || 'yes') !== -1) {
            console.log("--------------------------");
            console.log("--------------------------");
            console.log("--------------------------");
            console.log("--------------------------");
            startApplication();
        }
        else if(answer.toLowerCase().indexOf('n' || 'no') !== -1) {
            rl.close();
        }
        else {
            console.log("Please enter either yes or no");
            askToContinue();
        }
    })
}