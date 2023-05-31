// import "./HomePage.css"

// import { React, useContext, useState, useEffect } from "react"
// import {Chessboard} from "react-chessboard"
// import { Chess } from "chess.js"
// export const HomePage = () => {
//     const [game, setGame] = useState(new Chess())
//     const [moveFrom, setMoveFrom] = useState("")
//     const [optionSquares, setOptionSquares] = useState({});
//     const [moveSquares, setMoveSquares] = useState({});
//     // const makeMove = (move) => {
//     //     const gameCopy = { ...game }
//     //     const result = gameCopy.move(move)
//     //     setGame(gameCopy)
//     //     return result
//     // }
//     const getMoveOptions = (square) => {
//         const moves = game.moves({
//             square,
//             verbose: true
//         })
//         if (moves.length === 0) {
//             return false
//         }
//         const newSquares = {}
//         moves.map(move => {
//             newSquares[move.to] = {
//                 background:
//                     game.get(move.to) && game.get(move.to).color !== game.get(square).color
//                         ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
//                         : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
//                 borderRadius: "50%"
//             }
//             return move
//         })
//         newSquares[square] = {
//             background: "rgba(255, 255, 0, 0.4)"
//         }
//         setOptionSquares(newSquares)
//         return true
//     }
//     //use this function until you have server responses
//     function safeGameMutate(modify) {
//         setGame((g) => {
//             const update = { ...g };
//             modify(update);
//             return update;
//         });
//     }
//     // use this function until you have server responses
//     function makeRandomMove() {
//         const possibleMoves = game.moves();

//         // exit if the game is over
//         if (game.isCheckmate() || game.isDraw() || possibleMoves.length === 0) return;

//         const randomIndex = Math.floor(Math.random() * possibleMoves.length);
//         const gameCopy = new Chess(game.fen())
//         let move = gameCopy.move({
//             from: moveFrom,
//             to: possibleMoves[randomIndex],
//             promotion: "q"
//         })
//         setGame(gameCopy)
//         // safeGameMutate((game) => {
//         //     game.move(possibleMoves[randomIndex]);
//         // });
//     }
//     const onSquareClick = (square) => {
//         const resetFirstMove = (square) => {
//             const hasOptions = getMoveOptions(square);
//             if (hasOptions) setMoveFrom(square);
//         }
//         if (!moveFrom) {
//             resetFirstMove(square);
//             return;
//         }
//         // const gameCopy = { ...game } LINE BELOW IS CORRECT
//         const gameCopy = new Chess(game.fen())
//         let move = gameCopy.move({
//             from: moveFrom,
//             to: square,
//             promotion: "q"
//         })
//         setGame(gameCopy)
//         if (move === null) {
//             resetFirstMove(square);
//             return;
//         }
//         setTimeout(makeRandomMove, 300);
//         setMoveFrom("");
//         setOptionSquares({});
//         return true
//     }
//     // const onDrop = (sourceSquare, targetSquare) => {
//     //     const move = makeMove({
//     //         from: sourceSquare,
//     //         to: targetSquare,
//     //         promotion: "q"
//     //     })
//     //     if (move === null) return false;
//     //     // setTimeout()
//     //     return true
//     // }
//     return <>
//         <main id="homepageContainer">
//             <section>
//                 <Chessboard
//                     id="ClickToMove"
//                     position={game.fen()}
//                     animationDuration={200}
//                     arePiecesDraggable={false}
//                     onSquareClick={onSquareClick}
//                     customBoardStyle={{
//                         borderRadius: "4px",
//                         boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
//                     }}
//                     customSquareStyles={{
//                         ...moveSquares,
//                         ...optionSquares
//                     }}
//                 />
//             </section>
//         </main>
//     </>
// }
// import { useState } from "react";
// import { Chess } from "chess.js";
// import { Chessboard } from "react-chessboard";

// export const HomePage = () => {
//     const [game, setGame] = useState(new Chess());

//     function makeAMove(move) {
//         const gameCopy = { ...game };
//         console.log(game._board)
//         console.log(gameCopy)
//         const result = gameCopy.move(move);
//         setGame(gameCopy);
//         return result; // null if the move was illegal, the move object if the move was legal
//     }

//     function makeRandomMove() {
//         const possibleMoves = game.moves();
//         if (game.isCheckmate() || game.isDraw() || possibleMoves.length === 0) return; // exit if the game is over
//         const randomIndex = Math.floor(Math.random() * possibleMoves.length);
//         makeAMove(possibleMoves[randomIndex]);
//     }

//     function onDrop(sourceSquare, targetSquare) {
//         const move = makeAMove({
//             from: sourceSquare,
//             to: targetSquare,
//             promotion: "q", // always promote to a queen for example simplicity
//         });

//         // illegal move
//         if (move === null) return false;
//         setTimeout(makeRandomMove, 200);
//         return true;
//     }

//     return <Chessboard position={game.fen()} onPieceDrop={onDrop} />;
// }

import { useState,useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export const HomePage = () => {
    const [game, setGame] = useState(new Chess());
    const [squareToAlter, setSquareToAlter] = useState("")
    useEffect(
        () => {
            console.log(squareToAlter)
        },[squareToAlter]
    )

    return <Chessboard
        position={game.fen()}
        onSquareClick={evt => setSquareToAlter(evt)}
        /*onPieceDrop={onDrop}*/ />;
}
