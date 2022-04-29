const { Engine, Render, Runner, World, Bodies } = Matter;

const cells = 3;
const width = 600;
const height = 600;

const unitLenght = width / cells;


const engine = Engine.create();
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: true,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }),
    Bodies.rectangle(0, width / 2, 40, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 40, height, { isStatic: true })
];
World.add(world, walls);

// MZE GENERATION

const shuffle = (arr) => {
    let counter = arr.lenght;

    while (counter > 0) {
        const index = Math.floor(math.random() * counter);

        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
};

const grid = Array(cells).fill(null).map(() => Array(cells).fill(false));

const verticals = Array(cells).fill(null).map(() => Array(cells - 1).fill(false));

const horizontals = Array(cells - 1).fill(null).map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const maleek = (row, column) => {
    // if visited cell,return
    if (grid[row][column]) {
        return;
    }

    // mark as visited
    grid[row][column] = true;

    // Asemble randmly-ordrd neighbors
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);
    // for each neighbor
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;

        // see if that neighbor is out bounds
        if (nextRow < 0 || nextRow >= cells || nextColumn >= cells) {
            continue;
        }

        // if have visted thstb neighbr, continue next neighbor
        if (grid[nextRow][nextColumn]) {
            continue;
        }

        // remove a wall from either horiznytals  or verticals
        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        } else if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }
    }

    // visit that next  cell
};

maleek(startRow, startColumn);

horizontals.forEach(row => {
    row.forEach((open) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLenght + unitLenght / 2,
            rowIndex * unitLenght + unitLenght,
            unitLenght,
            10,
            {
                isStatic: true
            }
        );
        World.add(world, wall);
    });
});