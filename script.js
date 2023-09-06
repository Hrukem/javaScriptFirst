"️️️️️use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class Workout {
  date = new Date();
  id = (Date.now() + ``).slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _setDescription() {
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
    this.description = `
     ${this.type[0].toUpperCase()}${this.type.slice(1)} ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}
    `;
  }
}
class Running extends Workout {
  type = `running`;
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = `cycling`;
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    this.speed = this.distance / this.duration;
    return this.speed;
  }
}
const run1 = new Running([-4, -5], 5.2, 24, 134);
const cycl = new Cycling([-41, -25], 5.2, 4, 34);
// console.log(run1);
// console.log(cycl);

class App {
  #map;
  #mapEvent;
  _workouts = [];

  constructor() {
    this._getPosition();
    this._getLocalStorage();
    form.addEventListener(`submit`, this._newWorkout.bind(this));
    inputType.addEventListener(`change`, this._toogleFeield.bind(this));
    containerWorkouts.addEventListener(`click`, this._moveToPopup.bind(this));
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this));
    } else {
      alert("Not navigator.geolocation!");
    }
  }

  // метод загрузки карты на стрницу в случае положительного
  // ответа о предоставлении своих координат
  _loadMap(position) {
    const latitude = position.coords.latitude;
    const { longitude } = position.coords;
    const coord = [latitude, longitude];

    this.#map = L.map("map").setView(coord, 15);
    // console.log(map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //console.log(position);
    //console.log(latitude, longitude);

    // обработчик события клика по карте
    this.#map.on("click", this._showForm.bind(this));

    this._workouts.forEach((work) => {
      this._renderWorkMarke(work);
    });
  }

  // метод отображающий форму при клике по карте
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove(`hidden`);
    inputDistance.focus();
    //console.log(mapE)
  }

  // метод переключающий типы тренировок
  _toogleFeield() {
    inputCadence.closest(`.form__row`).classList.toggle(`form__row--hidden`);
    inputElevation.closest(`.form__row`).classList.toggle(`form__row--hidden`);
  }

  // метод устанавливающий маркер на карту
  _newWorkout(e) {
    e.preventDefault();

    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));
    const allPositiv = (...inputs) => inputs.every((inp) => inp > 0);

    // данные из форм
    let workout;
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;

    // проверить корректность даныых
    if (type === `running`) {
      const cadence = +inputCadence.value;
      if (
        /*    !Number.isFinite(distance) ||
        !Number.isFinite(duration) ||
        !Number.isFinite(cadence) */
        !validInputs(distance, duration, cadence) ||
        !allPositiv(distance, duration, cadence)
      ) {
        // console.log(distance)
        return alert(`Input not number or negative number`);
      }

      // если пробежка, создать объект пробежки
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    if (type === `cycling`) {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositiv(distance, duration)
      ) {
        return alert(`Input not number or negative number`);
      }
      // если велосипед, создать объект велосипед
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // добавить объект в массив
    this._workouts.push(workout);
    // console.log(this._workouts)

    // рендер маркера тренировки на карте
    this._renderWorkMarke(workout);

    // рендер списка тренировок
    this._renderWorout(workout);

    // очистить поля ввода и спрятать форму
    this._hideForm();

    // local Storage
    this._setLocalStorage();
  }

  _renderWorkMarke(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: "mark-popup",
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂" : "🚴"} ${workout.description}`
      )
      .openPopup();
  }

  _hideForm() {
    // очистить поля ввода и спрятать форму
    inputType.value =
      inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";

    form.classList.add(`hidden`);
  }

  // рендер спска тренировок
  _renderWorout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === "running" ? "🏃‍♂" : "🚴"
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">км</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">мин</span>
    </div>
    `;
    if (workout.type === `running`) {
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">мин/км</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">шаг</span>
      </div>
      </li>
      `;
    }

    if (workout.type === `cycling`) {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">км/час</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevation}</span>
          <span class="workout__unit">м</span>
        </div>
      </li>
      `;
    }

    form.insertAdjacentHTML(`afterend`, html);
  }

  _moveToPopup(e) {
    const workoutEL = e.target.closest(`.workout`);
    //console.log(workoutEL);
    if (!workoutEL) return;

    const workout = this._workouts.find(
      (work) => work.id === workoutEL.dataset.id
    );
    // console.log(workout)

    this.#map.setView(workout.coords, 15, {
      animate: true,
      pan: { duration: 1 },
    });
  }

  _setLocalStorage() {
    localStorage.setItem(`workouts`, JSON.stringify(this._workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem(`workouts`));
    if (!data) return;

    this._workouts = data;
    this._workouts.forEach((work) => {
      this._renderWorout(work);
      //console.log(work);
      //this._renderWorkMarke(work);
    });
  }

  reset() {
    localStorage.removeItem(`workouts`);
    location.reload();
  }
}

const app = new App();
