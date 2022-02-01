$(document).ready(function () {
    var searchHistory = [];
    // Moment.js was used for Today's Date and time:
    const momentDay = moment().format('dddd, MMMM Do');
    $('.todayDate').prepend(momentDay);

    //Moment.js was used for 5-day forcasts:
    for (var i = 1; i < 6; i++) {
        $(`#${i}Date`).text(moment().add(i, 'd').format('dddd, MMMM Do'));
    }
    /* Explanation of the code above: Starting at day 1, add 1 more day to today's date until 5 days are displayed for the 5-day forecast. */

    //Buttons Functions and Event Listeners:

    // Submit event on search form
    $('form').on('submit', function (event) {
        event.preventDefault();
        let city = $('input').val();
        if (city === '') {
            return;
        }

        call(); //Runs the function to call the API and display the retrieved data;

        
        $('form')[0].reset();// This clears the search field and resets the form
    });

    /*Explanation of code above:
    When an event (entering a city name) is entered and submitted on the form, 
        the form collects the value from the search field, 
        then calls on the weather app API to display the retrieved data then clears and resets the form.  
    */

    // Click event for search history buttons
    $('.searchHistoryEl').on('click', '.historyBtn', function (event) {
        event.preventDefault();
        // Collects the value from the button text
        let btnCityName = $(this).text();
        // Runs the function to call the API and display retrieved data
        call(btnCityName);
    });
    /* Explanation of Code above:
    When the name of a city is entered in the Search Button and is clicked to be searched: 
        It collects the value from the button text and 
        Then runs the function to call the API and display the data for the searched city. 
    */

    //Clear History Button:
    $('#clearBtn').on('click', function (event) {
        event.preventDefault();
        window.localStorage.clear();
        $('.searchHistoryEl').empty();
        searchHistory = [];
        renderButtons();
        $('form')[0].reset();
    });

    /*When Clear history button is clicked:
    It clears the local storage,
    Then it clears the search history elements,
    And then it clears and resets the form. 
    */

    //Buttons used to create and display for each searched city. City is stored on local storage for persistent recall.    
    const renderButtons = () => {
        $('.searchHistoryEl').html('');
        for (var j = 0; j < searchHistory.length; j++) {
            let cityName1 = searchHistory[j];
            let historyBtn = $(
                '<button type="button" class="btn btn-primary btn-lg btn-block historyBtn">'
            ).text(cityName1);
            $('.searchHistoryEl').prepend(historyBtn);
        }
    };
    /* Explanation of code above: To create and display buttons for Searched Cities:
    first the search field div is replaced in the html as an empty string,
    then "For each" item in the search history array, store the searched city and create a button with searched city displayed.
    Then add it in front of (Prepend) the buttons to the search history div.
    Note: since "i" was used earlier in the code, therefore "j" is used for this variable.
    */


    
    //Contents of the search bar are SET to localstorage on submit
    const storeCities = () =>
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    //Explanation of line of code above: When the contents of the search bar is entered, it is SET to localStorage as a JSON string object under searchHistory to be parsed in the future. 


    // Pulls localStorage into searchHistory array
    const init = () => {
        let storedCities = JSON.parse(localStorage.getItem('searchHistory'));
        // 
        if (storedCities !== null) {
            searchHistory = storedCities;
        }
        renderButtons();
    };

    init();

    /* Explanation of Code above:
    The Searched cities are stored in localStorage as a string.
    Then to pull localstorage into the Search history array, it requires JSON parsing the stored items.
    Once the cities were retrieved from localStorage, search history array will be updated.
    Then the search history array would be rendered as Buttons on DOM for future reference.
    */


    //OPENWEATHERMAP API SECTION BELOW:

    // API call for UV Index using longitude(lon)/latitude(lat) from current weather call.
    const uvCall = (lon, lat) => {
        let uvQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&units=imperial&appid=23e44ba14650d11128e23c251e9d4a7a`;

        $.ajax({
            url: uvQueryURL,
            method: 'GET',
        }).then(function (uvResponse) {
            // Display UV Index data
            $('#uvData').html(`${uvResponse.value}`);
            // Color code the UV Index row
            if (uvResponse.value <= 2) {
                $('.uvRow').css('background-color', 'green');
            } else if (uvResponse.value > 2 && uvResponse.value <= 5) {
                $('.uvRow').css('background-color', 'yellow');
            } else if (uvResponse.value > 5 && uvResponse.value <= 7) {
                $('.uvRow').css('background-color', 'orange');
            } else if (uvResponse.value > 7 && uvResponse.value <= 10) {
                $('.uvRow').css('background-color', 'red');
            } else {
                $('.uvRow').css('background-color', 'violet');
            }
        });
    };
    /*Explanation of code above:
    uv index data is received using the longitude/latitude and the url.
    if the ajax function completes successfully, THEN api will display UV index data in the html uvdata id.
    the uv index is color coded to display favorable(green), moderate(yellow/orange), or severe (red).
    */

    // API call for five-day forecast received from the latitude/longitude from current weather call.
    const fiveDay = (lon, lat) => {
        let fiveQueryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=imperial&appid=23e44ba14650d11128e23c251e9d4a7a`;

        $.ajax({
            url: fiveQueryURL,
            method: 'GET',
        }).then(function (fiveResponse) {

            for (var k = 1; k < 6; k++) {
                $(`#${k}img`).attr(
                    'src',
                    `http://openweathermap.org/img/wn/${fiveResponse.daily[k].weather[0].icon}@2x.png`
                );
                $(`#${k}temp`).html(
                    `Temp: ${fiveResponse.daily[k].temp.day} &#8457;`
                );
                $(`#${k}humid`).html(
                    `Humidity: ${fiveResponse.daily[k].humidity}%`
                );
            }
        });
    };

    /*Explanation of code above:
    The 5 day forecast is dependent on longitutde(lon) and latitude (lat) parameters and the API key.
    An ajax function runs successfully using the url provided, the openWeatherMap API will provide results for the weather.
    Then a "for loop" runs through the forecast starting tomorrow for 5 days and displays the image, temprature and humidity in the appropiate card.
    */


    //Setting up Ajax call to openWeatherMap API
    
    // Called with input from search bar or search history button
    const call = (btnCityName) => {
        let cityName = btnCityName || $('input').val();
        //Call using API for Current Weather Conditions:
        let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=23e44ba14650d11128e23c251e9d4a7a`;
        
        //calling ajax for server connection to OpenWeatherMap:
        $.ajax({
            url: queryURL,
            method: 'GET',
        })
            .then(function (response) {
                if (!btnCityName) {
                    searchHistory.unshift(cityName);
                    storeCities();
                    renderButtons();
                }
            
                /* Explanation of Code above:
                Once the ajax call has SUCCESSFULLY called the url (queryURL and method "GET") THEN:
                the all searched city in the search field will be added to the search history array,
                then runs the function of storing the search history array to local storage,
                then runs the function to create and display buttons of previous searched cities.
                */
                
                //Gather longitutde and latitude for subsequent API calls:
                var lon = response.coord.lon;
                var lat = response.coord.lat;
                $('#cityName').text(response.name);
                $('#currentImg').attr(
                    'src',
                    `http://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`
                );
                $('#tempData').html(`${response.main.temp} &#8457;`);
                $('#humidData').html(`${response.main.humidity}%`);
                $('#windData').html(`${response.wind.speed} mph`);
                $('#windArrow').css({
                    transform: `rotate(${response.wind.deg}deg)`,
                });

                /* Explanation of code above: 
                This section will update the jumbotron.
                Longitude(lon) and Latitude (lat) was declared as a variable and city name and weather icon will be called to replace the HTML sections #cityName and CurrentImg. Moreover, the temperature, humidity, windSpeed and wind direction arrow will called from the API as well. */ 
            
                uvCall(lon, lat);  // Calls the API for uv index data
                
                fiveDay(lon, lat); // Calls the API for five-day forecast info
            })
            
            //Validation Check: if an error is returned then an alert appears to indicate invalid city
            .catch(function (error) {
                alert('Enter a valid city');
            });
    };

    call(searchHistory[0]);
});