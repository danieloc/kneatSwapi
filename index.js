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

//Readline asks a question, and a callback is passed to the function.
rl.question('How many MegaLights do you need to travel? ', function (distance) {
    rl.question('Would you like to only see starships with known MGLT values?(y/n)', function (yesOrNo) {
        //The "makeStarshipRequests" takes an array [1,2,3] that cause a fetch for pages 1 2 and 3 asynchronously from Swapi.co.
        var pagesToRequest = [1,2,3];
        //Matching the Regex was found on http://stackoverflow.com/questions/177719/javascript-case-insensitive-search
        if (yesOrNo.toLowerCase().indexOf('y'||'yes') != -1) {
            swapiLib.makeStarshipRequests(pagesToRequest).then(function (starships) {
                starships.forEach(function (starship) {
                    var numberOfStops = swapiLib.getNumberOfStops(distance, starship.consumables, starship.MGLT);
                    console.log(starship.name + ": " + numberOfStops)
                })
            });
        }
        else if(yesOrNo.toLowerCase().indexOf('n'|| 'no') != -1) {
            swapiLib.makeStarshipRequests(pagesToRequest).then(function (starships) {
                starships.forEach(function (starship) {
                    if(starship.MGLT !== "unknown") {
                        var numberOfStops = swapiLib.getNumberOfStops(distance, starship.consumables, starship.MGLT);
                        console.log(starship.name + ": " + numberOfStops)
                    }
                })
            });
        }
        else {
            console.log("You should have entered either Y or N")
        }
        rl.close();
    });

});