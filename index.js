/**
 * Created by Daniel on 5/10/2017.
 */
const swapi = require('swapi-node');

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

makeStarshipRequests(pagesToRequest).then(function (starships) {
    starships.forEach(function (starship, i ) {
        console.log(i + ":" + starship.name);
    })
});

function makeStarshipRequests(pages) {
    //Return a new promise.
    console.log("Starting requests for Starships");
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
                console.log("Starting new Promise");
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