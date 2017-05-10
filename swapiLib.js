/**
 * Created by Daniel on 10/05/2017.
 */
const swapi = require('swapi-node');
module.exports = {
    getNumberOfStops: function (distance, consumables, MGLT) {
        if (MGLT === "unknown") {
            return "NO MGLT VALUE";
        } else {
            var tripDuration = distance / parseInt(MGLT);
            var tripDurationBeforeResupply = this.getAmountOfHoursBeforeResupplies(consumables);
            if (tripDurationBeforeResupply === "N/A") {
                return "CONSUMABLE INFORMATION NOT AVAILABLE";
            } else {
                return parseInt(tripDuration / tripDurationBeforeResupply);
            }
        }
    },

    getAmountOfHoursBeforeResupplies: function getAmountOfHoursBeforeResupplies(consumables) {
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