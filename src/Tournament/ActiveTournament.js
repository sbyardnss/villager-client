import { useState, useEffect, useContext, useRef } from "react"
import { TournamentContext } from "./TournamentProvider"
import { alterGame, endTournament, getAllTournaments, getScoreCard, sendNewGame, updateTournament } from "../ServerManager"
import "./Tournament.css"
import { EditPlayersModal } from "./EditPlayersModal"
import { Swiss } from "tournament-pairings"


export const ActiveTournament = () => {
    const { tournaments, setTournaments, playersAndGuests, tournamentGames, selectedTournament, setSelectedTournament, resetTournamentGames, editPlayers, setEditPlayers, resetTournaments } = useContext(TournamentContext)
    //initial setup state variables
    const [activeTournament, setActiveTournament] = useState({})
    const [activeTournamentPlayers, setActiveTournamentPlayers] = useState([])
    const [currentRoundMatchups, setCurrentRoundMatchups] = useState([])

    //managing tournament state variables
    const [currentRound, setCurrentRound] = useState(0)
    const [editScores, setEditScores] = useState(false)
    // const [editPlayers, setEditPlayers] = useState(false)

    //tournament process state variables
    const [resultsForTieBreak, updateResultsForTieBreak] = useState([])
    const [byePlayer, setByePlayer] = useState(0)
    const [scoreObj, setScoreObj] = useState({})
    const [playerOpponentsReferenceObj, updatePlayerOpponentsReferenceObj] = useState({})

    // new scorecard state variable
    const [scoreCard, setScoreCard] = useState({})

    //prepping data for api state variables
    const [gameForApi, updateGameForApi] = useState({
        player_w: 0,
        player_w_model_type: "",
        player_b: 0,
        player_b_model_type: "",
        tournament: 0,
        time_setting: 0,
        win_style: "",
        accepted: true,
        tournament_round: 0,
        winner: 0,
        winner_model_type: "",
        bye: false
    })
    const [byeGame, setByeGame] = useState({
        player_w: 0,
        player_w_model_type: "",
        player_b: null,
        tournament: 0,
        time_setting: 0,
        win_style: "",
        accepted: true,
        tournament_round: 0,
        winner: 0,
        winner_model_type: "",
        bye: true
    })

    //setting active tournament here from tournaments
    useEffect(
        () => {
            const selectedTournamentObj = tournaments?.find(t => t.id === selectedTournament)
            setActiveTournament(selectedTournamentObj)
        }, [selectedTournament, tournaments]
    )
    //setting active tournament players from players and guests and active tournament
    useEffect(
        () => {
            const playersForSelectedTournament = playersAndGuests.filter(p => {
                if (p.guest_id) {
                    return activeTournament?.guest_competitors?.find(gc => p.guest_id === gc.guest_id)
                }
                else {
                    return activeTournament?.competitors?.find(c => c.id === p.id)
                }
            })
            setActiveTournamentPlayers(playersForSelectedTournament)
        }, [activeTournament]
    )
    useEffect(
        //creates reference object for previous opponents for avoid on swiss round creation
        () => {
            if (tournamentGames && activeTournamentPlayers) {
                let opponentObj = {}
                activeTournamentPlayers?.map(player => {
                    if (player.guest_id) {
                        opponentObj[player.guest_id] = []
                    }
                    else {
                        opponentObj[player.id] = []
                    }
                })
                tournamentGames?.map(tg => {
                    const playerWIdentifier = tg.player_w.guest_id ? tg.player_w.guest_id : tg.player_w.id
                    const playerBIdentifier = tg.player_b?.guest_id ? tg.player_b?.guest_id : tg.player_b?.id
                    if (playerBIdentifier === undefined && typeof opponentObj[playerWIdentifier] === 'object') {
                        opponentObj[playerWIdentifier].push('bye')
                    }
                    if (typeof opponentObj[playerWIdentifier] === 'object' && typeof opponentObj[playerBIdentifier] === 'object') {
                        opponentObj[playerWIdentifier].push(playerBIdentifier)
                        opponentObj[playerBIdentifier].push(playerWIdentifier)
                    }
                })
                updatePlayerOpponentsReferenceObj(opponentObj)
            }
        }, [activeTournamentPlayers, tournamentGames]
    )

    //setting round from active tournament
    useEffect(
        () => {
            if (activeTournament) {
                setCurrentRound(activeTournament.rounds)
            }
        }, [activeTournament]
    )


    //getting current round pairings updating bye game if necessary
    useEffect(
        () => {
            if (activeTournament) {
                const currentRoundPairings = activeTournament.pairings?.filter(p => p.round === currentRound)
                {
                    //ensures that null value on matchup indicating bye player is restricted to player1 variable
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
                    // byeCopy.player_w = byePairing.player1
                    // byeCopy.winner = byePairing.player1
                    byeCopy.bye = true
                    byeCopy.win_style = ""
                    if (typeof byePairing.player1 === 'string') {
                        byeCopy.winner_model_type = 'guestplayer'
                        byeCopy.player_w_model_type = 'guestplayer'
                        const guestPlayer = activeTournamentPlayers.find(p => p.guest_id === byePairing.player1)
                        byeCopy.player_w = guestPlayer?.guest_id
                        byeCopy.winner = guestPlayer?.guest_id
                    }
                    else {
                        byeCopy.winner_model_type = 'player'
                        byeCopy.player_w_model_type = 'player'
                        const player = activeTournamentPlayers.find(p => p.id === byePairing.player1)
                        byeCopy.player_w = player?.id
                        byeCopy.player_w = player?.id
                        byeCopy.winner = player?.id
                    }
                    setByeGame(byeCopy)
                    setByePlayer(byePairing.player1)
                }
            }
        }, [currentRound, activeTournament]
    )
    //updating game for api through active tournament
    useEffect(
        () => {
            if (activeTournament) {
                const copy = { ...gameForApi }
                copy.tournament = activeTournament?.id
                copy.time_setting = activeTournament?.time_setting
                copy.tournament_round = activeTournament?.rounds
                updateGameForApi(copy)
            }
        }, [activeTournament]
    )
    //getting data for tie breaker from tournament games
    useEffect(
        () => {
            const resultsForTieBreak = []
            {
                tournamentGames.map(tg => {
                    const gameResult = {}
                    gameResult.white = tg.player_w?.guest_id ? tg.player_w.guest_id : tg.player_w.id
                    gameResult.black = tg.player_b?.guest_id ? tg.player_b?.guest_id : tg.player_b?.id
                    gameResult.winner = tg.winner?.guest_id ? tg.winner.guest_id : tg.winner?.id
                    gameResult.win_style = tg.win_style
                    gameResult.round = tg.tournament_round
                    resultsForTieBreak.push(gameResult)
                })
            }
            updateResultsForTieBreak(resultsForTieBreak)
        }, [tournamentGames, selectedTournament]
    )
    //this might not be necessary after new scoring method
    // useEffect(
    //     () => {
    //         const scoreBoardObj = {}
    //         if (resultsForTieBreak && activeTournamentPlayers) {
    //             for (const player of activeTournamentPlayers) {
    //                 const playerIdentifier = player.guest_id ? player.guest_id : player.id
    //                 let playerResults = []
    //                 let count = 0
    //                 if (typeof playerIdentifier === 'string') {
    //                     playerResults = resultsForTieBreak.filter(result => result.white === playerIdentifier || result?.black === playerIdentifier)
    //                 }
    //                 else {
    //                     playerResults = resultsForTieBreak.filter(result => result.white === playerIdentifier && typeof result.white !== 'string' || result?.black === playerIdentifier && typeof result?.black !== 'string')
    //                 }
    //                 for (const result of playerResults) {
    //                     if (result?.winner === playerIdentifier) {
    //                         count++
    //                     }
    //                     if (result?.win_style === 'draw') {
    //                         count = count + .5
    //                     }
    //                 }
    //                 scoreBoardObj[playerIdentifier] = count
    //             }
    //         }
    //         setScoreObj(scoreBoardObj)
    //     }, [resultsForTieBreak]
    // )

    useEffect(
        () => {
            if (selectedTournament) {
                getScoreCard(selectedTournament)
                    .then(data => setScoreCard(data))
            }
        }, [tournamentGames]
    )
    useEffect(
        () => {
            if (scoreCard) {
                const scoreBoardObj = {}
                for (const playerId in scoreCard) {
                    scoreBoardObj[playerId] = 0
                    for (const score of scoreCard[playerId]) {
                        if (typeof score === 'number') {
                            scoreBoardObj[playerId] += parseFloat(score)
                        }
                        if (score === 'bye') {
                            scoreBoardObj[playerId] += 1
                        }
                    }
                }
                setScoreObj(scoreBoardObj)
            }
        }, [scoreCard]
    )
    // const resetTournaments = () => {
    //     getAllTournaments()
    //         .then(data => setTournaments(data))
    // }
    //number population for table
    const roundPopulation = () => {
        let roundNumber = activeTournament?.rounds;

        let tableHtml = [];
        while (roundNumber > 0) {
            if (roundNumber === currentRound){
                tableHtml.push(<th key={roundNumber} className="currentRoundHeader">{roundNumber}</th>)

            }
            else {
                tableHtml.push(<th key={roundNumber} className="roundHeader">{roundNumber}</th>)
            }
            roundNumber--;
        }
        return tableHtml.reverse()
    }
    const roundHtml = roundPopulation()
    //creating solkoff tie break data
    const solkoffTieBreaker = (playerIdArr) => {
        const solkoffTieBreakerArr = []
        for (const playerId of playerIdArr) {
            let count = 0
            const playerMatchupResults = resultsForTieBreak.filter(result => {
                return result.white === playerId || result.black === playerId
            })
            for (const result of playerMatchupResults) {
                const opponentId = playerId === result.white ? result.black : result.white

                //THIS LINE BELOW WAS CAUSING A NaN ERROR WHERN REFERENCING OPPONENTSCORE
                //REMEMBER THIS
                // const opponentScore = document.getElementById(`${opponentId}-- score`).innerHTML 

                if (opponentId !== undefined && scoreObj[opponentId]) {
                    count += scoreObj[opponentId]
                }
            }
            solkoffTieBreakerArr.push([playerId, count])
        }
        return solkoffTieBreakerArr
    }
    //creating cumulative tie break data
    const cumulativeTieBreaker = (playerIdArr) => {
        const cumulativeArr = []
        for (const playerId of playerIdArr) {
            let count = 0
            const playerMatchupResults = resultsForTieBreak.filter(result => {
                return result.white === playerId || result.black === playerId
            })
            for (const result of playerMatchupResults) {
                const opponentId = result.white === playerId ? result.black : result.white
                // console.log(opponentId)
                // console.log(typeof playerId)
                result.winner === playerId && opponentId !== undefined ? count += (count + 1)
                    : result.win_style === 'draw' ? count += (count + .5)
                        : count = count + count
            }
            cumulativeArr.push([playerId, count])
        }
        return cumulativeArr
    }
    //compiling tie break data
    const tieBreakDisplay = (arrForTie) => {
        const solkoffResultsArr = solkoffTieBreaker(arrForTie).sort((a, b) => { return b[1] - a[1] })
        const cumulativeResultsArr = cumulativeTieBreaker(arrForTie).sort((a, b) => { return b[1] - a[1] })
        return (
            <div id="tieBreakResults">
                <div id="fullResults">
                    <div className="resultsHeader">solkoff</div>
                    <div id="solkoffResults">
                        {
                            solkoffResultsArr.map(playerResult => {
                                const player = typeof playerResult[0] === 'string' ? activeTournamentPlayers.find(player => player.guest_id === playerResult[0])
                                    : activeTournamentPlayers.find(player => player.id === playerResult[0])
                                return (
                                    <div key={playerResult[0] + '--' + playerResult[1]} className="resultsModalListItem">
                                        <div>{player?.guest_id ? player?.full_name : player?.username}: </div>
                                        <div>{playerResult[1]}</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div id="fullResults">
                    <div className="resultsHeader">cumulative</div>
                    <div id="cumulativeResults">
                        {
                            cumulativeResultsArr.map(playerResult => {
                                const player = typeof playerResult[0] === 'string' ? activeTournamentPlayers.find(player => player.guest_id === playerResult[0])
                                    : activeTournamentPlayers.find(player => player.id === playerResult[0])
                                return (
                                    <div key={playerResult[0] + '--' + playerResult[1]} className="resultsModalListItem">
                                        <div>{player?.guest_id ? player?.full_name : player?.username}: </div>
                                        <div>{playerResult[1]}</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>

        )
    }
    //update game for api either initial or updating
    const handleGameForApiUpdate = (targetId, whitePieces, blackPieces, pastGame) => {
        let copy = {}
        //set up game info based on activeTournament or pastGame
        if (!pastGame) {
            //new score
            copy = { ...gameForApi }
            copy.tournament = activeTournament?.id
            copy.tournament_round = currentRound
            copy.time_setting = activeTournament?.time_setting
            //set players
            whitePieces.guest_id ? copy.player_w_model_type = 'guestplayer' : copy.player_w_model_type = 'player'
            whitePieces.guest_id ? copy.player_w = whitePieces.guest_id : copy.player_w = whitePieces.id
            blackPieces.guest_id ? copy.player_b_model_type = 'guestplayer' : copy.player_b_model_type = 'player'
            blackPieces.guest_id ? copy.player_b = blackPieces.guest_id : copy.player_b = blackPieces.id
        }
        else {
            //edit score
            copy = { ...pastGame }
        }
        if (targetId === "whitePieces") {
            //set white as winner either guest_id or id
            if (whitePieces.guest_id) {
                copy.winner_model_type = 'guestplayer'
                copy.winner = whitePieces.guest_id
                copy.win_style = 'checkmate'
            }
            else {
                copy.winner_model_type = 'player'
                copy.winner = whitePieces.id
                copy.win_style = 'checkmate'
            }
        }
        else if (targetId === 'blackPieces') {
            //set black as winner either guest_id or id
            if (blackPieces.guest_id) {
                copy.winner_model_type = 'guestplayer'
                copy.winner = blackPieces.guest_id
                copy.win_style = 'checkmate'
            }
            else {
                copy.winner_model_type = 'player'
                copy.winner = blackPieces.id
                copy.win_style = 'checkmate'
            }
        }
        else {
            copy.win_style = 'draw'
            copy.winner_model_type = null
            copy.winner = null
        }
        updateGameForApi(copy)
    }
    //iterating current round matchups to allow for initial score selection
    const submitResultsOrNull = () => {
        if (activeTournament?.complete === false) {
            if (activeTournament?.in_person === true) {
                const byeMatchup = currentRoundMatchups?.find(matchup => matchup.player1 === null || matchup.player2 === null)
                const whiteBye = activeTournamentPlayers?.find(player => player.id === byeMatchup?.player1 || player.guest_id === byeMatchup?.player1)
                // const blackBye = activeTournamentPlayers?.find(player => player.id === byeMatchup.player2 || player.guest_id === byeMatchup.player2)
                return (
                    <section id="tournamentScoringSection">
                        {byeMatchup ?
                            <div key={`${byeMatchup.round} -- ${byeMatchup.match} -- bye`} className="setColor setCustomFont">
                                {whiteBye?.username || whiteBye?.full_name} has bye
                            </div>
                            : ""}
                        {
                            currentRoundMatchups?.map(matchup => {
                                const white = activeTournamentPlayers?.find(player => player.id === matchup.player1 || player.guest_id === matchup.player1)
                                const black = activeTournamentPlayers?.find(player => player.id === matchup.player2 || player.guest_id === matchup.player2)
                                const copy = { ...gameForApi }
                                copy.player_w = white?.id
                                copy.player_b = black?.id
                                // if (black === undefined) {
                                //     return (
                                //         <div key={`${matchup.round} -- ${matchup.match} -- bye`} className="setColor setCustomFont">
                                //             {white?.username || white?.full_name} has bye
                                //         </div>
                                //     )
                                // }
                                if (black !== undefined) {
                                    return (
                                        <div key={`${matchup.round} -- ${matchup.match}`}
                                            className="tournamentScoringMatchup">
                                            <div
                                                className="whitePiecesMatchup"
                                                id="whitePieces"
                                                onClick={(evt) => {
                                                    handleGameForApiUpdate(evt.target.id, white, black)
                                                }}>{white?.guest_id ? white.full_name : white?.username}
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
                                                }}>{black?.guest_id ? black.full_name : black?.username}
                                            </div>
                                            <button onClick={() => {
                                                sendNewGame(gameForApi)
                                                    .then(() => resetTournamentGames())
                                            }}>
                                                submit
                                            </button>
                                        </div>
                                    )
                                }
                            })
                        }
                    </section>
                )
            }
            else {
                return (
                    <table id="digitalTournamentTable">
                        {/* <thead>
                            <tr className="tableHeaderRow">
                                <th>white player</th>
                                <th></th>
                                <th>black player</th>
                            </tr>
                        </thead> */}
                        <tbody>
                            {
                                currentRoundMatchups?.map(matchup => {
                                    const white = activeTournamentPlayers?.find(player => player.id === matchup.player1 || player.guest_id === matchup.player1)
                                    const black = activeTournamentPlayers?.find(player => player.id === matchup.player2 || player.guest_id === matchup.player2)
                                    // if (black === undefined) {
                                    //     return (
                                    //         <tr key={`${matchup.round} -- ${matchup.match} -- bye`} className="setColor setCustomFont">
                                    //             <td>{white?.username || white?.full_name}</td>
                                    //             <td></td>
                                    //             <td>bye</td>
                                    //         </tr>
                                    //     )
                                    // }
                                    if (white?.id && black?.id) {
                                        return (
                                            <tr key={matchup.round + matchup.match}>
                                                <td className="whitePiecesMatchup">{white.full_name}</td>
                                                <td className="matchupTableVS setColor">vs</td>
                                                <td className="blackPiecesMatchup">{black.full_name}</td>
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
    //iterating tournament games to edit if necessary
    const tableOrEdit = () => {
        if (editScores) {
            const editPairings = [...activeTournament?.pairings]
            // const filteredPairings = editPairings.filter(pairing => pairing.round < activeTournament?.rounds)
            return (
                <section id="tournamentEditSection">
                    <button className="buttonStyleReject" id="cancelEditBtn" onClick={() => setEditScores(false)}>cancel edit</button>
                    <section id="previousMatchups">
                        {
                            tournamentGames.map(game => {
                                const white = activeTournamentPlayers.find(player => {
                                    if (game.player_w.guest_id) {
                                        return player.guest_id === game.player_w.guest_id
                                    }
                                    else {
                                        return player.id === game.player_w.id
                                    }
                                })
                                const black = activeTournamentPlayers.find(player => {
                                    if (game.player_b?.guest_id) {
                                        return player.guest_id === game.player_b?.guest_id
                                    }
                                    else {
                                        return player.id === game.player_b?.id
                                    }
                                })
                                if (game.bye === false) {
                                    return (
                                        <div key={`${game.tournament_round} + ${game.id} + editing`} className="editScoreListItem">
                                            <div>
                                                <div className="setCustomFont">Round {game.tournament_round}</div>
                                            </div>
                                            <div className="editMatchup">
                                                <div className="whitePiecesMatchup"
                                                    id="whitePieces"
                                                    onClick={(evt) => {
                                                        handleGameForApiUpdate(evt.target.id, white, black, game)
                                                    }}>{white.username || white.full_name}</div>
                                                <div className="drawMatchupButton"
                                                    id="drawUpdate"
                                                    onClick={(evt) => {
                                                        handleGameForApiUpdate(evt.target.id, white, black, game)
                                                    }}>Draw</div>
                                                <div className="blackPiecesMatchup"
                                                    id="blackPieces"
                                                    onClick={(evt) => {
                                                        handleGameForApiUpdate(evt.target.id, white, black, game)
                                                    }}>{black?.username || black?.full_name}</div>
                                                <button onClick={() => {
                                                    alterGame(gameForApi)
                                                        .then(() => resetTournamentGames())
                                                }}>
                                                    submit
                                                </button>
                                            </div>
                                        </div>
                                    )
                                }
                            })
                        }
                    </section>
                </section>
            )
        }
    }

    //populate create games button for digital tournaments
    const scoringButtonOrNone = () => {
        if (activeTournament.in_person === false) {
            return (
                <button className="controlBtnApprove progressionControlBtn" onClick={() => {
                    {
                        currentRoundMatchups.map(matchup => {
                            if (matchup.player2 !== null) {
                                const copy = { ...gameForApi }
                                const [w, b] = [matchup.player1, matchup.player2]
                                if (typeof w === 'string') {
                                    copy.player_w_model_type = 'guestplayer'
                                }
                                else {
                                    copy.player_w_model_type = 'player'
                                }
                                if (typeof b === 'string') {
                                    copy.player_b_model_type = 'guestplayer'
                                }
                                else {
                                    copy.player_b_model_type = 'player'
                                }
                                copy.winner = null
                                copy.winner_model_type = null
                                copy.player_w = w
                                copy.player_b = b
                                sendNewGame(copy)
                                    // THIS WORKS HERE BUT THERE MUST BE A BETTER WAY
                                    .then(() => resetTournamentGames())
                            }
                            else {
                                //create bye game if necessary
                                // const copy = { ...gameForApi }
                                // copy.winner = matchup.player1
                                // copy.player_w = matchup.player1
                                // if (typeof matchup.player1 === 'string') {
                                //     copy.player_w_model_type = 'guestplayer'
                                //     copy.winner_model_type = 'guestplayer'
                                // }
                                // else {
                                //     copy.player_w_model_type = 'player'
                                //     copy.winner_model_type = 'player'
                                // }
                                // copy.player_b_model_type = null
                                // copy.player_b = null
                                sendNewGame(byeGame)
                                    .then(() => resetTournamentGames())
                            }
                        })

                    }
                }}>create round games</button>
            )
        }
        // resetTournamentGames()
        // else {
        //     return null
        // }
    }
    if (selectedTournament) {
        if (activeTournament && activeTournamentPlayers) {
            const endTournamentModal = document.getElementById('endTournamentModal')
            const modal = document.getElementById('resultsModal')
            //results modal display
            const resultsDisplay = () => {
                const results = {}
                const resultArr = []
                const arrForTieBreakers = []
                activeTournamentPlayers.map(player => {
                    const playerIdentifier = player.guest_id ? player.guest_id : player.id
                    if (player.guest_id) {
                        resultArr.push([player.full_name, parseFloat(scoreObj[playerIdentifier]), player.guest_id])
                        arrForTieBreakers.push(player.guest_id)
                    }
                    else {
                        resultArr.push([player.username, parseFloat(scoreObj[playerIdentifier]), player.id])
                        arrForTieBreakers.push(player.id)
                    }
                })
                resultArr.sort((a, b) => { return b[1] - a[1] })
                return (
                    <section id="fullResults" className="setCustomFont">
                        <div id="standardResults" >
                            <div className="resultsHeader">standard</div>
                            {
                                resultArr.map(r => {
                                    return (
                                        <div key={r[0]} className="resultsModalListItem">
                                            <div>{r[0]}: </div>
                                            <div>{r[1].toString()}</div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        {tieBreakDisplay(arrForTieBreakers)}
                    </section>
                )
            }
            return <>
                <main id="tournamentContainer">
                    <div id="resultsModal">
                        Results
                        {resultsDisplay()}
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
                    {editPlayers ? <div id="editPlayersModal" className="setCustomFont">
                        <EditPlayersModal
                            activeTournamentObj={activeTournament}
                            // tournamentId={selectedTournament}
                            setEdit={setEditPlayers}
                            playedRounds={currentRound}
                            gamesFromThisRound = {tournamentGames.filter(g => g.tournament_round === currentRound)}
                            previousOpponents = {playerOpponentsReferenceObj}
                        />
                    </div> : ""}
                    <div id="activeTournamentHeader">
                        <div className="setColor setTournamentFontSize">{activeTournament.title}</div>
                        <button
                            className="progressionControlBtn buttonStyleReject"
                            onClick={() => {
                                setEditPlayers(false)
                                setSelectedTournament(0)
                                setEditScores(false)
                                updatePlayerOpponentsReferenceObj({})
                                // setScoring(false)
                            }}>exit</button>
                    </div>
                    <div id="tournamentProgressionControls">
                        <button
                            className="progressionControlBtn controlBtnApprove"
                            onClick={() => {
                                if (window.confirm("create round?")) {
                                    if (byePlayer) {
                                        sendNewGame(byeGame)
                                    }
                                    const tournamentCopy = { ...activeTournament }
                                    const playersArg = []
                                    for (const opponentRef in playerOpponentsReferenceObj) {
                                        const playerRefObj = {
                                            id: parseInt(opponentRef) || opponentRef,
                                            avoid: playerOpponentsReferenceObj[opponentRef].filter(ref => ref !== 'bye')
                                        }

                                        if (playerOpponentsReferenceObj[opponentRef].includes('bye')) {
                                            playerRefObj.receivedBye = true
                                        }
                                        playersArg.push(playerRefObj)
                                    }
                                    // console.log(playersArg)
                                    tournamentCopy.pairings = tournamentCopy.pairings.concat(Swiss(playersArg, currentRound + 1))
                                    tournamentCopy.rounds++
                                    // console.log(tournamentCopy)
                                    updateTournament(tournamentCopy)
                                        .then(() => {
                                            resetTournaments()
                                            resetTournamentGames()
                                        })
                                }
                            }}>Finish Round</button>
                        <button
                            className="progressionControlBtn controlBtnApprove"
                            onClick={() => {
                                setEditScores(true)
                                // setScoring(false)
                            }}>edit scores</button>
                        {scoringButtonOrNone()}
                        <button className="progressionControlBtn controlBtnApprove" onClick={() => {
                            setEditPlayers(true)
                        }}>edit players</button>
                        <button
                            className="progressionControlBtn controlBtnApprove"
                            onClick={() => {
                                modal.style.display = "flex";
                            }}>Results</button>
                    </div>
                    <div className="setColor setTournamentFontSize">
                        Round {currentRound}
                    </div>
                    <section id="matchupsContainer">
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


                                {/* {
                                    activeTournamentPlayers.map(tourneyPlayer => {
                                        const tourneyPlayerGames = tournamentGames.filter(tg => {
                                            if (tourneyPlayer.guest_id) {
                                                return tg.player_b?.guest_id === tourneyPlayer.guest_id || tg.player_w.guest_id === tourneyPlayer.guest_id
                                            }
                                            else {
                                                return !tg.player_b?.guest_id && tg.player_b?.id === tourneyPlayer.id || !tg.player_w.guest_id && tg.player_w.id === tourneyPlayer.id
                                            }
                                        })
                                        const guestIdOrId = tourneyPlayer.guest_id ? tourneyPlayer.guest_id : tourneyPlayer.id
                                        const emptyCellCompensation = () => {
                                            if (tourneyPlayerGames.length < currentRound) {
                                                return (
                                                    <td></td>
                                                )
                                            }
                                        }
                                        let score = 0
                                        return (
                                            <tr key={tourneyPlayer.guest_id ? tourneyPlayer.guest_id : tourneyPlayer.id} id={tourneyPlayer.id + "--tourneyRow"}>
                                                <td key={tourneyPlayer.id} className="tablePlayerCell">{tourneyPlayer.full_name}</td>
                                                {
                                                    tourneyPlayerGames.map(tpg => {
                                                        if (tpg.bye === true) {
                                                            score++
                                                            return (
                                                                <td key={tpg.id} value={1} id={guestIdOrId + 'bye'} className="tournamentGameResultBye">bye</td>
                                                            )
                                                        }
                                                        if ((tpg.winner?.guest_id && tpg.winner?.guest_id === tourneyPlayer.guest_id) || (!tpg.winner?.guest_id && !tourneyPlayer.guest_id && tpg.winner?.id === tourneyPlayer.id)) {
                                                            score++
                                                            return (
                                                                <td key={tpg.id} value={1} id={guestIdOrId + tpg.id} className="tournamentGameResult">1</td>
                                                            )
                                                        }
                                                        else if (tpg.winner === null && tpg.win_style === "draw") {
                                                            score += .5
                                                            return (
                                                                <td key={tpg.id} value={.5} id={guestIdOrId + tpg.id} className="tournamentGameResult">1/2</td>
                                                            )
                                                        }
                                                        else if (tpg.winner === null && !tpg.win_style) {
                                                            score = score
                                                            return (
                                                                <td key={tpg.id} id={guestIdOrId + tpg.id} className="tournamentGameResult"></td>
                                                            )
                                                        }
                                                        else {
                                                            score = score
                                                            return (
                                                                <td key={tpg.id} value={0} id={guestIdOrId + tpg.id} className="tournamentGameResult">0</td>
                                                            )
                                                        }
                                                    })
                                                }
                                                {emptyCellCompensation()}
                                                <td key={guestIdOrId + "-- score"} id={guestIdOrId + "-- score"} value={scoreObj[guestIdOrId]}>
                                                    {scoreObj[guestIdOrId]}
                                                </td>
                                            </tr>
                                        )
                                    })
                                } */}

                                {
                                    activeTournamentPlayers.map(tourneyPlayer => {
                                        const guestIdOrId = tourneyPlayer.guest_id ? tourneyPlayer.guest_id : tourneyPlayer.id
                                        const tourneyPlayerScores = scoreCard[guestIdOrId]
                                        let score = 0
                                        return (
                                            <tr key={tourneyPlayer.guest_id ? tourneyPlayer.guest_id : tourneyPlayer.id} id={tourneyPlayer.id + "--tourneyRow"} className="tablePlayerRow">
                                                <td key={tourneyPlayer.id} className="tablePlayerCell">{tourneyPlayer.full_name}</td>
                                                {
                                                    tourneyPlayerScores?.map((s, index) => {
                                                        if (typeof s === 'number') {
                                                            score += s
                                                        }
                                                        if (s === 'bye') {
                                                            score += 1
                                                        }
                                                        if (s !== 'none') {
                                                            return (
                                                                <td key={guestIdOrId + '--' + index} className="scoreCell">{s}</td>
                                                            )
                                                        }
                                                        else {
                                                            return (
                                                                <td key={guestIdOrId + '--' + index} className="scoreCell">0</td>
                                                            )
                                                        }
                                                    })
                                                }
                                                <td key={guestIdOrId + "-- score"} id={guestIdOrId + "-- score"} className="totalScoreCell" value={scoreObj[guestIdOrId]}>
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