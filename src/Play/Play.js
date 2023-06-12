import "./Play.css"

import { React, useContext, useState, useEffect } from "react"
import { Chessboard } from "react-chessboard"
import Chess from "chess.js"
import "./Play.css"
import { TournamentContext } from "../Tournament/TournamentProvider"
import { sendNewGame } from "../ServerManager"

export const Play = () => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    // const { localVillagerObj } = useContext(TournamentContext)
    const [game, setGame] = useState(new Chess());
    const [moveFrom, setMoveFrom] = useState("");
    const [rightClickedSquares, setRightClickedSquares] = useState({});
    const [moveSquares, setMoveSquares] = useState({});
    const [optionSquares, setOptionSquares] = useState({});
    const [orientation, setOrientation] = useState("")
    const [turnForPgn, updateTurnForPgn] = useState([])
    const [pgn, updatePgn] = useState([])
    const [pgnStr, updatePgnStr] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [gameForApi, updateGameForApi] = useState({
        player_w: 0,
        player_b: 0,
        // tournament: 0,
        // time_setting: 0,
        win_style: "",
        accepted: true,
        // tournament_round: null,
        winner: 0,
        // bye: false,
        computer_opponent: true,
        pgn: ""
    })

    //pgn variable needs to look like [[h3, Nh6], [f3, b6], etc]

    useEffect(
        () => {
            // console.log(turnForPgn)
        }, [turnForPgn]
    )
    useEffect(
        () => {
            const strPgn = pgnStringBuilder(pgn)
            updatePgnStr(strPgn)
            updateTurnForPgn([])
        }, [pgn]
    )

    // useEffect for setting up initial gameForAPI 
    // properties for game against computer opponent
    useEffect(
        () => {
            const randomOrientation = Math.floor(Math.random() * 2)
            if (randomOrientation === 1) {
                setOrientation("white")
                const copy = { ...gameForApi }
                copy.player_w = localVillagerObj.userId
                copy.player_b = null
                copy.computer_opponent = true
                updateGameForApi(copy)
            }
            else {
                setOrientation("black")
                const copy = { ...gameForApi }
                copy.player_b = localVillagerObj.userId
                copy.player_w = null
                copy.computer_opponent = true
                updateGameForApi(copy)
                makeRandomMove()
            }
        }, []
    )


    useEffect(
        () => {
            //AUTOMATICALLY ADD TURN NOTATION TO PGN ONCE TWO MOVES HAVE BEEN MADE
            if (turnForPgn.length === 2) {
                const copyOfPgn = [...pgn]
                copyOfPgn.push(turnForPgn)
                updatePgn(copyOfPgn)
            }
            // else {
            //     if (game.game_over()) {
            //         const copyOfPgn = [...pgn]
            //         copyOfPgn.push(turnForPgn)
            //         updatePgn(copyOfPgn)
            //     }
            // }
        }, [turnForPgn]
    )




    useEffect(
        () => {
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
                copy.pgn = pgnStr
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
    console.log(gameForApi)
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
    console.log(gameForApi)
    //function for automated move
    const makeRandomMove = () => {
        const possibleMoves = game.moves();
        // exit if the game is over
        if (game.game_over() || game.in_draw() || possibleMoves.length === 0) {
            if (game.game_over()) {
                if (orientation === "white") {
                    const copyOfPgn = [...pgn]
                    copyOfPgn.push(turnForPgn)
                    updatePgn(copyOfPgn)
                }
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
            updateTurnForPgn(computerTurnCopy)
        }
        //END CUSTOM


        safeGameMutate((game) => {
            game.move(possibleMoves[randomIndex]);
        });
    }
    const onSquareClick = (square) => {
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
    const onSquareRightClick = (square) => {
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



    // const pgnForSplitTest = [['d4', 'e6'],
    // ['Bf4', 'Qg5'],
    // ['Bxg5', 'a6'],
    // ['e4', 'c5'],
    // ['dxc5', 'g6'],
    // ['Bf6', 'd6'],
    // ['Bxh8', 'h6'],
    // ['cxd6', 'f6'],
    // ['Bxf6', 'Bd7'],
    // ['Be7', 'b6'],
    // ['Bxf8', 'Nf6'],
    // ['Be7', 'Nxe4'],
    // ['Qf3', 'Nf6'],
    // ['Qxf6', 'b5'],
    // ['Qf8#']]
    //turns pgn array into string for submitted game
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
    // console.log(pgnStringBuilder(pgnForSplitTest))
    // game.load_pgn(pgnStringBuilder(pgnForSplitTest))
    // console.log(pgn)
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
                <button
                    onClick={() => {
                        sendNewGame(gameForApi)
                    }}
                >
                    submit game
                </button>
            </div>
        </main>
    );
}
