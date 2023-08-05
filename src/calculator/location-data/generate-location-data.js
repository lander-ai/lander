/* eslint-disable */

const fs = require("fs");

let cityData = require("./city-data.json");
let countryData = require("./country-data.json");
let currencyData = require("./currency-data.json");
let timezoneData = require("./timezone-data.json");

const locationData = {
  cities: {},
  countries: {},
  currencies: {},
  timezones: {},
};

cityData = cityData.sort((a, b) => (a.population > b.population ? 1 : -1));

cityData.forEach((city) => {
  [city.city, ...(city.nicknames || [])].forEach((key) => {
    if (city.timezone && typeof city.iso2 === "string") {
      locationData["cities"][key.toLowerCase()] = {
        name: city.city,
        lat: city.lat,
        lng: city.lng,
        population: city.population,
        iso2: city.iso2,
        timezone: city.timezone,
      };
    }
  });
});

countryData.forEach((country) => {
  [country.name, country.iso2, ...(country.nicknames || [])].forEach((key) => {
    locationData["countries"][key.toLowerCase()] = {
      iso2: country.iso2,
      name: country.name,
      currencyCode: country.currencyCode,
      population: country.population,
      capital: country.capital,
      continent: country.continent,
    };
  });
});

const sortedCountryData = countryData.sort((a, b) =>
  a.population > b.population ? 1 : -1
);

console.log(sortedCountryData.at(-1));

currencyData = currencyData.sort((a, b) => {
  const countryA = sortedCountryData.find(
    (country) => country.currencyCode === a.currencyCode
  );

  const countryB = sortedCountryData.find(
    (country) => country.currencyCode === b.currencyCode
  );

  return countryA.population > countryB.population ? -1 : 1;
});

currencyData.forEach((currency) => {
  [currency.currencyCode, currency.symbol].forEach((key) => {
    if (key) {
      locationData["currencies"][key.toLowerCase()] = {
        currencyCode: currency.currencyCode,
        symbol: currency.symbol,
        name: currency.name,
      };
    }
  });
});

timezoneData.forEach((tz) => {
  tz.zones.forEach((key) => {
    locationData["timezones"][key.toLowerCase()] = {
      zone: key,
      offset: tz.offset,
    };
  });
});

fs.writeFileSync("location-data.json", JSON.stringify(locationData, null, 2));
