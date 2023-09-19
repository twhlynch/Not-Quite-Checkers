var modifiers = [
    "Alternate_dimension",
    "Dodge",
    "Explode",
    "Duplicate",
    "Quantum",
    "Cloning",
    "Shuffle",
    "King"
];
var rare = [
    4, 5
]
var non_rare = modifiers.filter(function (value, index, arr) {
    return !rare.includes(index);
});
var classTypes = ["king", "checker", "light", "dark"];
var allTypes = classTypes.concat(modifiers);

var RARITY = 0.95;//.95
var TAKE_MOD_CHANCE = 0.9; //.3
var MOVE_MOD_CHANCE = 0.5; //.1
var NUM_MODIFIERS = 3

var boardSize = 8;

var turn = true;
var jumpTurn = false;
const overlay = document.getElementById("overlay");

function changeTurns() {
    turn = !turn;
    document.getElementById("board").setAttribute("turn", turn);
    checkStates();
}

function checkStates() {
    let checkerArr = Array.from(document.getElementsByClassName("checker")).map((e) => [e.classList, e.id]);
    let checkerCount = checkerArr.length;
    if (checkerCount == 0) {
        alert("Game Over");
    } else if (checkerCount == 1) {
        alert("Game Over");
    }
    if (checkerCount >= (boardSize*boardSize*0.5)) {
        boardSize+=2;
        createBoard(boardSize);
        console.log(checkerArr);
        checkerArr.forEach((e) => {
            e[0].forEach((eClass) => {
                let eid = e[1].split("-");
                let row = parseInt(eid[0]);
                let col = parseInt(eid[1]);
                if (eClass != "white" && eClass != "black" && eClass != "tile") {
                    document.getElementById(`${row+1}-${col+1}`).classList.add(eClass);
                }
            });
        });
    }
}

function createBoard(size, checkers=false) {
    // 8x8 board
    let board = document.getElementById("board");
    board.innerHTML = "";
    board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            let tile = document.createElement("div");
            tile.setAttribute("id", i + "-" + j);
            tile.classList.add("tile");
            // colors
            if ((i + j) % 2 === 0) {
                tile.classList.add('white');
            } else {
                tile.classList.add('black');
            }
            
            // checkers
            if (checkers) {
                if ((i <= 2 || i >= size - 3) && (i + j) % 2 === 0) {
                    tile.classList.add("checker");
                }
                if (i <= 2 && (i + j) % 2 === 0) {
                    tile.classList.add("light");
                } else if (i >= size - 3 && (i + j) % 2 === 0) {
                    tile.classList.add("dark");
                }
            }
            board.appendChild(tile);
        }
    }
}

function getChecker(row, col) {
    var element = document.getElementById(row + "-" + col);
    if (!element) {
        return false;
    }
    var isChecker = element.classList.contains("checker");
    var isLight = element.classList.contains("light");
    var isDark = element.classList.contains("dark");
    var isKing = element.classList.contains("king");

    return {
        "element": element,
        "isChecker": isChecker,
        "isLight": isLight,
        "isDark": isDark,
        "isKing": isKing
    }
}

function findNearestEmpty(row, col, color=false) {
    let element = document.getElementById(row + "-" + col);
    let allEmpty;
    if (color) {
        allEmpty = document.querySelectorAll(`.${color}.tile:not(.checker)`);
    } else {
        allEmpty = document.querySelectorAll(".tile:not(.checker)");
    }
    
    let nearestEmpty = false;
    let minDistance = Number.MAX_SAFE_INTEGER;

    allEmpty.forEach(emptyElement => {
        const emptyRow = parseInt(emptyElement.id.split("-")[0]);
        const emptyCol = parseInt(emptyElement.id.split("-")[1]);
        
        const distance = Math.abs(emptyRow - row) + Math.abs(emptyCol - col);

        if (distance < minDistance) {
            nearestEmpty = emptyElement;
            minDistance = distance;
        }
    });
    console.log(nearestEmpty);
    return nearestEmpty;
}

function getModifiers(num, rarity) {
    const chosen = [];
    while (chosen.length < num) {
        const rand = Math.floor(Math.random() * modifiers.length);
        if (!chosen.includes(rand) && (Math.random() >= rarity || !rare.includes(rand))) {
            chosen.push(rand);
        }
    }
    return chosen.map(index => modifiers[index]);
}

function showModifiers(checker) {
    overlay.style.display = "flex";
    if (checker.classList.contains("light")) {
        overlay.style.transform = "rotate(180deg)";
    } else {
        overlay.style.transform = "rotate(0deg)";
    }
    var chosenModifiers = getModifiers(NUM_MODIFIERS, RARITY);
    for (let i = 0; i < chosenModifiers.length; i++) {
        const card = overlay.children[i];
        const mod = chosenModifiers[i];
        card.classList.remove("rare");
        for (let j = 0; j < rare.length; j++) {
            if (mod === modifiers[rare[j]]) {
                card.classList.add("rare");
            }
        }
        card.id = checker.classList.contains("light") ? "light" : "dark";
        card.innerText = mod;
    }
}

