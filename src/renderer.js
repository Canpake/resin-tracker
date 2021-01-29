const resinCap = 160;               // no longer 120, yay
const resinRecover = 480000;        // time for resin to recover (in ms) 

// How the timer is kept track of; set to default values
let currentResin;
let lastUpdateTime;    // when the counter was last updated

let refresh;    // variable to hold setInterval() refresh

let resin = document.getElementById('resin-amount');
let time = document.getElementById('resin-time-text');
let full = document.getElementById('full');


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
        lastUpdateTime = Date.now();
        timeElasped = 0;
    }

    // for every resin remaining, add 8 minutes, minus the seconds elasped
    let totalSeconds = (resinCap - currentResin) * 480 - Math.floor(timeElasped/1000)
    hours = Math.floor(totalSeconds / 3600);
    mins = Math.floor((totalSeconds % 3600)/ 60);
    secs = totalSeconds % 60;
    
    // update text
    time.innerText = getTimeString(hours, mins, secs);
    resin.innerText = currentResin;

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

// function to load from localStorage - remember to call parseInt()!
function loadState() {
    prevResin = parseInt(window.localStorage.getItem('currentResin'));
    prevTime = parseInt(window.localStorage.getItem('lastUpdateTime'));

    console.log(prevResin);
    console.log(prevTime);
    console.log(Date.now());

    // only load values if both exist; otherwise set to full
    if (prevTime !== null || prevResin !== null) {
        let timeElasped = Date.now() - prevTime;
        console.log(timeElasped)
        console.log(Math.floor(timeElasped/resinRecover))
        console.log(timeElasped%resinRecover)
        console.log(prevResin + Math.floor(timeElasped/resinRecover))

        currentResin = Math.min(prevResin + Math.floor(timeElasped/resinRecover), resinCap);
        console.log(currentResin)
        lastUpdateTime = Date.now() - (timeElasped%resinRecover);       // set the last update time to the tick right before
    } else {
        currentResin = resinCap;
        lastUpdateTime = Date.now();
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


// Button - Settings Overlay
let openSettings = document.getElementById('settings-open');
let closeSettings = document.getElementById('settings-close');
let inputResin = document.getElementById('newResin');
let setResin = document.getElementById('setResin');

openSettings.addEventListener("click", () => {
    inputResin.value = currentResin;
    document.getElementById("settings-overlay").style.height = "100%";
})

closeSettings.addEventListener("click", () => {
    document.getElementById("settings-overlay").style.height = "0%";
})

document.onkeydown = (evt) => {
    console.log(evt)
    if(evt.key === "Escape") {
        document.getElementById("settings-overlay").style.height = "0%";
    }
}

setResin.addEventListener("click", () => {
    changeResin(parseInt(inputResin.value));
})