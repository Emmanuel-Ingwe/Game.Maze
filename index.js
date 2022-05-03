const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 7;
const cellsVertical = 7;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLenghtX = width / cellsHorizontal;
const unitLenghtY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
];
World.add(world, walls);

// MZE GENERATION

const shuffle = arr => {
    let counter = arr.lenght;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
};

const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsVertical - 1).fill(false));

const horizontals = Array(cellsHorizontal - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {
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
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn >= cellsHorizontal) {
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

        stepThroughCell(nextRow, nextColumn);
    }
};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLenghtX + unitLenghtX / 2,
            rowIndex * unitLenghtY + unitLenghtY,
            unitLenghtX,
            5,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'cyan'
                }
            }
        );
        World.add(world, wall);
    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLenghtX + unitLenghtX,
            rowIndex * unitLenghtY + unitLenghtY / 2,
            5,
            unitLenghtY,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'cyan'
                }
            }
        );
        World.add(world, wall);
    });
});

// GOAL!!
const goal = Bodies.rectangle(
    width - unitLenghtX / 2,
    height - unitLenghtY / 2,
    unitLenghtX * 0.7,
    unitLenghtY * 0.7,
    {
        label: 'goal',
        isStatic: true,
        render: {
            fillStyle: 'red'
        }
    }
);
World.add(world, goal);

// BALL

const ballRadius = Math.min(unitLenghtX, unitLenghtY) / 2;
const ball = Bodies.circle(
    unitLenghtX / 2,
    unitLenghtY / 2,
    ballRadius, {
    label: 'ball',
    render: {
        fillStyle: 'gray'
    }
});
World.add(world, ball);

document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;

    if (event.KeyCode === 87) {
        Body.setVelocity(ball, { x, y: y - 5 });
    }

    if (event.KeyCode === 68) {
        Body.setVelocity(ball, { x: x + 5, y });
    }

    if (event.KeyCode === 83) {
        Body.setVelocity(ball, { x, y: y + 5 });
    }

    if (event.KeyCode === 65) {
        Body.setVelocity(ball, { x: x - 5, y });
    }
});

// WIN CONDITION

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['ball', 'goal'];

        if (
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        ) {
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            });
        }
    });
});