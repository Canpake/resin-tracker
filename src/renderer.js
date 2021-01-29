const resinCap = 160;               // no longer 120, yay
const resinRecover = 480000;        // time for resin to recover (in ms) 

let currentResin = 80;              // set to 0? 100? should be auto calculated based on last close time
let lastUpdateTime = Date.now();    // unix timestamp - when the counter was last updated 

let refresh;    // variable to hold setInterval() refresh

let resin = document.getElementById('resin-amount');
let time = document.getElementById('resin-time-text');
let full = document.getElementById('full');

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
}

function getTimeString(h, m, s) {
    if (h + m + s == 0) { return "Full"; }
    return `${h}h ${m}m ${s}s`;
}


// function to begin repeatedly calling update() every 'interval' ms
function repeatUpdate(interval) {
    refresh = setInterval(() => {
        update();
    }, interval)
}

// update every second (i.e. 1000ms); 
// attempt to update once at start before repeating further calls
try {
    update();
    repeatUpdate(100);
} catch (err) {
    console.log("Whoops! Something went wrong.")
    console.log(err);
}


// Buttons
let btn20 = document.getElementById('btn20')
let btn40 = document.getElementById('btn40')
let btn60 = document.getElementById('btn60')
let settings = document.getElementById('settings')

// returns a function that will increase or reduce resin by a certain amount;
// it keeps resin limited at resinCap; does nothing if it would be below 0.
function changeResinFunction(amount) {
    return () => {
        if (currentResin + amount >= 0) {
            currentResin = Math.min(currentResin+amount, resinCap);
            update();
        }
    }
}

btn20.addEventListener("click", changeResinFunction(-20));
btn40.addEventListener("click", changeResinFunction(-40));
btn60.addEventListener("click", changeResinFunction(60));

