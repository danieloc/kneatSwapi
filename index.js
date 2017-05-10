/**
 * Created by Daniel on 5/10/2017.
 */
const swapi = require('swapi-node');
const readline = require('readline');

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

//Readline asks a question, and a callback is passes to the function.
rl.question('How many MegaLights do you need to travel? ', function (distance) {
    rl.question('Would you like to only see starships with known MGLT values?(y/n)', function (yesOrNo) {
        var yesRegex = 'y'||'yes';
        var noRegex = 'n'|| 'no';
        //Matching the Regex was found on http://stackoverflow.com/questions/177719/javascript-case-insensitive-search
        if (yesOrNo.toLowerCase().indexOf(yesRegex) != -1) {
            makeStarshipRequests(pagesToRequest).then(function (starships) {
                starships.forEach(function (starship, i) {
                    var numberOfStops = getNumberOfStops(distance, starship.consumables, starship.MGLT);
                    console.log("index: " + i + "| Name: " + starship.name + "| Resupplies Required :" + numberOfStops)
                })
            });
        }
        else if(yesOrNo.toLowerCase().indexOf(noRegex) != -1) {
            makeStarshipRequests(pagesToRequest).then(function (starships) {
                starships.forEach(function (starship) {
                    if(starship.MGLT !== "unknown") {
                        var numberOfStops = getNumberOfStops(distance, starship.consumables, starship.MGLT);
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

function getNumberOfStops(distance, consumables, MGLT) {
    if(MGLT === "unknown") {
        return "NO MGLT VALUE";
    } else {
        var tripDuration = distance/parseInt(MGLT);
        var tripDurationBeforeResupply = getAmountOfHoursBeforeResupplies(consumables);
        if( tripDurationBeforeResupply === "N/A") {
            return "CONSUMABLE INFORMATION NOT AVAILABLE";
        } else {
            return parseInt(tripDuration / tripDurationBeforeResupply);
        }
    }

}

function getAmountOfHoursBeforeResupplies(consumables) {
    var year = "year"||"years";
    var month = "month" || "months";
    var week = "week" || "weeks";
    var day = "day" || "days";
    var hour = "hour" || "hours";
    var number = parseInt(consumables.replace ( /[^\d.]/g, '' ));
    if(consumables === "unknown")
        return "N/A";
    if(consumables.includes(hour)) {
        return number;
    }
    else if (consumables.includes(day)){
        return number*24;
    }
    else if (consumables.includes(week)){
        return number*24*7;
    }
    else if (consumables.includes(month)){
        return Math.round(number*24*30.44);
    }
    else if (consumables.includes(year)){
        return Math.round(number*24*365.2422);
    }
    else
        return "ERROR";
}

function makeStarshipRequests(pages) {
    //Return a new promise.
    return new Promise(function (resolve, reject) {
        var starshipList = [];
        var pageFound404 = false;
        return Promise.all(pages.map(function (page) {
            return swapi.get('http://swapi.co/api/starships/?page1=&page='+ page).then(function (starships) {
                starships.results.map(function (starship) {
                    starshipList.push(starship);
                });
            }).catch(function (err) {
                if(err.error = 404) {
                    pageFound404 = true;
                }
                else {
                    console.log("There was an error found that was not expected:");
                    console.log(err);
                    reject(err)
                }
            })
        })).then(function () {
            if(!pageFound404) {
                var newPages = [];
                for(var i =1; i <=pages.length; i++) {
                    newPages.push(pages[pages.length - 1] + i);
                }
                return makeStarshipRequests(newPages).then(function (starships) {
                    Promise.all(starships.map(function (starship) {
                        starshipList.push(starship);
                    }));
                });
            }
        }).then(function () {
            return resolve(starshipList);
        })
    })
}