function createMoveOptions(info, row, col) {
    console.log("createMoveOptions");
    Array.from(document.getElementsByClassName("option")).forEach(function (element) {
        element.classList.remove("option");
    });
    Array.from(document.getElementsByClassName("jump")).forEach(function (element) {
        element.classList.remove("jump");
    });
    info.element.classList.add("option");
    // 3 by 3 grid + jump selections
    movement = [-1, 1, -1, 1];
    if (!info.isKing) {
        if (info.isDark) {
            movement[1] = 0;
        } else {
            movement[0] = 0;
        }
    }
    for (let x = movement[0]; x <= movement[1]; x++) {
        for (let y = movement[2]; y <= movement[3]; y++) {
            let target = getChecker(parseInt(row) + x, parseInt(col) + y);
            if (target && !target.isChecker && x != 0 && y != 0) {
                if (!jumpTurn) {
                    target.element.classList.add("option");
                }
            } else if (target.isChecker && (target.isLight != info.isLight)) {
                let jump = getChecker(parseInt(row) + (x * 2), parseInt(col) + (y * 2));
                if (jump && !jump.isChecker) {
                    jump.element.classList.add("option");
                    jump.element.classList.add("jump");
                }
            }
        }
    }
    console.log("jumpTurn: " + jumpTurn);
    if (jumpTurn) {
        let options = Array.from(document.getElementsByClassName("jump"));
        console.log("options: " + options);
        if (options.length == 0) {
            jumpTurn = false;
            changeTurns();
        }
    }
}

function moveChecker(checker, row, col) {
    console.log("moveChecker");
    var origin = document.querySelector(".checker.option");
    if (origin.classList.contains("dark")) {
        if (row == 0) {
            checker.classList.add("king");
        }
    } else {
        if (row == boardSize - 1) {
            checker.classList.add("king");
        }
    }
    allTypes.forEach((el) => {
        if (origin.classList.contains(el)) {
            if (!origin.classList.contains("Quantum")) {
                origin.classList.remove(el);
            }
            checker.classList.add(el);
        }
    });
    if (origin.getAttribute("explode") != null) {
        checker.setAttribute("explode", origin.getAttribute("explode"));
        if (!origin.classList.contains("Quantum")) {
            origin.removeAttribute("explode");
        }
    }
    let modified = false;
    if (Math.random() < MOVE_MOD_CHANCE) {
        showModifiers(checker);
        modified = true;
    }
    jumpTurn = false;
    if (checker.classList.contains("jump")) {
        
        var jumpPos = checker.id.split("-").map((el) => parseInt(el));
        var originPos = origin.id.split("-").map((el) => parseInt(el));
        // get midpoint
        var jumpedPos = [(jumpPos[0] + originPos[0]) / 2, (jumpPos[1] + originPos[1]) / 2];
        var jumped = getChecker(jumpedPos[0], jumpedPos[1]);
        
        // take modifiers
        if (jumped.element.classList.contains("Explode")) {
            var explodePos = jumped.element.id.split("-").map((el) => parseInt(el));
            let intensity = jumped.element.getAttribute("explode");
            if (intensity == 10) {
                intensity = boardSize;
            }
            for (let x = -intensity; x <= intensity; x++) {
                for (let y = -intensity; y <= intensity; y++) {
                    let target = getChecker(explodePos[0] + x, explodePos[1] + y);
                    if (target && target.isChecker && target.isLight != jumped.isLight) {
                        allTypes.forEach((el) => {
                            if (target.element.classList.contains(el)) {
                                target.element.classList.remove(el);
                            }
                        });
                        if (target.element.getAttribute("explode") != null) {
                            target.element.removeAttribute("explode");
                        }
                    }
                }
            }
        }

        if (Math.random() < TAKE_MOD_CHANCE && !modified) {
            showModifiers(checker);
        }
        if (!jumped.element.classList.contains("Dodge") && !jumped.element.classList.contains("Explode")) {
            jumpTurn = true;
            changeTurns();
            createMoveOptions(getChecker(jumpPos[0], jumpPos[1]), row, col);
        }
        
        if (!jumped.element.classList.contains("Dodge")) {
            allTypes.forEach((el) => {
                if (jumped.element.classList.contains(el)) {
                    jumped.element.classList.remove(el);
                }
            });
            if (jumped.element.getAttribute("explode") != null) {
                jumped.element.removeAttribute("explode");
            }
        } else {
            jumped.element.classList.remove("Dodge");
        }
    }
    if (!jumpTurn) {
        Array.from(document.getElementsByClassName("option")).forEach(function (element) {
            element.classList.remove("option");
        });
        Array.from(document.getElementsByClassName("jump")).forEach(function (element) {
            element.classList.remove("jump");
        });
    }
}

