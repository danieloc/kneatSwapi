/**
 * Created by Daniel on 10/05/2017.
 */
const swapi = require('swapi-node');
module.exports = {
    getNumberOfStops: function (distance, consumables, MGLT) {
        if (MGLT === "unknown") {
            return "MGLT N/A";
        } else {
            var tripDuration = distance / parseInt(MGLT);
            var tripDurationBetweenResupplies = this.hoursBetweenResupplies(consumables);
            if (tripDurationBetweenResupplies === "N/A") {
                return "CONSUMABLE INFORMATION NOT AVAILABLE";
            } else {
                return parseInt(tripDuration / tripDurationBetweenResupplies);
            }
        }
    },

    hoursBetweenResupplies: function hoursBetweenResupplies(consumables) {
        var year = "year" || "years";
        var month = "month" || "months";
        var week = "week" || "weeks";
        var day = "day" || "days";
        var hour = "hour" || "hours";
        var number = parseInt(consumables.replace(/[^\d.]/g, ''));
        if (consumables === "unknown")
            return "N/A";
        if (consumables.includes(hour)) {
            return number;
        }
        else if (consumables.includes(day)) {
            return number * 24;
        }
        else if (consumables.includes(week)) {
            return number * 24 * 7;
        }
        else if (consumables.includes(month)) {
            return Math.round(number * 24 * 30.44);
        }
        else if (consumables.includes(year)) {
            return Math.round(number * 24 * 365.2422);
        }
        else
            return "ERROR";
    },


    /*
     As Swapi does not return all pages at once, I wanted to create a more performant way of making requests to the API.
     Before - I created a function that acted asynchronously - requesting page 1, then 2 then 3 and checking if each of them had a "next" function.
     |-----------|                                               (Returns Page 1) - Next Function
                 |-----------|                                   (Returns Page 2) - Next Function
                              |-------------|                    (Returns Page 3) - Next Function
                                             |-------------|     (Returns Page 4) - No Next Function
     I decided to make the requests in 3s. So that the requests would happen faster, and asynchronously
     |-----------|                                               (Returns Page 1)
     |-----------|                                               (Returns Page 2)
     |-----------|                                               (Returns Page 3) - Has no 404 returned so requests pages 4,5 and 6
                 |----------|                                    (Returns Page 4)
                 |----------X                                    (Returns 404)
                 |----------X                                    (Returns 404)    - Since a 404 has been returned, the application stops making requests.

     If the pagesToRequest array was made to be 2 in length eg. [1,2], then the requests would be made in 2s instead of 3s.
     */
    makeStarshipRequests: function makeStarshipRequests(pages) {
        //Return a new promise.
        return new Promise(function (resolve, reject) {
            var starshipList = [];
            var pageFound404 = false;
            return Promise.all(pages.map(function (page) {
                return swapi.get('http://swapi.co/api/starships/?page1=&page=' + page).then(function (starships) {
                    starships.results.map(function (starship) {
                        starshipList.push(starship);
                    });
                }).catch(function (err) {
                    if (err.error = 404) {
                        pageFound404 = true;
                    }
                    else {
                        console.log("There was an error found that was not expected:");
                        console.log(err);
                        reject(err)
                    }
                })
            })).then(function () {
                if (!pageFound404) {
                    var newPages = [];
                    for (var i = 1; i <= pages.length; i++) {
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
};