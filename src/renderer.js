const resinCap = 160;               // no longer 120, yay
const resinRecover = 480000;        // time for resin to recover (in ms) 

// How the timer is kept track of; set to default values
let currentResin;
let lastUpdateTime;    // when the counter was last updated

let refresh;    // variable to hold setInterval() refresh

let resin = document.getElementById('resin-amount');
let time = document.getElementById('resin-time-text');
let full = document.getElementById('full');

let wave = document.getElementById("bg-wave");  // wave element; update style.top to move up/down

// takes in hours, minutes, seconds, and returns a string - Full if time is 0.
function getTimeString(h, m, s) {
    if (h + m + s == 0) { return "Full"; }
    return `${h}h ${m}m ${s}s`;
}

// function to calculate time remaining and update resin if necessary
function update() {
    console.log("Current resin:", currentResin)

    // change last updated time if resin is at cap
    if (currentResin == resinCap) {
        lastUpdateTime = Date.now();    // todo: replace 0h 0m 0s with a single span; change text to 'Full' if full.
    }
    
    timeElasped = Date.now() - lastUpdateTime   // time since last tick (in ms)

    if (timeElasped >= resinRecover) { // if 8 minutes since last resin update, increase resin
        currentResin++;
        lastUpdateTime += resinRecover;
        timeElasped -= resinRecover;
    }

    // for every resin remaining, add 8 minutes, minus the seconds elasped
    let totalSeconds = (resinCap - currentResin) * 480 - Math.floor(timeElasped/1000)
    hours = Math.floor(totalSeconds / 3600);
    mins = Math.floor((totalSeconds % 3600)/ 60);
    secs = totalSeconds % 60;
    
    // update text
    time.innerText = getTimeString(hours, mins, secs);
    resin.innerText = currentResin;

    // update wave height based off current resin
    // top: -2025px at 100%, -1870px at 0%
    // TODO: maybe make this reactive in the future? Note that -1870 comes from the height/width of the div minus screen height
    waveHeight = -1870 - (currentResin/resinCap)*135;
    wave.style.top = waveHeight + "px";

    // save values
    saveState();
}

// function to begin repeatedly calling update() every 'interval' ms
function repeatUpdate(interval) {
    refresh = setInterval(() => {
        update();
    }, interval)
}

// function to change resin; used by setResin as well as changeResinFunction
function changeResin(amount) {
    if (amount >= 0) {
        currentResin = Math.min(amount, 160);
        update();
    }
}

// function to save to localStorage
function saveState() {
    window.localStorage.setItem('currentResin', currentResin);
    window.localStorage.setItem('lastUpdateTime', lastUpdateTime);
}

// function to load from localStorage
function loadState() {
    prevResin = parseInt(window.localStorage.getItem('currentResin'));
    prevTime = parseInt(window.localStorage.getItem('lastUpdateTime'));

    // only load values if both exist; otherwise set to full
    if (isNaN(prevResin) || isNaN(prevTime)) {
        currentResin = resinCap;
        lastUpdateTime = Date.now();
    } else {
        let timeElasped = Date.now() - prevTime;
    
        currentResin = Math.min(prevResin + Math.floor(timeElasped/resinRecover), resinCap);
        lastUpdateTime = Date.now() - (timeElasped%resinRecover);       // set the last update time to the tick right before
    };
}


// load state, then update every second (i.e. 1000ms); 
// attempt to update once at start before repeating further calls
try {
    loadState();
    update();
    repeatUpdate(100);
} catch (err) {
    console.log("Whoops! Something went wrong.");
    console.log(err);
}


// Buttons - Changing Resin
let btn20 = document.getElementById('btn20');
let btn40 = document.getElementById('btn40');
let btn60 = document.getElementById('btn60');

// returns a function that will increase or reduce resin by a certain amount;
// it keeps resin limited at resinCap; does nothing if it would be below 0.
function changeResinFunction(amount) {
    return () => {
        changeResin(currentResin + amount);
    }
}

btn20.addEventListener("click", changeResinFunction(-20));
btn40.addEventListener("click", changeResinFunction(-40));
btn60.addEventListener("click", changeResinFunction(60));


// Buttons - Settings Overlay
let overlay = document.getElementById("settings-overlay");
let openSettings = document.getElementById('settings-open');
let closeSettings = document.getElementById('settings-close');
let inputResin = document.getElementById('newResin');
let setResin = document.getElementById('setResin');

// entering options
openSettings.addEventListener("click", () => {
    inputResin.value = currentResin;
    overlay.style.height = "100%";
})

// exiting options
closeSettings.addEventListener("click", () => {
    overlay.style.height = "0%";
})

document.onkeydown = (evt) => {
    if(evt.key === "Escape") {
        overlay.style.height = "0%";
    }
}

// ways of submitting resin
setResin.addEventListener("click", () => {
    changeResin(parseInt(inputResin.value));
})

inputResin.onkeyup = (evt) => {
    if(evt.key === "Enter") {
        changeResin(parseInt(inputResin.value));
        // make button go back to normal
        setResin.style.opacity="80%";

    }
}
// button response to keypress
inputResin.onkeydown = (evt) => {
    if(evt.key === "Enter") {
        setResin.style.opacity="100%";
    }
}

// Button - Resizing Window
const {ipcRenderer} = require('electron');
let resize = document.getElementById("resize");
let resin_value = document.getElementsByClassName("resin-value")[0];
let resin_time = document.getElementsByClassName("resin-time")[0];

let expanded = true         // a boolean to keep track of if currently expanded or not

resize.addEventListener("click", () => {
    // TODO: hide buttons, change text size - preferably by changing a class name instead
    resin_value.classList.toggle('small')
    resin_time.classList.toggle('small')

    if (expanded) {
        expanded = false;
        ipcRenderer.send('resize-small');
    } else {
        expanded = true;
        ipcRenderer.send('resize-large');
    }
})