"use strict";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function (position) {
    const latitude = position.coords.latitude;
    const { longitude } = position.coords;
    const coord = [latitude, longitude];

    const map = L.map("map").setView(coord, 15);
    // console.log(map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    //console.log(position);
    //console.log(latitude, longitude);

    map.on("click", function (mapEvent) {
      //console.log(mapEvent)
      const { lat, lng } = mapEvent.latlng;
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(
          L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: "mark-popup",
          })
        )
        .setPopupContent("Treining!")
        .openPopup();
    });
  });
} else {
  alert("Not navigator.geolocation!");
}
