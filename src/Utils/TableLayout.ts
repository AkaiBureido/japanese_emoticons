export interface computedSpanItem {
    smiley: string, em_size: number
}

export function determineColspan(parent: Node, spanList: string[], cellPadding: number): computedSpanItem[][] {
    let [cCell, cell] = _fakeTextField();
    parent.appendChild(cCell);

    // Breaking up into 4 groups
    let groups: computedSpanItem[][] = []

    groups[0] = [] // - emoticons that fit in one cell
    groups[1] = [] // - emoticons that fit in two cells
    groups[2] = [] // - emoticons that fit in three cells
    groups[3] = [] // - emoticons that fit in four cells
    groups[4] = [] // - emoticons that do not fit at all

    let ftWidth = cCell.clientWidth / 4;
    for (var i = 0; i < spanList.length; i++) {
        let span = spanList[i]
        let { width } = _calculateTextWidth(span, cell, 1);
        if (width < (ftWidth - cellPadding)) {
            groups[0].push({ smiley: span, em_size: 1 });
        } else if (width < (ftWidth * 2 - cellPadding)) {
            groups[1].push({ smiley: span, em_size: 1 });
        } else if (width < (ftWidth * 3 - cellPadding)) {
            groups[2].push({ smiley: span, em_size: 1 });
        } else if (width < (ftWidth * 4 - cellPadding)) {
            groups[3].push({ smiley: span, em_size: 1 });
        } else {
            let em_size = 0.9;
            for (; em_size > 0.5; em_size -= 0.05) {
                let { width } = _calculateTextWidth(span, cell, em_size)
                if (width < (ftWidth * 4 - cellPadding)) {
                    break;
                }
            }
            groups[4].push(
                { smiley: spanList[i], em_size: em_size }
            );
        }
    }

    console.log(groups);

    parent.removeChild(cCell);
    return groups;
}

export interface tableRowGroup {
    item: computedSpanItem, colspan: number, em_size?: number
}

