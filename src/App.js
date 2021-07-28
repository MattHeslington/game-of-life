import { useCallback, useEffect, useRef, useState } from 'react';
import { Slider } from '@mantine/core';
import produce from 'immer'

const gridSize = 20;

const operations = [
    [0,1],
    [0,-1],
    [1,-1],
    [-1,1],
    [1,1],
    [-1,-1],
    [1,0],
    [-1,0],
];

function App() {

    let width;
    let height;
    let numRows;
    let numCols;

    if (document.readyState === 'complete') {
        let gc = document.querySelector('.gridcontainer');
        width = gc.offsetWidth
        height = gc.offsetHeight

        let useableCols = (width / gridSize);
        let useableRows = (height / gridSize);
        numRows = Math.round(useableRows);
        numCols = Math.round(useableCols);
    }

    const clearGrid = () => {
        const rows = [];
        for (let i = 0; i < numRows; i++) {
            rows.push(Array.from(Array(numCols), () => 0))
        }
        return rows
    }

    const [value, setValue] = useState(50);

    const [grid, setGrid] = useState(() => {
        return clearGrid()
    })

    const [running, setRunning] = useState(false)

    const runningRef = useRef(running)
    runningRef.current = running;

    const randomiseGrid = () => {
        const rows = [];
        for (let i = 0; i < numRows; i++) {
            rows.push(Array.from(Array(numCols), () => Math.random() > 0.7 ? 1 : 0))
        }
        setGrid(rows);
    }

    const runSimulation = useCallback(() => {
        if (!runningRef.current) {
            return;
        }

        setGrid((g) => {
            return produce(g, gridCopy => {
                for (let i = 0; i < numRows; i++) {
                    for (let k = 0; k < numCols; k++) {
                        let neighbours = 0;

                        operations.forEach(([x,y]) => {
                            const newI = i + x;
                            const newK = k + y;

                            // check if out of bounds
                            if (newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {
                                neighbours += g[newI][newK]
                            }
                        })

                        // apply rules
                        if (neighbours < 2 || neighbours > 3) {
                            gridCopy[i][k] = 0;
                        } else if (g[i][k] === 0 && neighbours === 3) {
                            gridCopy[i][k] = 1;
                        }
                    }
                }
            })
        })

        setTimeout(runSimulation, 100)
    },[numCols, numRows])

    useEffect(() => {
        console.log("numCols: ", numCols)
        console.log("numRows: ", numRows)
    }, [numCols,numRows])
    return (
        <div className="flex flex-col w-screen h-screen bg-white">
            <div className="flex items-center justify-end h-16 bg-white px-11">
                <div className="flex items-center justify-center text-sm font-bold tracking-tight text-right text-black uppercase w-72">george conway's game of life</div>
            </div>
            <main className="flex flex-row w-full h-full p-11">
                <div
                    className="w-full h-full bg-gray-100 rounded gridcontainer"
                    style={{display: "grid",gridTemplateColumns: `repeat(${numCols}, 20px)`}}
                >
                    {grid.map((rows, i) => rows.map((col, k) =>
                        <div
                            key={`${i}-${k}`}
                            onClick={() => {
                                const newGrid = produce(grid, gridCopy => {
                                    gridCopy[i][k] = grid[i][k] ? 0 : 1;
                                })
                                setGrid(newGrid)
                            }}
                            className={`w-5 h-5 border border-gray-300 ${grid[i][k] ? 'bg-black' : undefined}`}/>
                    ))}
                </div>
                <div className="flex flex-col items-center h-full space-y-12 w-72 ml-11">
                    <div>
                        <h3 className="text-sm text-center text-gray-700 uppercase">rules (how things evolve)</h3>
                        <ul className="flex flex-col mt-4 space-y-4">
                            <li className="text-sm font-light text-center text-gray-600">Any live cell with fewer than two or more than three live neighbours dies</li>
                            <li className="text-sm font-light text-center text-gray-600">Any dead cell with exactly three live neighbours becomes a live cell</li>
                        </ul>
                    </div>
                    <button
                        onClick={() => {setRunning(!running)
                            if (!running) {
                                runningRef.current = true;
                                runSimulation();
                            }
                        }}
                        className="flex items-center justify-center w-48 h-12 font-medium text-white bg-gray-500 rounded">
                            {running ? 'stop' : 'start'}
                    </button>
                    <button
                        onClick={randomiseGrid}
                        className="flex items-center justify-center w-48 h-12 font-medium text-white bg-gray-500 rounded">
                            randomise
                    </button>
                    <button
                        onClick={() => {setGrid(clearGrid())}}
                        className="flex items-center justify-center w-48 h-12 font-medium text-white bg-gray-500 rounded">
                            clear
                    </button>
                    <div className="w-72">
                        <div className="mb-10 text-sm font-light text-center text-gray-600 uppercase">set interval</div>
                        <Slider
                            min={1}
                            max={100}
                            step={1}
                            color="gray"
                            defaultValue={50}
                            labelAlwaysOn
                            value={value}
                            onChange={setValue}
                        />
                    </div>
                    <p className="text-sm font-light text-center text-gray-600">
                        The Game of Life is a cellular automaton devised by Dr John Conway in 1970. The game is a zero-player game, meaning that its evolution is determined by its initial state. One interacts with the Game of Life by creating an initial configuration and observing how it evolves.
                    </p>
                </div>
            </main>
        </div>
    );
}

export default App;