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
    if (!isTile) {
        return false;
    }

    var id = event.target.id;
    var row = id.split("-")[0];
    var col = id.split("-")[1];
    var info = getChecker(row, col);
    console.log(info);

    
    if (info.isChecker) {
        Array.from(document.getElementsByClassName("option")).forEach(function (element) {
            element.classList.remove("option");
        });
        info.element.classList.add("option");
        // 3 by 3 grid + jump selections
        for (let x = -1; x < 2; x++) {
            for (y = -1; y < 2; y++) {
                let target = getChecker(parseInt(row) + x, parseInt(col) + y);
                if (target && (target.isLight != info.isLight || !target.isChecker)) {
                    target.element.classList.add("option");
                } else if (target.isChecker && x != 0 && y != 0) {
                    let jump = getChecker(parseInt(row) + (x * 2), parseInt(col) + (y * 2));
                    if (jump && (jump.isLight != info.isLight || !jump.isChecker)) {
                        jump.element.classList.add("option");
                    }
                }
            }
        }
    } else if (event.target.classList.contains("option") && !info.isChecker) {
        var origin = document.querySelector(".checker.option");
        let originClassName = origin.className;
        origin.className = event.target.className;
        event.target.className = originClassName;        
    }
});


createBoard();