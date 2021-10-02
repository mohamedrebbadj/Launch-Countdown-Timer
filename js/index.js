window.onload = function () {
  "use strict";

  function $(selector) {
    let elements = document.querySelectorAll(selector);
    /** @return element or collection of elements */
    return elements.length > 1 ? elements : elements[0];
  }

  function timeFormat(time) {
    return time < 10 ? `0${time}` : time;
  }

  // This Function is used to make it easier to set a delay
  function setDelay(seconds, minutes = 0, hours = 0, days = 0) {
    return (
      (seconds + minutes * 60 + hours * 3600 + days * 24 * 3600) * 1000 + 500
    );
  }

  // * Set due date
  // ? This will show 8d:23h:55min:44 | This is to avoid repeating the same time twice in [seconds countdown]
  // ? If you find a better solution please tell me.
  let dueDate = new Date(Date.now() + setDelay(43, 55, 23, 8));

  // * This the remaining time as an object
  function calculateTimeLeft() {
    let delay = Math.floor((dueDate - Date.now()) / 1000);
    let days = 0,
      hours = 0,
      minutes = 0,
      seconds = 0,
      isItOver = false;
    if (delay >= 0) {
      days = Math.floor(delay / (3600 * 24));
      hours = Math.floor((delay % (3600 * 24)) / 3600);
      minutes = Math.floor((delay % 3600) / 60);
      seconds = delay % 60;
    } else {
      isItOver = true;
    }
    return { delay, seconds, minutes, hours, days, isItOver };
  }
  // * Update the front-face value when it's covered, and update other time components if there's any changes.
  function animationEnd() {
    let isFlipClock = this instanceof FlipClock;
    let timeObj = isFlipClock ? this.seconds : this;
    // Remove class that triggers the animation
    timeObj.flipper.classList.remove("active");
    timeObj.flipper.removeEventListener(
      "animationend",
      timeObj.animationEndRef
    );

    timeObj.current.forEach((current) => {
      current.innerHTML = timeFormat(timeObj.time);
    });
    if (isFlipClock) this.compareTime();
  }

  // THIS FUNCTIONS DOESN'T SHOW THE PROPER VALUE
  // * Set initial values to a time component
  function init() {
    if (this.type != "seconds") {
      this.current.forEach((current) => {
        current.innerHTML = timeFormat(this.time);
      });
      this.next.forEach((next) => {
        next.innerHTML = timeFormat(this.time - 1);
      });
    } else {
      this.current.forEach((current) => {
        // This to avoid show the same time twice in seconds
        current.innerHTML = timeFormat(this.time + 1);
      });
    }
  }

  // Create A Time Object
  function Time(time, type) {
    this.time = time;
    // * Elements that display time to the user
    this.next = $(`.clock-${type} [data-type="next"] span`);
    this.current = $(`.clock-${type} [data-type="current"] span`);
    this.flipper = $(`.clock-${type} .countdown-flipper`);
    this.type = type;
    this.init = init;
    this.update = function ($this = this) {
      let timeout = setTimeout(() => {
        this.flipper.classList.add("active");
        clearTimeout(timeout);
      });
      this.time = calculateTimeLeft()[this.type];
      this.next.forEach((next) => {
        next.innerHTML = timeFormat(this.time);
      });
      this.animationEndRef = animationEnd.bind($this);
      this.flipper.addEventListener("animationend", this.animationEndRef);
    };
  }

  // Flip Countdown Clock Constructor
  function FlipClock() {
    this.init = function () {
      let dates = calculateTimeLeft();
      let timeTypes = ["seconds", "minutes", "hours", "days"];
      for (let timeType of timeTypes) {
        this[timeType] = new Time(dates[timeType], timeType);
        this[timeType].init();
      }
      this.seconds.update(this);
      if (calculateTimeLeft().isItOver) {
        this.finish();
      }
    };
    this.compareTime = function () {
      // Update minutes if the old value is not equal to the current value
      if (this.minutes.time != calculateTimeLeft().minutes) {
        this.minutes.update();
      }
      // Update hours if the old value is not equal to the current value
      if (this.hours.time != calculateTimeLeft().hours) {
        this.hours.update();
      }
      // Update days if the old value is not equal to the current value
      if (this.days.time != calculateTimeLeft().days) {
        this.days.update();
      }
      // If Delay didn't end update seconds
      if (!calculateTimeLeft().isItOver) {
        this.seconds.update(this);
      }
    };
    this.finished = false;
    this.finish = function () {
      let interval = setInterval(() => {
        if (
          this.seconds.current[0].innerHTML != timeFormat(this.seconds.time) &&
          !this.finished
        ) {
          this.seconds.update(this);
          this.finished = true;
          clearInterval(interval);
        }
      }, 100);
    };
  }
  let clock = new FlipClock();
  clock.init();
};
