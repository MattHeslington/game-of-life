import { useCallback, useEffect, useRef, useState } from 'react';
import { Slider } from '@mantine/core';
import produce from 'immer'

const numRows = 40
const numCols = 63

const operations = [
    [0,1],
    [0,-1],
    [1,-1],
    [-1,1],
    [1,1],
    [-1,-1],
    [1,0],
    [-1,0],
]

const clearGrid = () => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
        rows.push(Array.from(Array(numCols), () => 0))
    }
    return rows
}

const App = () => {

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
    },[])


    return (
        <div className="w-screen h-screen flex flex-col bg-gray-900">
            <div className="h-16 px-11 flex justify-end items-center bg-gray-800">
                <div className="flex flex-col">
                    <div className="text-white tracking-tight font-bold text-sm uppercase text-right">george conway's</div>
                    <div className="text-white tracking-tight font-bold text-sm uppercase text-right">game of life</div>
                </div>
            </div>
            <main className="p-11 h-full w-full flex flex-row">
                <div
                    className="w-full h-full bg-gray-800 rounded gridcontainer"
                    style={{display: "grid",gridTemplateColumns: `repeat(${numCols}, 20px)`}}
                >
                    {grid && grid.map((rows, i) => rows.map((col, k) =>
                        <div
                            key={`${i}-${k}`}
                            onClick={() => {
                                const newGrid = produce(grid, gridCopy => {
                                    gridCopy[i][k] = grid[i][k] ? 0 : 1;
                                })
                                setGrid(newGrid)
                            }}
                            className={`w-5 h-5 border border-black ${grid[i][k] ? 'bg-pink-400' : undefined}`}/>
                    ))}
                </div>
                <div className="w-72 flex flex-col h-full space-y-12 items-center ml-11">
                    <p className="text-center font-light text-sm text-gray-400">
                        The Game of Life is a cellular automaton devised by Dr John Conway in 1970. The game is a zero-player game, meaning that its evolution is determined by its initial state. One interacts with the Game of Life by creating an initial configuration and observing how it evolves.
                    </p>
                    <button
                        onClick={() => {setRunning(!running)
                            if (!running) {
                                runningRef.current = true;
                                runSimulation();
                            }
                        }}
                        className="h-12 w-48 flex items-center justify-center rounded bg-blue-600 text-white font-medium">
                            {running ? 'stop' : 'start'}
                    </button>
                    <button
                        onClick={randomiseGrid}
                        className="h-12 w-48 flex items-center justify-center rounded bg-blue-600 text-white font-medium">
                            randomise
                    </button>
                    <button
                        onClick={() => {setGrid(clearGrid())}}
                        className="h-12 w-48 flex items-center justify-center rounded bg-blue-600 text-white font-medium">
                            clear
                    </button>
                    <div className="w-72">
                        <div className="text-sm text-center uppercase font-light text-gray-400 mb-10">set interval</div>
                        <Slider
                            min={1}
                            max={100}
                            step={1}
                            defaultValue={50}
                            labelAlwaysOn
                            value={value}
                            onChange={setValue}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
