var modifiers = {
    "twoTurns": false,
    "dodge": false,
    "explode": false
};

function createBoard() {
    // 8x8 board
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            let tile = document.createElement("div");
            tile.setAttribute("id", i + "-" + j);
            tile.classList.add("tile");
            // checkers
            if (i <= 1 || i >= 6) {
                tile.classList.add("checker");
            }
            // colors
            if ((i + j) % 2 === 0) {
                tile.classList.add('white');
            } else {
                tile.classList.add('black');
            }
            if (i <= 1) {
                tile.classList.add("light");
            } else if (i >= 6) {
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

document.addEventListener("click", function (event) {
    var isTile = event.target.classList.contains("tile");

    var id = event.target.id;
    var row = id.split("-")[0];
    var col = id.split("-")[1];
    var info = getChecker(row, col);

    Array.from(document.getElementsByClassName("option")).forEach(function (element) {
        element.classList.remove("option");
    });

    if (info.isChecker) {
        // 3 by 3 grid
        for (let x = -1; x < 2; x++) {
            for (y = -1; y < 2; y++) {
                let target = getChecker(parseInt(row) + x, parseInt(col) + y);
                if (target && target.isLight != info.isLight) {
                    target.element.classList.add("option");
                }
            }
        }
    }

});

createBoard();