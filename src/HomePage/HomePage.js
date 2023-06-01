import "./HomePage.css"

import { React, useContext, useState, useEffect } from "react"
import { Chessboard } from "react-chessboard"
import Chess from "chess.js"

export const HomePage = () => {
    const [game, setGame] = useState(new Chess());
    const [moveFrom, setMoveFrom] = useState("");
    const [rightClickedSquares, setRightClickedSquares] = useState({});
    const [moveSquares, setMoveSquares] = useState({});
    const [optionSquares, setOptionSquares] = useState({});
    const [orientation, setOrientation] = useState("")

    useEffect(
        () => {
            const randomOrientation = Math.floor(Math.random() * 2)
            if (randomOrientation === 1) {
                setOrientation("white")
            }
            else {
                setOrientation("black")
                makeRandomMove()
            }
        }, []
    )
    //.pgn() give game history
    // console.log(game.pgn())

    function safeGameMutate(modify) {
        setGame((g) => {
            const update = { ...g };
            modify(update);
            return update;
        });
    }

    function getMoveOptions(square) {
        const moves = game.moves({
            square,
            verbose: true,
        });
        if (moves.length === 0) {
            return false;
        }

        const newSquares = {};
        moves.map((move) => {
            newSquares[move.to] = {
                background:
                    game.get(move.to) && game.get(move.to).color !== game.get(square).color
                        ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
                        : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
                borderRadius: "50%",
            };
            return move;
        });
        newSquares[square] = {
            background: "rgba(255, 255, 0, 0.4)",
        };
        setOptionSquares(newSquares);
        return true;
    }

    function makeRandomMove() {
        const possibleMoves = game.moves();

        // exit if the game is over
        if (game.game_over() || game.in_draw() || possibleMoves.length === 0) return;

        const randomIndex = Math.floor(Math.random() * possibleMoves.length);
        safeGameMutate((game) => {
            game.move(possibleMoves[randomIndex]);
        });
    }

    function onSquareClick(square) {
        setRightClickedSquares({});

        function resetFirstMove(square) {
            const hasOptions = getMoveOptions(square);
            if (hasOptions) setMoveFrom(square);
        }

        // from square
        if (!moveFrom) {
            resetFirstMove(square);
            return;
        }

        // attempt to make move
        const gameCopy = { ...game };
        const move = gameCopy.move({
            from: moveFrom,
            to: square,
            promotion: "q", // always promote to a queen for example simplicity
        });
        setGame(gameCopy);

        // if invalid, setMoveFrom and getMoveOptions
        if (move === null) {
            resetFirstMove(square);
            return;
        }

        setTimeout(makeRandomMove, 300);
        setMoveFrom("");
        setOptionSquares({});
    }

    function onSquareRightClick(square) {
        const colour = "rgba(0, 0, 255, 0.4)";
        setRightClickedSquares({
            ...rightClickedSquares,
            [square]:
                rightClickedSquares[square] &&
                    rightClickedSquares[square].backgroundColor === colour
                    ? undefined
                    : { backgroundColor: colour },
        });
    }

    return (
        <div >
            <Chessboard
                id="ClickToMove"
                animationDuration={200}
                arePiecesDraggable={false}
                boardOrientation={orientation}
                position={game.fen()}
                onSquareClick={onSquareClick}
                onSquareRightClick={onSquareRightClick}
                customBoardStyle={{
                    borderRadius: "4px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                }}
                customSquareStyles={{
                    ...moveSquares,
                    ...optionSquares,
                    ...rightClickedSquares,
                }}
            />
            <button
                onClick={() => {
                    safeGameMutate((game) => {
                        game.reset();
                    });
                    setMoveSquares({});
                    setRightClickedSquares({});
                }}
            >
                reset
            </button>
            <button
                onClick={() => {
                    safeGameMutate((game) => {
                        game.undo();
                    });
                    setMoveSquares({});
                    setRightClickedSquares({});
                }}
            >
                undo
            </button>
        </div>
    );
}
