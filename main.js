var modifiers = [
    "Alternate_dimension",
    "Dodge",
    "Explode",
];

var turn = true;
var jumpTurn = false;
const overlay = document.getElementById("overlay");

function createBoard() {
    // 8x8 board
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            let tile = document.createElement("div");
            tile.setAttribute("id", i + "-" + j);
            tile.classList.add("tile");
            // checkers
            if ((i <= 2 || i >= 5) && (i + j) % 2 === 0) {
                tile.classList.add("checker");
            }
            // colors
            if ((i + j) % 2 === 0) {
                tile.classList.add('white');
            } else {
                tile.classList.add('black');
            }
            if (i <= 2 && (i + j) % 2 === 0) {
                tile.classList.add("light");
            } else if (i >= 5 && (i + j) % 2 === 0) {
                tile.classList.add("dark");
            }
            document.getElementById("board").appendChild(tile);
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
            turn = (turn ? false : true);
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
        if (row == 7) {
            checker.classList.add("king");
        }
    }
    ["king", "checker", "light", "dark"].forEach((el) => {
        if (origin.classList.contains(el)) {
            origin.classList.remove(el);
            checker.classList.add(el);
        }
    });
    modifiers.forEach((el) => {
        if (origin.classList.contains(el)) {
            origin.classList.remove(el);
            checker.classList.add(el);
        }
    });
    jumpTurn = false;
    if (checker.classList.contains("jump")) {
        
        var jumpPos = checker.id.split("-").map((el) => parseInt(el));
        var originPos = origin.id.split("-").map((el) => parseInt(el));
        // get midpoint
        var jumpedPos = [(jumpPos[0] + originPos[0]) / 2, (jumpPos[1] + originPos[1]) / 2];
        var jumped = getChecker(jumpedPos[0], jumpedPos[1]);
        if (!jumped.element.classList.contains("Dodge")) {
            ["king", "checker", "light", "dark"].forEach((el) => {
                if (jumped.element.classList.contains(el)) {
                    jumped.element.classList.remove(el);
                }
            });
        }
        // take modifiers
        if (jumped.element.classList.contains("Explode")) {
            var explodePos = jumped.element.id.split("-").map((el) => parseInt(el));
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    let target = getChecker(explodePos[0] + x, explodePos[1] + y);
                    if (target && target.isChecker && target.isLight != jumped.isLight) {
                        ["king", "checker", "light", "dark"].forEach((el) => {
                            if (target.element.classList.contains(el)) {
                                target.element.classList.remove(el);
                            }
                        });
                        modifiers.forEach((el) => {
                            if (target.element.classList.contains(el)) {
                                target.element.classList.remove(el);
                            }
                        });
                    }
                }
            }
        }

        if (Math.random() < 0.3) {
            overlay.style.display = "flex";
            // 3 random modifiers no repeats
            
            var rand = Math.floor(Math.random() * modifiers.length);
            var rand2 = Math.floor(Math.random() * modifiers.length);
            var rand3 = Math.floor(Math.random() * modifiers.length);
            while (rand2 == rand) {
                rand2 = Math.floor(Math.random() * modifiers.length);
            }
            while (rand3 == rand || rand3 == rand2) {
                rand3 = Math.floor(Math.random() * modifiers.length);
            }
            var chosenModifiers = [modifiers[rand], modifiers[rand2], modifiers[rand3]];
            for (let i = 0; i < chosenModifiers.length; i++) {
                const card = overlay.children[i];
                card.id = checker.classList.contains("light") ? "light" : "dark";
                card.innerText = chosenModifiers[i];
            }

        }
        if (!jumped.element.classList.contains("Dodge") && !jumped.element.classList.contains("Explode")) {
            jumpTurn = true;
            turn = (turn ? false : true);
            createMoveOptions(getChecker(jumpPos[0], jumpPos[1]), row, col);
        } else if (jumped.element.classList.contains("Dodge")) {
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
        if (event.target.className == "card") {
            overlay.style.display = "none";
            let allCheckers = Array.from(document.getElementsByClassName(event.target.id));
            let randomChecker = allCheckers[Math.floor(Math.random() * allCheckers.length)];
            randomChecker.classList.add(event.target.innerText);
            // apply modifiers
            if (event.target.innerText == "Alternate_dimension") {
                let originPosition = randomChecker.id.split("-").map((el) => parseInt(el))
                originPosition[0] = (originPosition[0] == 7 ? originPosition[0] - 1 : originPosition[0] + 1);
                let modifiedChecker = getChecker(originPosition[0], originPosition[1]);
                ["king", "checker", "light", "dark"].forEach((el) => {
                    if (randomChecker.classList.contains(el)) {
                        randomChecker.classList.remove(el);
                        modifiedChecker.element.classList.add(el);
                    }
                });
                modifiers.forEach((el) => {
                    if (randomChecker.classList.contains(el)) {
                        randomChecker.classList.remove(el);
                        modifiedChecker.element.classList.add(el);
                    }
                });
            }
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
        turn = (turn ? false : true);
    }
});


createBoard();