export function computeTableRowGroups(groups: computedSpanItem[][]): tableRowGroup[][] {
    // Goal - aesthetically break up the smileys into rows
    // groups[0] - emoticons that fit in one cell
    // groups[1] - emoticons that fit in two cells
    // groups[2] - emoticons that fit in three cells
    // groups[3] - emoticons that fit in four cells

    let rows: tableRowGroup[][] = [];

    // Algorithm:
    // First add all the 4 cell smileys
    while (groups[3].length != 0) {
        rows.unshift([
            { 'item': groups[3].pop(), 'colspan': 4 }
        ]);
    };

    // Second add all of the 2 cell smileys + 2 cell smileys
    // Or think, think, think, think

    // Goal - we want to somewhat evenly distribute
    // [4](1 cell) rows
    // [2](2 cell) rows
    // [2](1 cell) + [1](2 cell) rows
    // [1](3 cell) + [1](1 cell) rows

    // Lets forget that we have 3 cell smileys for now
    // Lets see if we have any 2 cell widows
    let oneCellsLeft = groups[0].length;
    let spareTwoCells = groups[1].length - Math.floor(groups[1].length / 2) * 2;
    let savedOneCells = [];
    if (spareTwoCells) {
        // If we have a 2 cell spare it would be brilliant to have two 1 cells
        if (oneCellsLeft >= 2) {
            rows.unshift([
                { 'item': groups[1].pop(), 'colspan': 2 },
                { 'item': groups[0].pop(), 'colspan': 1 },
                { 'item': groups[0].pop(), 'colspan': 1 }
            ]);
            // If we are not so very lucky then we'll have to do with stretching widow a bit
        } else if (oneCellsLeft == 1) {
            rows.unshift([
                { 'item': groups[1].pop(), 'colspan': 3 },
                { 'item': groups[0].pop(), 'colspan': 1 },
            ]);
            // If we are downright miserable, the best we can do is stretch the widow
        } else {
            rows.unshift([
                { 'item': groups[1].pop(), 'colspan': 4 }
            ]);
        }
    }

    // We have gotten rid of 2 cell widows, now its party time provided we have some 1 cells left
    // We have to deal with 3 cell ones and 2 cell ones
    oneCellsLeft = groups[0].length;
    if (oneCellsLeft) {
        // If we are lucky then lets think a litle more
        // Lets remind ourselved what we are actually trying to do
        // Goal - we want to somewhat evenly distribute
        // [4](1 cell) rows
        // [2](2 cell) rows
        // [2](1 cell) + [1](2 cell) rows
        // [1](3 cell) + [1](1 cell) rows

        // Start with simple:
        // [1](3 cell) + [1](1 cell) rows
        while (groups[2].length != 0) {
            // If we have 1 cell smileys add one after the 3 cell smiley
            if (groups[0].length != 0) {
                rows.unshift([
                    { 'item': groups[2].pop(), 'colspan': 3 },
                    { 'item': groups[0].pop(), 'colspan': 1 },
                ]);
                // If we dont make smiley 4 cells wide
            } else {
                rows.unshift([
                    { 'item': groups[2].pop(), 'colspan': 4 },
                ]);
            }
        }

        let destiny = 0; // mystery counter that will sort of randomise smiley locations
        let canBalance = true; // Indicator that we have at least four 1 cells and two 2 cells

        //NOTE: The number of 2 cells at this point HAS TO BE EVEN, we have dealt with it already
        while (groups[1].length != 0) {
            if (destiny % 3 == 0 && canBalance) {
                if (groups[0].length >= 4 && groups[1].length >= 2) {
                    rows.unshift([
                        { 'item': groups[1].pop(), 'colspan': 2 },
                        { 'item': groups[0].pop(), 'colspan': 1 },
                        { 'item': groups[0].pop(), 'colspan': 1 }
                    ], [
                        { 'item': groups[1].pop(), 'colspan': 2 },
                        { 'item': groups[0].pop(), 'colspan': 1 },
                        { 'item': groups[0].pop(), 'colspan': 1 }
                    ]);
                } else {
                    canBalance = false;
                }
            } else {
                rows.unshift([
                    { 'item': groups[1].pop(), 'colspan': 2 },
                    { 'item': groups[1].pop(), 'colspan': 2 }
                ]);
            }

            destiny++;
        }

    } else {
        // If we are unlucky we will just stack them side by side
        //NOTE: The number of 2 cells at this point HAS TO BE EVEN, we have dealt with it already
        while (groups[1].length != 0) {
            rows.unshift([
                { 'item': groups[1].pop(), 'colspan': 2 },
                { 'item': groups[1].pop(), 'colspan': 2 }
            ]);
        }
    }

    // spareOneCells = groups[0].length - Math.floor(groups[0].length/4) * 4;
    // // Lets pretend we have achive equilibrium
    // // I am not sure how to do it ^^
    // for(var i=0; i < spareOneCells; i++) {
    //   savedOneCells.push(groups[0].shift())
    // };

    // Forth if there are any 1 cell smileys left display them normally
    while (groups[0].length != 0) {
        if (groups[0].length >= 4) {
            rows.unshift([
                { 'item': groups[0].pop(), 'colspan': 1 },
                { 'item': groups[0].pop(), 'colspan': 1 },
                { 'item': groups[0].pop(), 'colspan': 1 },
                { 'item': groups[0].pop(), 'colspan': 1 }
            ]);
            // exept if there are widows at the end
            // If 3 widows let last one take two colums
        } else if (groups[0].length == 3) {
            rows.unshift([
                { 'item': groups[0].pop(), 'colspan': 1 },
                { 'item': groups[0].pop(), 'colspan': 1 },
                { 'item': groups[0].pop(), 'colspan': 2 }
            ]);
            // If 2 widows let them both take 2 columns
        } else if (groups[0].length == 2) {
            rows.unshift([
                { 'item': groups[0].pop(), 'colspan': 2 },
                { 'item': groups[0].pop(), 'colspan': 2 }
            ]);
            // If 1 widow let it take 4 columns
        } else if (groups[0].length == 1) {
            rows.unshift([
                { 'item': groups[0].pop(), 'colspan': 4 }
            ]);
        }
    }

    while (groups[4].length != 0) {
        let smiley = groups[4].pop()
        rows.push([
            { 'item': smiley, 'colspan': 4, 'em_size': smiley['size'] }
        ]);
    }

    // For extra eye candy rotate each array by curRow
    for (var i = 0; i < rows.length; i++) {
        rows = _rotateList(rows, i);
    };

    return rows;
}

function _calculateTextWidth(string: string, parent: HTMLElement, em_size: number) {
    var container = document.createElement('span');

    container.setAttribute('style', 'position: absolute; height: auto; width: auto; font-size:' + em_size + 'em')
    parent.appendChild(container)

    var text = document.createTextNode(string)
    container.appendChild(text)

    let metrics = {
        width: (container.clientWidth + 1),
        height: (container.clientHeight + 1),
    }

    container.removeChild(text)
    return metrics
}

function _fakeTextField() {
    let template = document.createElement('div');
    template.setAttribute('style', [
        'width: 100%',
    ].join(";"));
    let cell = document.createElement('span')
    cell.setAttribute('style', [
        'display: inline-block',
    ].join(";"));
    template.appendChild(cell)
    return [template, cell];
}

function _rotateList<T>(l: T[], i: number): T[] {
    return l.slice(i, l.length).concat(l.slice(0, i));
}