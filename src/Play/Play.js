import "./Play.css"

import { React, useContext, useState, useEffect } from "react"
import { Chessboard } from "react-chessboard"
import Chess from "chess.js"
import "./Play.css"

export const Play = () => {
    const [game, setGame] = useState(new Chess());
    const [moveFrom, setMoveFrom] = useState("");
    const [rightClickedSquares, setRightClickedSquares] = useState({});
    const [moveSquares, setMoveSquares] = useState({});
    const [optionSquares, setOptionSquares] = useState({});
    const [orientation, setOrientation] = useState("")
    // const [turnForPgn, updateTurnForPgn] = useState({
    //     white: "",
    //     black: ""
    // })
    const [turnForPgn, updateTurnForPgn] = useState([])
    const [pgn, updatePgn] = useState([])
    const [isLoading, setIsLoading] = useState(false)


    //pgn variable needs to look like [[h3, Nh6], [f3, b6], etc]

    useEffect(
        () => {
            console.log(turnForPgn)
        }, [turnForPgn]
    )


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


    useEffect(
        () => {
            //AUTOMATICALLY ADD TURN NOTATION TO PGN ONCE TWO MOVES HAVE BEEN MADE
            //for array version of turnForPgn
            if (turnForPgn.length === 2) {
                const copyOfPgn = [...pgn]
                copyOfPgn.push(turnForPgn)
                updatePgn(copyOfPgn)
            }
            //for obj version of turnForPgn
            // if (turnForPgn.white && turnForPgn.black) {
            //     const copyOfPgn = [...pgn]
            //     copyOfPgn.push([turnForPgn.white, turnForPgn.black])
            //     updatePgn(copyOfPgn)
            //     console.log('getting here')
            // }
        }, [turnForPgn]
    )


    useEffect(
        () => {
            updateTurnForPgn([])
            // updateTurnForPgn({
            //     white: "",
            //     black: ""
            // })
        }, [pgn]
    )
    
    useEffect(
        () => {
            if (orientation === "white") {
                if (turnForPgn.length === 1) {
                    setTimeout(makeRandomMove, 300)
                }
            }
            
        },[turnForPgn]
    )
    // updates board in ui 
    function safeGameMutate(modify) {
        setGame((g) => {
            const update = { ...g };
            modify(update);
            return update;
        });
    }
    //adds visualization of available moves for selected piece
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
    //function for automated move
    function makeRandomMove() {
        const possibleMoves = game.moves();
        // exit if the game is over
        if (game.game_over() || game.in_draw() || possibleMoves.length === 0) {
            // game.game_over() ? console.log("won by checkmate") : game.in_draw() ? console.log("game is a draw") : possibleMoves.length === 0 ? console.log("no moves available") : null
            if (game.game_over()) {
                console.log("won by checkmate")
            }
            if (game.in_draw()) {
                console.log("draw")
            }
            if (possibleMoves.length === 0) {
                console.log('no more moves. draw')
            }
            return;
        }
        const randomIndex = Math.floor(Math.random() * possibleMoves.length);


        //CUSTOM
        //add move to turn array to load into pgn
        //for array version of turnForPgn
        if (possibleMoves[randomIndex]) {
            const computerTurnCopy = [...turnForPgn]
            
            computerTurnCopy.push(possibleMoves[randomIndex])
            console.log(computerTurnCopy)
            // console.log('computer move')
            updateTurnForPgn(computerTurnCopy)
        }
        // if (possibleMoves[randomIndex]) {
        //     const computerTurnCopy = { ...turnForPgn }
        //     console.log(turnForPgn)
        //     if (orientation === "white") {
        //         computerTurnCopy.black = possibleMoves[randomIndex]
        //     }
        //     else {
        //         computerTurnCopy.white = possibleMoves[randomIndex]
        //     }
            // console.log('computer move')
        //     updateTurnForPgn(computerTurnCopy)
        // }
        //END CUSTOM


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


        //CUSTOM
        //add move to turn array to load into pgn
        //for array version of turnForPgn
        if (move) {
            const turnCopy = [...turnForPgn]
            turnCopy.push(move.san)
            // console.log('my move')
            updateTurnForPgn(turnCopy)
        }

        //for obj version of turnForPgn
        // if (move) {
        //     const computerTurnCopy = { ...turnForPgn }
        //     // if (computerTurnCopy.white) {
        //     //     computerTurnCopy.black = move.san
        //     //     updateTurnForPgn(computerTurnCopy)
        //     // }
        //     // else {
        //     //     computerTurnCopy.white = move.san
        //     //     updateTurnForPgn(computerTurnCopy)
        //     // }
        //     if (orientation === "white") {
        //         computerTurnCopy.white = move.san
        //     }
        //     else {
        //         computerTurnCopy.black = move.san
        //     }
        //     // console.log('computer move')
        // }
        //END CUSTOM

        
        setGame(gameCopy);
        // if invalid, setMoveFrom and getMoveOptions
        if (move === null) {
            resetFirstMove(square);
            return;
        }
        // setTimeout(makeRandomMove, 300);
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
    // const testPgn = game.pgn()
    // const split = testPgn.split(" ")
    // console.log(split)
    // const pgnArray = []
    
    // // console.log(split)
    // //CURRENTLY CAUSING MY APP TO CRASH
    // const grabMovesFromPGN = () => {
    //     //.pgn() give game history
    //     const pgn = game.pgn()
    //     const splitBySpacesInitial = pgn?.split(" ")
    //     // console.log(splitBySpacesInitial)
    //     const pgnArray = []
    //     for (let i = 0; i <= splitBySpacesInitial.length; i + 3) {
    //         const joinedMoveTurn = [splitBySpacesInitial[i], splitBySpacesInitial[i + 1], splitBySpacesInitial[i + 2]]
    //         pgnArray.push(joinedMoveTurn)
    //     }
    //     return pgnArray
    // }
    // const pgnArr = grabMovesFromPGN()
    return (
        <main id="playContainer">
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
        </main>
    );
}
