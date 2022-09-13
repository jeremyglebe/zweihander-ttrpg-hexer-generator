// Setting difficulty penalty to survive the trials...
const TRIAL_DIFFICULTY = -30;
const AVERAGE_STATS = 290.5;

// Use name generator library to create generators
const HexerNameGenerator = NameGen.compile("sD");
const HexerVillageGenerator = NameGen.compile("sCd");
function GenerateIdentity() {
    let name = HexerNameGenerator.toString();
    name = name[0].toUpperCase() + name.substr(1);
    let village = HexerVillageGenerator.toString();
    village = village[0].toUpperCase() + village.substr(1);
    return `${name} of ${village}`;
}

function RollDice(max) {
    return Math.floor(Math.random() * max + 1);
}

function RollForStat() {
    // Stats are 3D10+25
    return RollDice(10) + RollDice(10) + RollDice(10) + 25;
}

function RollStatBlock() {
    return {
        Combat: RollForStat(),
        Brawn: RollForStat(),
        Agility: RollForStat(),
        Perception: RollForStat(),
        Intelligence: RollForStat(),
        Willpower: RollForStat(),
        Fellowship: RollForStat()
    }
}

function MakeResolveTest(difficulty) {
    let roll = RollDice(100);
    if (roll == 1) {
        return {
            roll: roll,
            success: true,
            critical: true
        }
    }
    else if (roll == 100) {
        return {
            roll: roll,
            success: false,
            critical: true
        }
    }
    else {
        let str_roll = "" + roll;
        let crit = false;
        let success = true;
        if (str_roll[0] == str_roll[1]) {
            crit = true;
        }
        if (roll > difficulty) {
            success = false;
        }
        return {
            roll: roll,
            success: success,
            critical: crit
        }
    }
}

function GenerateHexer() {
    const stats = RollStatBlock();
    const test = MakeResolveTest(stats.Willpower + TRIAL_DIFFICULTY > 0 ? stats.Willpower + TRIAL_DIFFICULTY : 0);
    const name = GenerateIdentity();

    // Determine status of the hexer candidate
    let status;
    if (test.success) {
        status = "Survived";
        // Cheat to avoid low stats :P Uncomment call to use this.
        // But don't actually use this. It won't be enabled on the website.
        const cheat = () => {
            const MIN_SCORE = 42; // This breaks the webpage around 46 lol, statistics are fun
            for (let score of Object.values(stats)) {
                if (score < MIN_SCORE) {
                    status = "Weak, Supporting Cast Energy";
                }
            }
        }
        // cheat();
    }
    else if (test.critical) {
        status = "Deceased";
    }
    else {
        status = "Insane";
    }

    // Create the HTML element for the character
    const div = document.createElement('div');
    let html = `
    <h2>${name}</h2>
    <h3>${status} (${test.roll} roll vs ${stats.Willpower + TRIAL_DIFFICULTY}% chance)</h3>
    `
    // Create a table of stats for the character
    html += `
    <table>
        <tr>
    `;
    for (let key of Object.keys(stats)) {
        html += `<th>${key}</th>`;
    }
    html += `
    </tr>
    <tr>
    `;
    for (let key of Object.keys(stats)) {
        html += `<td>${stats[key]}</td>`;
    }
    html += `
    </tr>
    </table>
    `;

    // Load all the HTML into the div and append it to the document
    div.innerHTML = html;
    document.body.appendChild(div);

    // Return the result of the test
    return { name, stats, test, status };
}

let total_candidates = 0;
let total_stat_points = 0;
let dead = 0;
let insane = 0;
let hexer = { status: "" };
while (hexer.status != "Survived") {
    hexer = GenerateHexer();
    total_candidates++;
    total_stat_points += Object.values(hexer.stats).reduce((partialSum, a) => partialSum + a, 0);
    if (hexer.status == "Deceased") {
        dead++;
    }
    else if (hexer.status == "Insane") {
        insane++;
    }
}

// Let's generate some fun stats
// First, how does the winning hexer compare to all the other candidates?
const candidates_avg = total_stat_points / total_candidates;
const winner = Object.values(hexer.stats).reduce((partialSum, a) => partialSum + a, 0);
const candidates_lower = winner < candidates_avg;
const candidates_perc_diff = (Math.abs(winner - candidates_avg) / ((winner + candidates_avg) / 2)) * 100;
// Lets compare it to Zweihander characters in general
const zwei_perc_diff = (Math.abs(winner - AVERAGE_STATS) / ((winner + AVERAGE_STATS) / 2)) * 100;
const zwei_lower = winner < AVERAGE_STATS;
// Determine what percentage of candidates died, went insane, etc.
// Display the stats
let html = `
<h2>Mildly Interesting Statistics</h2>
<ul>
    <li>${insane} out of ${total_candidates} (${(insane/total_candidates*100).toFixed(2)}%) were driven insane by the mutagenic elixir. Their madness and deformities will prevent them from ever becoming a Hexer.</li>
    <li>${dead} out of ${total_candidates} (${(dead/total_candidates*100).toFixed(2)}%) died from the toxins in the elixir.</li>
    <li>${hexer.name}'s stats are <b>${zwei_perc_diff.toFixed(2)}% ${zwei_lower ? "lower" : "higher"}</b> than the average Zweihander character.</li>
    <li>${hexer.name}'s stats are <b>${candidates_perc_diff.toFixed(2)}% ${candidates_lower ? "lower" : "higher"}</b> than the average of the candidates that failed.</li>
</ul>
`
let div = document.createElement('div');
div.innerHTML = html;
document.body.appendChild(div);

// Quick experiment to determine actual average stat points. This will be used to hardcode the value, 
// then this code will be commented out and forgotten.
// const its = 10000000;
// let total = 0;
// for(let i = 0; i < its; i++){
//     let stats = RollStatBlock();
//     total += Object.values(stats).reduce((partialSum, a) => partialSum + a, 0);
// }
// console.log("Average Stats", total / its);