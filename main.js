var modifiers = {
    "twoTurns": false,
    "dodge": false,
    "explode": false
};
var turn = true;
var jumpTurn = false;

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
    jumpTurn = false;
    if (checker.classList.contains("jump")) {
        var jumpPos = checker.id.split("-").map((el) => parseInt(el));
        var originPos = origin.id.split("-").map((el) => parseInt(el));
        // get midpoint
        var jumpedPos = [(jumpPos[0] + originPos[0]) / 2, (jumpPos[1] + originPos[1]) / 2];
        var jumped = getChecker(jumpedPos[0], jumpedPos[1]);
        ["king", "checker", "light", "dark"].forEach((el) => {
            if (jumped.element.classList.contains(el)) {
                jumped.element.classList.remove(el);
            }
        })
        jumpTurn = true;
        turn = (turn ? false : true);
        createMoveOptions(getChecker(jumpPos[0], jumpPos[1]), row, col);
    }
    if (!jumpTurn) {
        Array.from(document.getElementsByClassName("option")).forEach(function (element) {
            element.classList.remove("option");
        });
    }
}

document.addEventListener("click", function (event) {
    var isTile = event.target.classList.contains("tile");
    if (!isTile) {
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