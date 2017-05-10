/**
 * Created by Daniel on 5/10/2017.
 */
const readline = require('readline');
var swapiLib = require('./swapiLib');

/*
As Swapi does not return all pages at once, I wanted to create a more performant way of making requests to the API.
Before - I created a function that acted asynchronously - requesting page 1, then 2 then 3 and checking if each of them had a "next" function.
|-----------|                                               (Returns Page 1) - Next Function
            |-----------|                                   (Returns Page 2) - Next Function
                        |-------------|                     (Returns Page 3) - Next Function
                                        |-------------|     (Returns Page 4) - No Next Function
I decided to make the requests in 3s. So that the requests would happen faster, and asynchronously
|-----------|                                               (Returns Page 1)
|-----------|                                               (Returns Page 2)
|-----------|                                               (Returns Page 3) - Has no 404 returned so requests pages 4,5 and 6
            |----------|                                    (Returns Page 4)
            |----------X                                    (Returns 404)
            |----------X                                    (Returns 404)    - Since a 404 has been returned, the application stops making requests.

If the pagesToRequest array(below) was made to be 2 in length- [1,2], then the requests would be made in 2s instead of 3s.
*/
var pagesToRequest = [1,2,3];

//The readline interface is created here. The application does not close until the interface is closed.
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//Readline asks a question, and a callback is passed to the function.
rl.question('How many MegaLights do you need to travel? ', function (distance) {
    rl.question('Would you like to only see starships with known MGLT values?(y/n)', function (yesOrNo) {
        var yesRegex = 'y'||'yes';
        var noRegex = 'n'|| 'no';
        //Matching the Regex was found on http://stackoverflow.com/questions/177719/javascript-case-insensitive-search
        if (yesOrNo.toLowerCase().indexOf(yesRegex) != -1) {
            swapiLib.makeStarshipRequests(pagesToRequest).then(function (starships) {
                console.log(starships);
                starships.forEach(function (starship, i) {
                    var numberOfStops = swapiLib.getNumberOfStops(distance, starship.consumables, starship.MGLT);
                    console.log("index: " + i + "| Name: " + starship.name + "| Resupplies Required :" + numberOfStops)
                })
            });
        }
        else if(yesOrNo.toLowerCase().indexOf(noRegex) != -1) {
            swapiLib.makeStarshipRequests(pagesToRequest).then(function (starships) {
                starships.forEach(function (starship) {
                    if(starship.MGLT !== "unknown") {
                        var numberOfStops = swapiLib.getNumberOfStops(distance, starship.consumables, starship.MGLT);
                        console.log("Name: " + starship.name + "| Resupplies Required :" + numberOfStops)
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