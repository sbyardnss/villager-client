import "./Play.css"

import { React, useContext, useState, useEffect } from "react"
import { Chessboard } from "react-chessboard"
import Chess from "chess.js"
import "./Play.css"
import { TournamentContext } from "../Tournament/TournamentProvider"
import { getAIMove, sendNewGame } from "../ServerManager"

export const Play = () => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    // const { localVillagerObj } = useContext(TournamentContext)
    const [game, setGame] = useState(new Chess());
    const [moveFrom, setMoveFrom] = useState("");
    const [rightClickedSquares, setRightClickedSquares] = useState({});
    const [moveSquares, setMoveSquares] = useState({});
    const [optionSquares, setOptionSquares] = useState({});
    const [orientation, setOrientation] = useState("white")
    const [turnForPgn, updateTurnForPgn] = useState([])
    const [pgn, updatePgn] = useState([])
    // const [pgnStr, updatePgnStr] = useState("")
    const [gameForApi, updateGameForApi] = useState({
        player_w: 0,
        player_b: 0,
        win_style: "",
        accepted: true,
        winner: 0,
        computer_opponent: true,
        pgn: ""
    })

    // useEffect for setting up initial gameForAPI 
    // properties for game against computer opponent.     
    useEffect(
        () => {
            // const randomOrientation = Math.floor(Math.random() * 2)
            // if (randomOrientation === 1) {
            // setOrientation("white")
            const copy = { ...gameForApi }
            copy.player_w = localVillagerObj.userId
            copy.player_b = null
            copy.computer_opponent = true
            updateGameForApi(copy)

            // }
            // else {
            //     // setOrientation("black")
            //     const copy = { ...gameForApi }
            //     copy.player_b = localVillagerObj.userId
            //     copy.player_w = null
            //     copy.computer_opponent = true
            //     updateGameForApi(copy)
            //     const aiObjCopy = {...objForAi}
            //     aiObjCopy.color = "white"
            //     updateObjForAi(aiObjCopy)
            //     makeRandomMove()
            // }
        }, []
    )

    //AUTOMATICALLY ADD TURN NOTATION TO PGN ONCE TWO MOVES HAVE BEEN MADE
    useEffect(
        () => {
            if (turnForPgn.length === 2) {
                const copyOfPgn = [...pgn]
                copyOfPgn.push(turnForPgn)
                updatePgn(copyOfPgn)
                updateTurnForPgn([])
            }
            if (game.in_checkmate()) {
                if (turnForPgn.length === 1) {
                    const copyOfPgn = [...pgn]
                    copyOfPgn.push(turnForPgn)
                    updatePgn(copyOfPgn)
                }
            }
        }, [turnForPgn, game]
    )
    useEffect(
        () => {
            updateTurnForPgn([])
        }, [pgn]
    )


    //automatically make computer moves based on which players turn it is
    //and the state of the turnForPgn variable
    useEffect(
        () => {
            // if (turnForPgn.length === 1) { //remove this if when you set orientation back to random
            //     setTimeout(makeRandomMove, 300)
            // }
            if (orientation === "white") {
                if (turnForPgn.length === 1) {
                    setTimeout(makeRandomMove, 300)
                }
            }
            if (orientation === "black") {
                if (turnForPgn.length === 0) {
                    setTimeout(makeRandomMove, 300)
                }
            }
        }, [turnForPgn]
    )
    // useEffect for updating gameForAPI at end of game 
    // against computer opponent
    useEffect(
        () => {
            if (game.game_over()) {
                const copy = { ...gameForApi }
                copy.pgn = game.pgn()
                if (game.turn() === "b") {
                    copy.winner = localVillagerObj.userId
                }
                if (game.in_checkmate()) {
                    copy.win_style = "checkmate"
                }
                else {
                    copy.win_style = "draw"
                }
                updateGameForApi(copy)
            }
        }, [game]
    )
    // updates board in ui 
    const safeGameMutate = (modify) => {
        setGame((g) => {
            const update = { ...g };
            modify(update);
            return update;
        });
    }
    //adds visualization of available moves for selected piece
    const getMoveOptions = (square) => {
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
    const makeRandomMove = () => {
        const possibleMoves = game.moves();
        // exit if the game is over
        if (game.game_over() || game.in_draw() || possibleMoves.length === 0) {
            if (game.game_over()) {
                updatePgn(game.pgn())
                console.log(gameForApi)
            }
            if (game.in_draw()) {
                console.log("draw")
            }
            if (possibleMoves.length === 0) {
                console.log("no more moves. draw")
            }
            return;
        }
        //basic operation relies on random index for making move.
        //this can be the point at which ai decides
        const randomIndex = Math.floor(Math.random() * possibleMoves.length);
        const gameAiColor = orientation === "white" ? "black" : 'white'
        const gamePgn = game.pgn()
        const gameFen = game.fen()
        const gameMoves = game.moves()
        const gameForAiCopy = {
            fen: gameFen,
            pgn: gamePgn,
            color: gameAiColor,
            possibleMoves: gameMoves
        }
        Promise.resolve(getAIMove(gameForAiCopy)).then(res => {
            let [move, notation] = res.split(" ")
            if (notation) {
                console.log(notation)
                const turnCopy = [...turnForPgn]
                turnCopy.push(notation)
                updateTurnForPgn(turnCopy)
                safeGameMutate((game) => {
                    game.move(notation)
                })
            }
        })
    }
    const onSquareClick = (square) => {
        // setRightClickedSquares({});
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
        //add move to turn array to load into pgn
        //for array version of turnForPgn
        if (move) {
            console.log(move)
            const turnCopy = [...turnForPgn]
            turnCopy.push(move.san)
            // console.log('my move')
            updateTurnForPgn(turnCopy)
        }
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


    // // console.log(split)
    // //CURRENTLY CAUSING MY APP TO CRASH
    // const grabMovesFromPGN = () => {
    //     //.pgn() give game history
    //     const pgn = game.pgn()
    //     const splitBySpacesInitial = pgn?.split(" ")
    //     // console.log(splitBySpacesInitial)
    //     const pgnArray = []
    //     for (let i = 0; i <= splitBySpacesInitial.length; i = i + 3) {
    //         const joinedMoveTurn = [splitBySpacesInitial[i], splitBySpacesInitial[i + 1], splitBySpacesInitial[i + 2]]
    //         pgnArray.push(joinedMoveTurn)
    //     }
    //     return pgnArray
    // }
    // const pgnArr = grabMovesFromPGN()
    const pgnStringBuilder = (pgnArr, index) => {
        const outputPgnString = pgnArr.map((notation, index) => {
            if (notation.length === 2) {
                return `${index + 1}. ${notation[0]} ${notation[1]}`
            }
            else {
                return `${index + 1}. ${notation[0]}`
            }
        }).join(" ")
        return outputPgnString
    }


    return (
        <main id="playContainer">
            <div >
                <Chessboard
                    id="ClickToMove"
                    animationDuration={200}
                    arePiecesDraggable={false}
                    boardOrientation={"white"}
                    // boardOrientation={orientation}

                    position={game.fen()}
                    onSquareClick={onSquareClick}
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
                    }}
                >
                    undo
                </button>
                <button
                    onClick={() => {
                        const copy = { ...gameForApi }
                        copy.pgn = game.pgn()
                        sendNewGame(copy)
                    }}
                >
                    submit game
                </button>
            </div>
        </main>
    );
}
