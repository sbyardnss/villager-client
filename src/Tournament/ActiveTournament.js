import { useState, useEffect, useContext, useRef } from "react"
import { TournamentContext } from "./TournamentProvider"
import { alterGame, endTournament, getAllGames, getAllPlayers, getAllTournaments, sendNewGame, sendNewTournament, sendTournamentRoundOutcomes, sendUpdatedGames, updateTournament } from "../ServerManager"
import "./Tournament.css"


export const ActiveTournament = () => {
    const { tournaments, setTournaments, players, timeSettings, tournamentGames, selectedTournament, setSelectedTournament, resetTournamentGames } = useContext(TournamentContext)
    //initial setup state variables
    const [activeTournament, setActiveTournament] = useState({})
    const [activeTournamentPlayers, setActiveTournamentPlayers] = useState([])
    const [currentRoundMatchups, setCurrentRoundMatchups] = useState([])

    //managing tournament state variables
    const [currentRound, setCurrentRound] = useState(0)
    const [scoring, setScoring] = useState(true)
    const [editScores, setEditScores] = useState(false)

    //tournament process state variables
    const [resultsForTieBreak, updateResultsForTieBreak] = useState([])
    const [byePlayer, setByePlayer] = useState(0)

    //prepping data for api state variables
    const [gameForApi, updateGameForApi] = useState({
        player_w: 0,
        player_b: 0,
        tournament: 0,
        time_setting: 0,
        win_style: "",
        accepted: true,
        tournament_round: 0,
        winner: 0,
        bye: false
    })
    const [byeGame, setByeGame] = useState({
        player_w: 0,
        player_b: null,
        tournament: 0,
        time_setting: 0,
        win_style: "",
        accepted: true,
        tournament_round: 0,
        winner: 0,
        bye: true
    })

    useEffect(
        () => {
            const selectedTournamentObj = tournaments?.find(t => t.id === selectedTournament)
            setActiveTournament(selectedTournamentObj)
        }, [selectedTournament, tournaments]
    )
    useEffect(
        () => {
            const playersForSelectedTournament = players.filter(p => activeTournament?.competitors?.find(c => c === p.id))
            setActiveTournamentPlayers(playersForSelectedTournament)
            const copy = { ...gameForApi }
            copy.tournament = activeTournament?.id
            copy.time_setting = activeTournament?.time_setting
            copy.tournament_round = activeTournament?.rounds
            updateGameForApi(copy)

        }, [activeTournament]
    )
    useEffect(
        () => {
            if (activeTournament) {
                setCurrentRound(activeTournament.rounds)
            }
        }, [activeTournament]
    )
    useEffect(
        () => {
            if (activeTournament) {
                const currentRoundPairings = activeTournament.pairings?.filter(p => p.round === currentRound)
                {
                    //ensures that null value on matchup indicating bye player is restricted to player2 variable
                    currentRoundPairings?.map(pairing => {
                        if (pairing.player1 === null) {
                            pairing.player1 = pairing.player2
                            pairing.player2 = null
                        }
                    })
                }
                setCurrentRoundMatchups(currentRoundPairings)
                const copy = { ...gameForApi }
                copy.tournament_round = currentRound
                updateGameForApi(copy)
                //creates bye game in the event of uneven number of players in tournament. will send bye game to api when moving to next round
                const byePairing = currentRoundPairings?.find(pairing => pairing.player2 === null)
                if (byePairing) {
                    const byeCopy = { ...gameForApi }
                    byeCopy.player_b = null
                    byeCopy.player_w = byePairing.player1
                    byeCopy.winner = byePairing.player1
                    byeCopy.bye = true
                    byeCopy.win_style = ""
                    setByeGame(byeCopy)
                    setByePlayer(byePairing.player1)
                }
            }
        }, [currentRound]
    )
    useEffect(
        () => {
            const resultsForTieBreak = []
            {
                tournamentGames.map(tg => {
                    const gameResult = {}
                    gameResult.white = tg.player_w
                    gameResult.black = tg.player_b
                    gameResult.winner = tg.winner
                    gameResult.win_style = tg.win_style
                    gameResult.round = tg.tournament_round
                    resultsForTieBreak.push(gameResult)
                })
            }
            updateResultsForTieBreak(resultsForTieBreak)
        }, [tournamentGames, selectedTournament]
    )
    const resetTournaments = () => {
        getAllTournaments()
            .then(data => setTournaments(data))
    }
    const roundPopulation = () => {
        let roundNumber = activeTournament?.rounds;
        let tableHtml = [];
        while (roundNumber > 0) {
            tableHtml.push(<th key={roundNumber} className="roundHeader">{roundNumber}</th>)
            roundNumber--;
        }
        return tableHtml.reverse()
    }
    const roundHtml = roundPopulation()

    const solkoffTieBreaker = (playerArr) => {
        const tieBreakArr = []
        for (const playerId of playerArr) {
            const playerGames = resultsForTieBreak.filter(r => r.black?.id === playerId || r.white?.id === playerId)
            let opponentsTotalScore = 0.0
            for (const gameResult of playerGames) {
                let opponentId = gameResult.white === playerId ? gameResult.black?.id : gameResult.white?.id
                const opponentGames = resultsForTieBreak.filter(r => r.black?.id === opponentId || r.white?.id === opponentId)
                for (const gameResult of opponentGames) {
                    if (gameResult.winner?.id === opponentId) {
                        opponentsTotalScore += 1
                    }
                    else if (gameResult.win_style === "draw") {
                        opponentsTotalScore += .5
                    }
                    else {
                        opponentsTotalScore = opponentsTotalScore
                    }
                }
            }
            tieBreakArr.push(opponentsTotalScore)
        }
        return tieBreakArr
    }
    const cumulativeTieBreaker = (playerArr) => {
        const tieBreakArr = []
        for (const playerId of playerArr) {
            let score = 0
            const playerGames = resultsForTieBreak.filter(r => r.black?.id === playerId || r.white?.id === playerId)
            for (const game of playerGames) {
                if (game.winner?.id === playerId) {
                    score = score + (score + 1)
                }
                else if (game.win_style === "draw") {
                    score = score + (score + .5)
                }
                else {
                    score = score + score
                }
            }
            tieBreakArr.push(score)
        }
        return tieBreakArr
    }
    const handleGameForApiUpdate = (targetId, whitePieces, blackPieces, pastGame) => {
        let copy = {}
        if (scoring) {
            copy = { ...gameForApi }
            copy.player_w = whitePieces.id
            copy.player_b = blackPieces.id
            copy.tournament = activeTournament?.id
            copy.tournament_round = currentRound
            // updateGameForApi(copy)
        }
        else {
            copy = { ...pastGame }
            copy.player_w = whitePieces.id
            copy.player_b = blackPieces.id
            // updateGameForApi(copy)
        }
        if (!pastGame) {
            if (targetId === "whitePieces") {
                // console.log(blackPieces)
                copy.winner = whitePieces.id
                copy.win_style = "checkmate"
                updateGameForApi(copy)
            }
            if (targetId === "drawUpdate") {
                copy.winner = null
                copy.win_style = "draw"
                updateGameForApi(copy)
            }
            if (targetId === "blackPieces") {
                copy.winner = blackPieces.id
                copy.win_style = "checkmate"
                updateGameForApi(copy)
            }
        }
        else {
            if (targetId === "whiteUpdate") {
                // console.log(blackPieces)
                copy.winner = whitePieces.id
                copy.win_style = "checkmate"
                updateGameForApi(copy)
            }
            if (targetId === "drawUpdate") {
                copy.winner = null
                copy.win_style = "draw"
                updateGameForApi(copy)
            }
            if (targetId === "blackUpdate") {
                copy.winner = blackPieces.id
                copy.win_style = "checkmate"
                updateGameForApi(copy)
            }
        }
    }
    const submitResultsOrNull = () => {
        if (activeTournament?.complete === false) {

            if (activeTournament?.in_person === true) {
                return (
                    <section id="tournamentScoringSection">
                        {
                            currentRoundMatchups?.map(matchup => {
                                const white = activeTournamentPlayers?.find(player => player.id === matchup.player1)
                                const black = activeTournamentPlayers?.find(player => player.id === matchup.player2)
                                const copy = { ...gameForApi }
                                copy.player_w = white?.id
                                copy.player_b = black?.id
                                if (black === undefined) {
                                    return (
                                        <div key={`${matchup.round} -- ${matchup.match} -- bye`} className="setColor setCustomFont">
                                            {white?.username} has bye
                                        </div>
                                    )
                                }
                                return (
                                    <div key={`${matchup.round} -- ${matchup.match}`}
                                        className="tournamentScoringMatchup">
                                        <div
                                            className="whitePiecesMatchup"
                                            id="whitePieces"
                                            onClick={(evt) => {
                                                handleGameForApiUpdate(evt.target.id, white, black)
                                            }}>{white?.username}
                                        </div>
                                        <div
                                            className="drawMatchupButton"
                                            id="drawUpdate"
                                            onClick={(evt) => {
                                                handleGameForApiUpdate(evt.target.id, white, black)
                                            }}>Draw
                                        </div>
                                        <div
                                            className="blackPiecesMatchup"
                                            id="blackPieces"
                                            onClick={(evt) => {
                                                handleGameForApiUpdate(evt.target.id, white, black)
                                            }}>{black?.username}
                                        </div>
                                        <button onClick={() => {
                                            sendNewGame(gameForApi)
                                                .then(() => resetTournamentGames())
                                        }}>
                                            submit
                                        </button>
                                    </div>
                                )
                            })
                        }
                    </section>
                )
            }
            else {
                return (
                    <table id="digitalTournamentTable">
                        <thead>
                            <tr className="tableHeaderRow">
                                <th>white player</th>
                                <th></th>
                                <th>black player</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                currentRoundMatchups?.map(matchup => {
                                    const white = activeTournamentPlayers.find(player => player.id === matchup.player1)
                                    const black = activeTournamentPlayers.find(player => player.id === matchup.player2)
                                    if (white?.id && black?.id) {
                                        return (
                                            <tr key={matchup.round + matchup.match}>
                                                <td className="whitePiecesMatchup">{white.full_name}</td>
                                                <td className="matchupTableVS setColor">vs</td>
                                                <td className="blackPiecesMatchup">{black.full_name}</td>
                                            </tr>
                                        )
                                    }
                                    if (white?.id && black === undefined) {
                                        return (
                                            <tr key={matchup.round + matchup.match}>
                                                <td className="whitePiecesMatchup">{white.full_name}</td>
                                                <td className="matchupTableVS"></td>
                                                <td className="blackPiecesMatchup">BYE</td>
                                            </tr>
                                        )
                                    }
                                })
                            }
                        </tbody>
                    </table>
                )
            }
        }
    }
    const tableOrEdit = () => {
        if (editScores) {
            const editPairings = [...activeTournament?.pairings]
            const filteredPairings = editPairings.filter(pairing => pairing.round < activeTournament?.rounds)
            return (
                <section>
                    <button onClick={() => setEditScores(false)}>cancel</button>
                    {
                        tournamentGames.map(game => {
                            const white = activeTournamentPlayers.find(player => player.id === game.player_w.id)
                            const black = activeTournamentPlayers.find(player => player.id === game.player_b?.id)
                            // const matchup = tournamentGames?.find(game => game.tournament_round === pairing.round && game.player_w?.id === white?.id && game.player_b?.id === black?.id)
                            if (game.winner !== null) {
                                if (game.bye === true) {
                                    return (
                                        <div key={`${game.tournament_round} + ${game.id} + editing`}>
                                            <div>Round {game.tournament_round}</div>
                                            <div className="whitePiecesMatchup"
                                                id="whiteUpdate">{white.full_name}</div>
                                        </div>
                                    )
                                }
                                else {
                                    return (
                                        <div key={`${game.tournament_round} + ${game.id} + editing`}>
                                            <div>Round {game.tournament_round}</div>
                                            <div className="whitePiecesMatchup"
                                                id="whiteUpdate"
                                                onClick={(evt) => {
                                                    handleGameForApiUpdate(evt.target.id, white, black, game)
                                                }}>{white.full_name}</div>
                                            <div className="drawMatchupButton"
                                                id="drawUpdate"
                                                onClick={(evt) => {
                                                    handleGameForApiUpdate(evt.target.id, white, black, game)
                                                }}>Draw</div>
                                            <div className="blackPiecesMatchup"
                                                id="blackUpdate"
                                                onClick={(evt) => {
                                                    handleGameForApiUpdate(evt.target.id, white, black, game)
                                                }}>{black?.full_name}</div>
                                            <button onClick={() => {
                                                alterGame(gameForApi)
                                                    .then(() => resetTournamentGames())
                                            }}>
                                                submit
                                            </button>
                                        </div>
                                    )
                                }
                            }
                        })
                    }
                </section>
            )
        }
    }




    const scoringButtonOrNone = () => {
        if (activeTournament.in_person === false) {
            return (
                <button onClick={() => {
                    {
                        currentRoundMatchups.map(matchup => {
                            if (matchup.player2 !== null) {
                                const copy = { ...gameForApi }
                                copy.winner = null
                                copy.player_w = matchup.player1
                                copy.player_b = matchup.player2
                                sendNewGame(copy)
                            }
                            else {
                                const copy = { ...gameForApi }
                                copy.winner = null
                                copy.player_w = matchup.player1
                                copy.player_b = null
                                sendNewGame(copy)
                            }
                        })
                    }
                }}>create round games</button>
            )
        }
        else {
            return (
                <button onClick={() => {
                    setScoring(true)
                    setEditScores(false)
                }}>score</button>
            )
        }
    }
    if (selectedTournament) {
        if (activeTournament && activeTournamentPlayers) {
            const endTournamentModal = document.getElementById('endTournamentModal')
            const modal = document.getElementById('resultsModal')
            //current method for displaying results. delete when new useEffect is working
            const resultsDisplay = () => {
                const results = {}
                const resultArr = []
                const arrForTieBreakers = []
                activeTournamentPlayers.map(player => {
                    const scoreElement = document.getElementById(player.id + "-- score")
                    results[player.username] = [parseFloat(scoreElement?.innerHTML), player.id]
                })
                for (let player in results) {
                    resultArr.push([player, results[player]])
                }
                resultArr.sort((a, b) => { return b[1][0] - a[1][0] })
                return (
                    <section id="fullResults" className="setCustomFont">
                        <div id="standardResults" >
                            <div className="resultsHeader">standard</div>
                            {
                                resultArr.map(r => {
                                    arrForTieBreakers.push(r[1][1])
                                    return (
                                        <div key={r[0]} className="resultsModalListItem">
                                            <div>{r[0]}: </div>
                                            <div>{r[1][0].toString()}</div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div id="tieBreakResults">
                            <div id="solkoffResults">
                                <div className="resultsHeader">solkoff</div>
                                {
                                    arrForTieBreakers.map(r => {
                                        const player = activeTournamentPlayers.find(p => p.id === r)
                                        // console.log(activeTournamentPlayers)
                                        return (
                                            <div key={'playerId' + r} className="resultsModalListItem">
                                                <div>{player?.username}: </div>
                                                <div>{solkoffTieBreaker([r]).toString()}</div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <div id="cumulativeResults">
                                <div className="resultsHeader">cumulative</div>
                                {
                                    arrForTieBreakers.map(r => {
                                        const player = activeTournamentPlayers.find(p => p.id === r)
                                        // console.log(activeTournamentPlayers)
                                        return (
                                            <div key={'playerId' + r} className="resultsModalListItem">
                                                <div>{player?.username}: </div>
                                                <div>{cumulativeTieBreaker([r]).toString()}</div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </section>
                )
            }
            return <>
                <main id="tournamentContainer">
                    <div id="resultsModal">
                        Results
                        {resultsDisplay()}
                        {/* <div id="modalResults">
                            </div> */}
                        <div id="modalBtns">
                            <button onClick={() => {
                                endTournamentModal.style.display = "flex"
                                modal.style.display = "none"
                            }}>End Tournament</button>
                            <button onClick={() => {
                                modal.style.display = "none"
                            }}>cancel</button>
                        </div>
                    </div>
                    <div id="endTournamentModal" className="setCustomFont">
                        End Tournament?
                        <div id="endTournamentBtnBlock">
                            <button onClick={() => {
                                endTournament(selectedTournament)
                                    .then(() => {
                                        resetTournaments()
                                        setSelectedTournament(0)
                                    })
                            }
                            }>confirm</button>
                            <button onClick={() => {
                                endTournamentModal.style.display = "none"
                                modal.style.display = "flex"
                            }}>cancel</button>
                        </div>
                    </div>
                    <div className="setColor setTournamentFontSize">{activeTournament.title}</div>
                    <div id="tournamentProgressionControls">
                        <button
                            className="progressionControlBtn"
                            onClick={() => {
                                if (window.confirm("create round?")) {
                                    if (byePlayer) {
                                        sendNewGame(byeGame)
                                    }
                                    const tournamentCopy = { ...activeTournament }
                                    tournamentCopy.rounds++
                                    updateTournament(tournamentCopy)
                                        .then(() => {
                                            resetTournaments()
                                            resetTournamentGames()
                                        })
                                }
                            }}>Finish Round</button>
                        <button
                            className="progressionControlBtn"
                            onClick={() => {
                                setSelectedTournament(0)
                                setEditScores(false)
                                setScoring(false)
                            }}>exit</button>
                        <button
                            className="progressionControlBtn"
                            onClick={() => {
                                setEditScores(true)
                                setScoring(false)
                            }}>edit scores</button>
                        {scoringButtonOrNone()}
                        <button
                            className="progressionControlBtn"
                            onClick={() => {
                                modal.style.display = "flex";
                            }}>Results</button>
                    </div>
                    <div className="setColor setTournamentFontSize">
                        Round {currentRound}
                    </div>
                    <section id="matchupsContainer">
                        {/* {matchupsOrScoring()} */}
                        {submitResultsOrNull()}
                    </section>
                    <section id="tournamentTableContainer">
                        <table id="tournamentTable">
                            <thead>
                                <tr key={0} className="tableHeaderRow">
                                    <th>player</th>
                                    {
                                        roundHtml.map(round => {
                                            return round
                                        })
                                    }
                                    <th>count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    activeTournamentPlayers.map(tourneyPlayer => {
                                        const tourneyPlayerGames = tournamentGames.filter(tg => {
                                            return tg.player_b?.id === tourneyPlayer.id || tg.player_w.id === tourneyPlayer.id
                                        })
                                        const emptyCellCompensation = () => {
                                            if (tourneyPlayerGames.length < currentRound) {
                                                return (
                                                    <td></td>
                                                )
                                            }
                                        }
                                        let score = 0
                                        return (
                                            <tr key={tourneyPlayer.id} id={tourneyPlayer.id + "--tourneyRow"}>
                                                <td key={tourneyPlayer.id} className="tablePlayerCell">{tourneyPlayer.full_name}</td>
                                                {
                                                    tourneyPlayerGames.map(tpg => {
                                                        // if (tpg.player_b?.id === 3 || tpg.player_w?.id === 3) {
                                                        //     console.log(tpg)
                                                        // }
                                                        if (tpg.bye === true) {
                                                            score++
                                                            return (
                                                                <td key={tpg.id} value={1} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResultBye">bye</td>
                                                            )
                                                        }
                                                        if (tpg.winner?.id === tourneyPlayer.id) {
                                                            score++
                                                            return (
                                                                <td key={tpg.id} value={1} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult">1</td>
                                                            )
                                                        }
                                                        else if (tpg.winner === null && tpg.win_style === "draw") {
                                                            score += .5
                                                            return (
                                                                <td key={tpg.id} value={.5} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult">1/2</td>
                                                            )
                                                        }
                                                        else if (tpg.winner === null && !tpg.win_style) {
                                                            score = score
                                                            return (
                                                                <td key={tpg.id} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult"></td>
                                                            )
                                                        }
                                                        else {
                                                            score = score
                                                            return (
                                                                <td key={tpg.id} value={0} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult">0</td>
                                                            )
                                                        }
                                                    })
                                                }
                                                {emptyCellCompensation()}
                                                <td key={tourneyPlayer.id + "-- score"} id={tourneyPlayer.id + "-- score"} value={score || "0"}>
                                                    {score}
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </section>
                    {tableOrEdit()}
                </main>
            </>
        }

    }

}