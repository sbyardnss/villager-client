// import "./HomePage.css"

// import { React, useContext, useState, useEffect } from "react"
// import {Chessboard} from "react-chessboard"
// import { Chess } from "chess.js"
// export const HomePage = () => {
//     const [game, setGame] = useState(new Chess())
//     const [moveFrom, setMoveFrom] = useState("")
//     const [optionSquares, setOptionSquares] = useState({});
//     const [moveSquares, setMoveSquares] = useState({});
//     const [pieceToMove, setPieceToMove] = useState({})
//     const [move, setMove] = useState({
//         captured: "",
//         color: "",
//         flags: 0,
//         from: 0,
//         piece: "",
//         to: 0
//     })
//     useEffect(
//         () => {
//             if (move.piece && move.from && move.to) {

//             }
//         },[move]
//     )
//     useEffect(
//         () => {
//             console.log(game)
//             console.log(pieceToMove)
//         },[pieceToMove]
//     )
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
//     // use this function until you have server responses
//     // function safeGameMutate(modify) {
//     //     setGame((g) => {
//     //         const update = { ...g };
//     //         modify(update);
//     //         return update;
//     //     });
//     // }
//     // // use this function until you have server responses
//     // function makeRandomMove() {
//     //     const possibleMoves = game.moves({
//     //         verbose: true
//     //     });
//     //     // exit if the game is over
//     //     if (game.isCheckmate() || game.isDraw() || possibleMoves.length === 0) return;

//     //     const randomIndex = Math.floor(Math.random() * possibleMoves.length);
//     //     const gameCopy = new Chess(game.fen())
//     //     console.log(moveFrom.toString())

//     //     let move = gameCopy.handleSetPosition({
//     //         from: moveFrom,
//     //         to: possibleMoves[randomIndex],
//     //         promotion: "q"
//     //     })
//     //     setGame(gameCopy)
//     //     safeGameMutate((game) => {
//     //         game.move(possibleMoves[randomIndex]);
//     //     });
//     // }
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
//             console.log('here')
//             resetFirstMove(square);
//             return;
//         }
//         // setTimeout(makeRandomMove, 300);
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
//                     onPieceClick={evt => setPieceToMove(evt)}
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
//         const move = {
//             from: sourceSquare,
//             to: targetSquare,
//             promotion: "q", // always promote to a queen for example simplicity
//         };
//         makeAMove(move)
//         // illegal move
//         if (move === null) return false;
//         setTimeout(makeRandomMove, 200);
//         return true;
//     }

//     return <Chessboard position={game.fen()} onPieceDrop={onDrop} />;
// }

// import { useState,useEffect } from "react";
// import { Chess } from "chess.js";
// import { Chessboard } from "react-chessboard";

// export const HomePage = () => {
//     const [game, setGame] = useState(new Chess());
//     const [targetSquare, setTargetSquare] = useState("")
//     const [pieceToMove, setPieceToMove] = useState("")
//     useEffect(
//         () => {
//             // console.log(targetSquare.piece)
//             console.log(pieceToMove.square)
//             console.log()
//         },[targetSquare]
//     )
//     const gameCopy = {...game}
//     // const pgn = game.loadPgn(gameCopy)
//     // console.log(pgn)
//     // const makeMove = (square) => {
//     //     const move = {
//     //         from: 
//     //     }
//     // }
//     return <Chessboard

//         position={game.fen()}
//         onPieceClick={evt => setPieceToMove(evt)}
//         onSquareClick={evt => setTargetSquare(evt)}
//         showBoardNotation={true}
//         /*onPieceDrop={onDrop}*/ />;
// }

// import { useState } from "react";
// import { Chess } from "chess.js";
// import { Chessboard } from "react-chessboard";

// export const HomePage = () => {
//     const [game, setGame] = useState(new Chess());

//     function makeAMove(move) {
//         const gameCopy = { ...game };
//         const result = gameCopy.move(move);
//         setGame(gameCopy);
//         return result; // null if the move was illegal, the move object if the move was legal
//     }

//     function makeRandomMove() {
//         const possibleMoves = game.moves();
//         if (game.game_over() || game.in_draw() || possibleMoves.length === 0) return; // exit if the game is over
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



// import "./HomePage.css"

// import { React, useContext, useState, useEffect } from "react"
// import {Chessboard} from "react-chessboard"
// import { Chess } from "chess.js"
// export const HomePage = () => {
//     const [game, setGame] = useState(new Chess())
//     const [moveFrom, setMoveFrom] = useState("")
//     const [optionSquares, setOptionSquares] = useState({});
//     const [moveSquares, setMoveSquares] = useState({});
//     const [pieceToMove, setPieceToMove] = useState({})
//     const [move, setMove] = useState({
//         captured: "",
//         color: "",
//         flags: 0,
//         from: 0,
//         piece: "",
//         to: 0
//     })
//     useEffect(
//         () => {
//             if (move.piece && move.from && move.to) {

//             }
//         },[move]
//     )
//     useEffect(
//         () => {
//             // console.log(game)
//             // console.log(pieceToMove)
//         },[pieceToMove]
//     )
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
//         // setTimeout(makeRandomMove, 300);
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
//                     onPieceClick={evt => setPieceToMove(evt)}
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