document.addEventListener("click", function (event) {
    var isTile = event.target.classList.contains("tile");
    if (!isTile) {
        if (event.target.classList.contains("card")) {
            overlay.style.display = "none";
            let selector = `.${event.target.id}`
            if (event.target.innerText == "Explode") {
                selector += `:not([explode="10"])`;
            } else if (["Dodge", "Quantum", "King"].includes(event.target.innerText)) {
                selector += `:not(.${event.target.innerText})`;
            }
            let allCheckers = Array.from(document.querySelectorAll(selector));
            let randomChecker = allCheckers[Math.floor(Math.random() * allCheckers.length)];
            randomChecker.classList.add(event.target.innerText);
            // apply modifiers
            if (event.target.innerText == "Alternate_dimension") {
                let originPosition = randomChecker.id.split("-").map((el) => parseInt(el))
                let color = "white";
                if (randomChecker.classList.contains("white")) {
                    color = "black";
                }
                let modifiedChecker = findNearestEmpty(originPosition[0], originPosition[1], color);
                allTypes.forEach((el) => {
                    if (randomChecker.classList.contains(el)) {
                        randomChecker.classList.remove(el);
                        modifiedChecker.classList.add(el);
                    }
                });
                if (randomChecker.getAttribute("explode") != null) {
                    modifiedChecker.setAttribute("explode", randomChecker.getAttribute("explode"));
                    randomChecker.removeAttribute("explode");
                }
            } else if (event.target.innerText == "Duplicate") {
                let originPosition = randomChecker.id.split("-").map((el) => parseInt(el))
                let color = "white";
                if (randomChecker.classList.contains("black")) {
                    color = "black";
                }
                let modifiedChecker = findNearestEmpty(originPosition[0], originPosition[1], color);
                allTypes.forEach((el) => {
                    if (randomChecker.classList.contains(el)) {
                        modifiedChecker.classList.add(el);
                    }
                });
                if (randomChecker.getAttribute("explode") != null) {
                    modifiedChecker.setAttribute("explode", randomChecker.getAttribute("explode"));
                }
            } else if (event.target.innerText == "Cloning") {
                allCheckers.forEach((checker) => {
                    let originPosition = checker.id.split("-").map((el) => parseInt(el))
                    let color = "white";
                    if (checker.classList.contains("black")) {
                        color = "black";
                    }
                    let modifiedChecker = findNearestEmpty(originPosition[0], originPosition[1], color);
                    if (modifiedChecker) {
                        allTypes.forEach((el) => {
                            if (checker.classList.contains(el)) {
                                modifiedChecker.classList.add(el);
                            }
                        });
                        if (checker.getAttribute("explode") != null) {
                            modifiedChecker.setAttribute("explode", checker.getAttribute("explode"));
                        }
                    }
                });
            } else if (event.target.innerText == "Shuffle") {
                for (let i = 0; i < 5; i++) {
                    allCheckers.forEach((checker) => {
                        let originPosition = checker.id.split("-").map((el) => parseInt(el))
                        let color = "white";
                        if (checker.classList.contains("black")) {
                            color = "black";
                        }
                        let modifiedChecker = findNearestEmpty(originPosition[0], originPosition[1], color);
                        allTypes.forEach((el) => {
                            if (checker.classList.contains(el)) {
                                modifiedChecker.classList.add(el);
                                checker.classList.remove(el);
                            }
                        });
                        if (checker.getAttribute("explode") != null) {
                            modifiedChecker.setAttribute("explode", checker.getAttribute("explode"));
                            checker.removeAttribute("explode");
                        }
                    });
                }
            } else if (event.target.innerText == "King") {
                randomChecker.classList.add("king");
            } else if (event.target.innerText == "Explode") {
                let currentExplode = parseInt(randomChecker.getAttribute("explode"));
                currentExplode == NaN && currentExplode = 0;
                randomChecker.setAttribute("explode", Math.min(currentExplode + 1, 10));
            }

            // check kings

            let notKings = Array.from(document.querySelectorAll(`.checker:not(.king)`));
            notKings.forEach((checker) => {
                let checkerPosition = checker.id.split("-").map((el) => parseInt(el))
                if (checker.classList.contains("light")) {
                    if (checkerPosition[0] == boardSize - 1) {
                        checker.classList.add("king");
                    }
                } else {
                    if (checkerPosition[0] == 0) {
                        checker.classList.add("king");
                    }
                }
            });
            checkStates();

        }
        return false;
    }

    var id = event.target.id;
    var row = id.split("-")[0];
    var col = id.split("-")[1];
    var info = getChecker(row, col);
    console.log(info);
    if (info.isChecker && info.isLight == turn) {
        if (!jumpTurn) {
            createMoveOptions(info, row, col);
        }
    } else if (event.target.classList.contains("option") && !info.isChecker) {
        console.log("")
        moveChecker(event.target, row, col);
        changeTurns();
    }
});


createBoard(boardSize, true);