// Setting difficulty penalty to survive the trials...
const TRIAL_DIFFICULTY = -30;

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
    return status;
}

let result = "";
while (result != "Survived") {
    result = GenerateHexer();
}
