import "./Play.css"

import { React, useContext, useState, useEffect } from "react"
import { Chessboard } from "react-chessboard"
import Chess from "chess.js"
import "./Play.css"
import { alterGame, getAIMove, sendNewGame } from "../ServerManager"
import { PlayContext } from "./PlayProvider"
import { useNavigate } from "react-router-dom"

export const Play = () => {
    //update game obj based on selectedGameObj or simply populate computer opponent
    //update selectedGameObj and send to api when a move is made
    //make turns based on game.turn()

    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    const navigate = useNavigate()
    const { selectedGame, setSelectedGame, selectedGameObj, orientation, setOrientation, resetGames, review, setReview } = useContext(PlayContext)
    const [game, setGame] = useState(new Chess());
    const [moveFrom, setMoveFrom] = useState("");
    const [moveSquares, setMoveSquares] = useState({});
    const [optionSquares, setOptionSquares] = useState({});
    const [turnForPgn, updateTurnForPgn] = useState([])
    const [reviewPgn, setReviewPgn] = useState([])
    const [reviewLength, setReviewLength] = useState(0)
    const [matchReady, setMatchReady] = useState(false)
    const [gameForApi, updateGameForApi] = useState({
        player_w: 0,
        player_b: 0,
        win_style: "",
        accepted: true,
        winner: null,
        computer_opponent: true,
        tournament: null,
        tournament_round: null,
        timeSetting: null,
        pgn: ""
    })
    //set up game based on whether it is against human or computer
    //USE EFFECT CURRENTLY RUNNING BEFORE SELECTEDGAMEOBJ RETRIEVED 
    const leaveGame = (e) => {
        if (document.getElementById("navMenu")?.contains(e.target)) {
            if (e.target.id !== "navMenu" && e.target.id !== "navLinks" && e.target.id !== "logo") {
                setSelectedGame(0)
                setReview(false)
                navigate(e.target.id)
            }
        }

        if (e.target.id === "logout") {
            setSelectedGame(0)
            setReview(false)
            localStorage.removeItem("villager")
            navigate("/", { replace: true })
        }

    }
    document.addEventListener('click', leaveGame)
    console.log(gameForApi)
    useEffect(
        () => {
            if (selectedGame) {
                if (selectedGameObj.pgn) {
                    game.load_pgn(selectedGameObj.pgn)
                }
                const copy = { ...selectedGameObj }
                copy.player_b = selectedGameObj.player_b.id
                copy.player_w = selectedGameObj.player_w.id
                updateGameForApi(copy)
                setMatchReady(true)
            }
            else {
                if (orientation === "black") {
                    const copy = { ...gameForApi }
                    copy.player_b = localVillagerObj.userId
                    copy.player_w = null
                    copy.computer_opponent = true
                    updateGameForApi(copy)
                }
                else {
                    const copy = { ...gameForApi }
                    copy.player_w = localVillagerObj.userId
                    copy.player_b = null
                    copy.computer_opponent = true
                    updateGameForApi(copy)
                }
            }
        }, [orientation]
    )
    useEffect(
        () => {
            if (matchReady) {
                if (selectedGame === 0) {
                    if (orientation === "white") {
                        if (game.turn() === "b") {
                            setTimeout(makeRandomMove, 300)
                        }
                    }
                    if (orientation === "black") {
                        if (game.turn() === "w") {
                            setTimeout(makeRandomMove, 300)
                        }
                    }
                }
            }
        }, [game, matchReady]
    )

    // useEffect for updating gameForAPI at end of game 
    // against computer opponent

    useEffect(
        () => {
            if (selectedGameObj) {
                if (selectedGameObj.winner === null) {
                    if (game.game_over()) {
                        const copy = { ...gameForApi }
                        copy.pgn = game.pgn()
                        if (game.turn() === "b") {
                            copy.winner = selectedGameObj.player_w.id
                        }
                        else {
                            copy.winner = selectedGameObj.player_b.id
                        }
                        if (game.in_checkmate()) {
                            copy.win_style = "checkmate"
                            console.log("this useEffect worked")
                        }
                        else {
                            copy.win_style = "draw"
                        }
                        updateGameForApi(copy)
                        if (selectedGameObj) {
                            alterGame(copy)
                        }
                    }
                }
            }
        }, [game]
    )
    useEffect(
        () => {
            if (review === true) {
                const pgnArr = grabMovesFromPGN()
                setReviewPgn(pgnArr)
            }
        }, [game]
    )
    useEffect(
        () => {
            const length = reviewPgn.length
            setReviewLength(length)
        }, [reviewPgn]
    )
    //function for populating start game prompt window
    //only for non human opponents
    const checkWarning = () => {
        if (!selectedGameObj) {
            if (game.in_check()) {
                return (
                    <div>check</div>
                )
            }
            if (game.game_over() && game.in_checkmate()) {
                return (
                    <div id="checkmatePrompt">
                        <div>checkmate</div>
                        <button onClick={() => {
                            setSelectedGame(0)
                            navigate("/")
                        }}>
                            exit game
                        </button>
                    </div>
                )
            }
        }
    }
    const clickStartPrompt = () => {
        if (selectedGame === 0) {
            if (matchReady) {
                return null
            }
            else {
                return (
                    <div id="clickStartPrompt"
                        onClick={() => setMatchReady(true)}>
                        <div>Start Game</div>
                    </div>
                )
            }
        }
    }
    //function for populating reset button only if game is against computer
    const resetOrStartGame = () => {
        if (selectedGame === 0) {
            if (matchReady) {
                return (
                    <div>
                        <button onClick={() => {
                            safeGameMutate((game) => {
                                game.reset();
                            });
                            setMoveSquares({});
                        }}
                        >reset</button>
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
                )
            }
            else {
                return null
            }
        }
        else {
            return (
                <div>
                    <button className="reviewButtons"
                        onClick={() => {
                            const newLength = reviewLength - 1
                            const reviewCopy = [...reviewPgn]
                        }}>&lt;</button>
                    <button className="reviewButtons"
                        onClick={() => {
                            const newLength = reviewLength + 1
                            const reviewCopy = [...reviewPgn]
                        }}>&gt;</button>
                </div>
            )
        }
    }

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
    const grabMovesFromPGN = () => {
        //.pgn() give game history
        const pgn = game.pgn()
        const splitBySpacesInitial = pgn?.split(" ")
        // console.log(splitBySpacesInitial)
        const pgnArray = []
        for (let i = 0; i <= splitBySpacesInitial.length; i = i + 3) {
            const joinedMoveTurn = [splitBySpacesInitial[i], splitBySpacesInitial[i + 1], splitBySpacesInitial[i + 2]]
            pgnArray.push(joinedMoveTurn)
        }
        return pgnArray
    }
    // four functions below are for game mechanics. mostly provided by react-chessboard
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
            let [, notation] = res.split(" ")
            if (notation) {
                //OLD CODE WHEN TURNFORPGN WAS MAIN DRIVER
                // const turnCopy = [...turnForPgn]
                // turnCopy.push(notation)
                // updateTurnForPgn(turnCopy)
                safeGameMutate((game) => {
                    game.move(notation)
                })
            }
        })
        //CUSTOM (OLD CODE FOR NON AI BOT)
        //add move to turn array to load into pgn
        // for array version of turnForPgn
        // if (possibleMoves[randomIndex]) {
        //     const computerTurnCopy = [...turnForPgn]
        //     computerTurnCopy.push(possibleMoves[randomIndex])
        //     updateTurnForPgn(computerTurnCopy)
        // }
        //END CUSTOM


        // safeGameMutate((game) => {
        //     game.move(possibleMoves[randomIndex]);
        // });
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
        // if (move) {
        //     const turnCopy = [...turnForPgn]
        //     turnCopy.push(move.san)
        //     updateTurnForPgn(turnCopy)
        // }
        setGame(gameCopy);
        // if invalid, setMoveFrom and getMoveOptions
        if (move === null) {
            resetFirstMove(square);
            return;
        }
        setMoveFrom("");
        setOptionSquares({});
    }
    return (
        <main id="playContainer">
            {clickStartPrompt()}
            {checkWarning()}
            <div >
                <Chessboard
                    id="ClickToMove"
                    animationDuration={200}
                    arePiecesDraggable={false}
                    boardOrientation={orientation}
                    position={game.fen()}
                    onSquareClick={(evt) => {
                        if (matchReady) {
                            onSquareClick(evt)
                            if (selectedGameObj?.id) {
                                const gameCopy = { ...selectedGameObj }
                                const newPgn = game.pgn()
                                gameCopy.pgn = newPgn
                                alterGame(gameCopy)
                                    .then(() => resetGames())
                            }
                        }
                    }}
                    customBoardStyle={{
                        borderRadius: "4px",
                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                    }}
                    customSquareStyles={{
                        ...moveSquares,
                        ...optionSquares,
                    }}
                />
                <div id="playControls">
                    {resetOrStartGame()}
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

                    {/* <button
                    onClick={() => {
                        const copy = { ...gameForApi }
                        copy.pgn = game.pgn()
                        sendNewGame(copy)
                    }}
                >
                    submit game
                </button> */}
                    <button onClick={() => {
                        setSelectedGame(0)
                        navigate("/")
                    }}>
                        exit game
                    </button>
                </div>
            </div>
        </main>
    );
}
