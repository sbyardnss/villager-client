import { useState, useEffect, useContext, useRef } from "react"
import { TournamentContext } from "./TournamentProvider"
import { alterGame, endTournament, getAllTournaments, getScoreCard, sendNewGame, updateTournament } from "../ServerManager"
import "./Tournament.css"
import { EditPlayersModal } from "./EditPlayersModal"
import { Swiss } from "tournament-pairings"


export const ActiveTournament = () => {
    const { tournaments, setTournaments, playersAndGuests, tournamentGames, selectedTournament, setSelectedTournament, resetTournamentGames, editPlayers, setEditPlayers, resetTournaments, myChessClubs } = useContext(TournamentContext)
    //initial setup state variables
    const [activeTournament, setActiveTournament] = useState({})
    const [activeTournamentPlayers, setActiveTournamentPlayers] = useState([])
    const [currentRoundMatchups, setCurrentRoundMatchups] = useState([])

    //managing tournament state variables
    const [currentRound, setCurrentRound] = useState(0)
    const [editScores, setEditScores] = useState(false)
    const [viewTable, setViewTable] = useState(false)
    // const [editPlayers, setEditPlayers] = useState(false)

    //tournament process state variables
    const [resultsForTieBreak, updateResultsForTieBreak] = useState([])
    const [byePlayer, setByePlayer] = useState(0)
    const [scoreObj, setScoreObj] = useState({})
    const [allPlayersArr, setAllPlayersArr] = useState([])
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
    useEffect(
        () => {
            if (activeTournament.complete === true) {
                setViewTable(true)
            }
        }, [activeTournament]
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
            //now mapping activeTournament.pairings to create playerOpponentReferenceObj
            //was previously mapping tournamentGames but that missed the current rounds pairings
            if (activeTournament.pairings) {
                let opponentObj = {}
                activeTournament.pairings.map(p => {
                    // if (p.player1 === 'g7'){
                    //     console.log(p.player2)
                    // }
                    if (!opponentObj[p.player1] && p.player1) {
                        opponentObj[p.player1] = []
                    }
                    if (!opponentObj[p.player2] && p.player2) {
                        opponentObj[p.player2] = []
                    }
                    const player2orBye = p.player2 ? p.player2 : 'bye'
                    if (opponentObj[p.player1]) {
                        opponentObj[p.player1].push(player2orBye)
                    }
                    // else {
                    //     opponentObj[p.player1] = []
                    // }
                    if (p.player2) {
                        if (opponentObj[p.player2]) {
                            opponentObj[p.player2].push(p.player1)
                        }
                        // else {
                        //     opponentObj[p.player2] = []
                        // }
                    }
                })
                updatePlayerOpponentsReferenceObj(opponentObj)
            }
        }, [activeTournamentPlayers, activeTournament.pairings]
    )

    useEffect(
        () => {
            if (activeTournament.club) {
                const allPlayersRef = []
                const clubForTournament = myChessClubs.find(c => c.id === activeTournament.club.id)
                for (const playerRef in playerOpponentsReferenceObj) {
                    if (isNaN(parseInt(playerRef))) {
                        const guest = clubForTournament.guest_members.find(g => g.guest_id === playerRef)
                        allPlayersRef.push(guest)
                    }
                    else {
                        const player = clubForTournament?.members?.find(p => p.id === parseInt(playerRef))
                        allPlayersRef.push(player)
                    }
                }
                setAllPlayersArr(allPlayersRef)
            }
        }, [scoreObj, activeTournament.club]
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
            if (activeTournament.pairings) {
                const currentRoundPairings = activeTournament.pairings.filter(p => p.round === currentRound)
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
            }

        }, [currentRound, activeTournament.pairings]
    )
    useEffect(
        () => {
            const byePairing = currentRoundMatchups?.find(pairing => pairing.player2 === null)
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
            else {
                setByeGame({
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
                setByePlayer(0)
            }
        }, [currentRoundMatchups]
    )

    //updating game for api through active tournament
    useEffect(
        () => {
            if (activeTournament) {
                const copy = { ...gameForApi }
                copy.tournament = activeTournament?.id
                copy.winner = 0
                copy.time_setting = activeTournament?.time_setting
                copy.tournament_round = activeTournament?.rounds
                updateGameForApi(copy)
            }
        }, [activeTournament, currentRound]
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
    // useEffect(
    //     () => {
    //         if (selectedTournament) {
    //             getScoreCard(selectedTournament)
    //                 .then(data => setScoreCard(data))
    //         }
    //     }, [tournamentGames]
    // )
    // potential scorecard replacement
    useEffect(
        () => {
            if (tournamentGames) {
                let scoreCardObj = {}
                // for (const player of activeTournamentPlayers) {
                for (const player of allPlayersArr) {
                    const playerScoreArr = []
                    const identifier = player.guest_id ? player.guest_id : player.id

                    const playerGames = tournamentGames.filter(tg => {
                        if (typeof identifier === 'string') {
                            return tg.player_w.guest_id === identifier || tg.player_b?.guest_id === identifier
                        }
                        else {
                            return tg.player_w.id === identifier && !tg.player_w.guest_id || tg.player_b?.id === identifier && !tg.player_b.guest_id
                        }
                    })
                    let numOfRounds = 1
                    while (numOfRounds < currentRound + 1) {
                        const targetGame = playerGames.find(pg => pg.tournament_round === numOfRounds)
                        if (!targetGame) {
                            playerScoreArr.push('none')
                        }
                        else if (targetGame.bye === true) {
                            playerScoreArr.push('bye')
                        }
                        else if (targetGame.win_style === 'draw') {
                            playerScoreArr.push(.5)
                        }
                        else if (typeof identifier === 'string' && targetGame.winner?.guest_id === identifier) {
                            playerScoreArr.push(1)
                        }
                        else if (typeof identifier === 'number' && targetGame.winner?.id === identifier && !targetGame.winner?.guest_id) {
                            playerScoreArr.push(1)
                        }
                        else {
                            playerScoreArr.push(0)
                        }
                        numOfRounds++
                    }
                    scoreCardObj[identifier] = playerScoreArr
                }
                setScoreCard(scoreCardObj)
            }
        }, [tournamentGames, activeTournamentPlayers]
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
    const sortAllPlayersArr = (playersArr) => {
        return playersArr.sort((a, b) => { 
            const aIdentifier = a.guest_id ? a.guest_id : a.id
            const bIdentifier = b.guest_id ? b.guest_id : b.id
            return scoreObj[bIdentifier] - scoreObj[aIdentifier] 
        })
    }
    const resetGameForApi = () => {
        updateGameForApi({
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
    }
    //number population for table
    const roundPopulation = () => {
        let roundNumber = activeTournament?.rounds;

        let tableHtml = [];
        while (roundNumber > 0) {
            if (roundNumber === currentRound) {
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
    const cellPopulation = () => {

    }
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
                                const player = typeof playerResult[0] === 'string' ? allPlayersArr.find(player => player.guest_id === playerResult[0])
                                    : allPlayersArr.find(player => player.id === playerResult[0])
                                return (
                                    <div key={playerResult[0] + '--' + playerResult[1]} className="resultsModalListItem">
                                        <div>{player?.full_name}: </div>
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
                                const player = typeof playerResult[0] === 'string' ? allPlayersArr.find(player => player.guest_id === playerResult[0])
                                    : allPlayersArr.find(player => player.id === playerResult[0])
                                return (
                                    <div key={playerResult[0] + '--' + playerResult[1]} className="resultsModalListItem">
                                        <div>{player?.full_name}: </div>
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
    // console.log(playerOpponentsReferenceObj)
    //update game for api either initial or updating
    const handleGameForApiUpdate = (targetId, whitePieces, blackPieces, pastGame) => {
        let copy = {}
        //set up game info based on activeTournament or pastGame
        if (!pastGame) {
            //new score
            copy = { ...gameForApi }
            if (copy.id) {
                delete copy.id
            }
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
        const byeMatchup = currentRoundMatchups?.find(matchup => matchup.player1 === null || matchup.player2 === null)
        const whiteBye = activeTournamentPlayers?.find(player => player.id === byeMatchup?.player1 || player.guest_id === byeMatchup?.player1)
        if (activeTournament?.complete === false) {
            if (activeTournament?.in_person === true) {
                // const blackBye = activeTournamentPlayers?.find(player => player.id === byeMatchup.player2 || player.guest_id === byeMatchup.player2)
                return (
                    <section id="tournamentScoringSection">
                        {byeMatchup ?
                            <div key={`${byeMatchup.round} -- ${byeMatchup.match} -- bye`} className="setColor setCustomFont">
                                {whiteBye?.full_name} has bye
                            </div>
                            : ""}

                        {
                            currentRoundMatchups?.map((matchup, index) => {
                                const white = activeTournamentPlayers?.find(player => player.id === matchup.player1 || player.guest_id === matchup.player1)
                                const black = activeTournamentPlayers?.find(player => player.id === matchup.player2 || player.guest_id === matchup.player2)
                                const whiteTargetForIndicator = white?.guest_id ? white?.guest_id : white?.id
                                const blackTargetForIndicator = black?.guest_id ? black?.guest_id : black?.id
                                const matchingGame = tournamentGames.find(tg => {
                                    const gamePlayerWIndicator = tg.player_w.guest_id ? tg.player_w.guest_id : tg.player_w.id
                                    let gamePlayerBIndicator = 0
                                    if (tg.player_b === null) {
                                        gamePlayerBIndicator = null
                                    }
                                    else {
                                        tg.player_b.guest_id ? gamePlayerBIndicator = tg.player_b.guest_id : gamePlayerBIndicator = tg.player_b.id
                                    }
                                    return tg.tournament_round === currentRound && gamePlayerBIndicator === blackTargetForIndicator && gamePlayerWIndicator === whiteTargetForIndicator
                                })
                                if (!matchup) {
                                    return (
                                        <div>
                                            All match ups played. Start new round.
                                        </div>
                                    )
                                }
                                if (black !== undefined && !matchingGame?.winner && matchingGame?.win_style !== 'draw' && playerOpponentsReferenceObj[whiteTargetForIndicator]?.indexOf(blackTargetForIndicator) !== playerOpponentsReferenceObj[whiteTargetForIndicator]?.length + 1) {
                                    return (
                                        <div key={`${matchup.round} -- ${matchup.match} -- ${index}`}
                                            className="tournamentScoringMatchup">
                                            <div
                                                className={gameForApi.id === undefined && gameForApi.winner === whiteTargetForIndicator ? "selectedWhitePiecesMatchup" : "whitePiecesMatchup"}
                                                id="whitePieces"
                                                onClick={(evt) => {
                                                    handleGameForApiUpdate(evt.target.id, white, black)
                                                }}>{white?.full_name}
                                                {/* }}>{white?.guest_id ? white.full_name : white?.username} */}
                                            </div>
                                            <div
                                                className={gameForApi.id === undefined && gameForApi.player_w === whiteTargetForIndicator && gameForApi.player_b === blackTargetForIndicator && gameForApi.win_style === "draw" ? "selectedDrawMatchupButton" : "drawMatchupButton"}
                                                id="drawUpdate"
                                                onClick={(evt) => {
                                                    handleGameForApiUpdate(evt.target.id, white, black)
                                                }}>Draw
                                            </div>
                                            <div
                                                className={gameForApi.id === undefined && gameForApi.winner === blackTargetForIndicator ? "selectedBlackPiecesMatchup" : "blackPiecesMatchup"}
                                                id="blackPieces"
                                                onClick={(evt) => {
                                                    handleGameForApiUpdate(evt.target.id, white, black)
                                                    // }}>{black?.guest_id ? black.full_name : black?.username}
                                                }}>{black.full_name}
                                            </div>
                                            <button
                                                id="scoringSubmit"
                                                className="buttonStyleReject"
                                                onClick={() => {
                                                    if (gameForApi.winner !== 0) {
                                                        sendNewGame(gameForApi)
                                                            .then(() => resetTournamentGames())
                                                        resetGameForApi()
                                                    }
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
                    <section id="tournamentScoringSection">
                        {byeMatchup ?
                            <div key={`${byeMatchup.round} -- ${byeMatchup.match} -- bye`} className="setColor setCustomFont">
                                {whiteBye?.full_name} has bye
                            </div>
                            : ""}
                        {
                            currentRoundMatchups?.map(matchup => {
                                const white = activeTournamentPlayers?.find(player => player.id === matchup.player1 || player.guest_id === matchup.player1)
                                const black = activeTournamentPlayers?.find(player => player.id === matchup.player2 || player.guest_id === matchup.player2)
                                if (black !== undefined) {
                                    return (
                                        <div key={`${matchup.round} -- ${matchup.match}`}
                                            className="tournamentScoringMatchup">
                                            <div
                                                className="whitePiecesMatchup"
                                                id="whitePieces">
                                                {white.full_name}
                                            </div>
                                            <div className="setCustomFont">
                                                Vs
                                            </div>
                                            <div
                                                className="blackPiecesMatchup"
                                                id="blackPieces">
                                                {black.full_name}
                                            </div>
                                        </div>
                                    )
                                }
                            })
                        }
                    </section>
                )
            }
        }
    }
    //iterating tournament games to edit if necessary
    const tableOrEdit = () => {
        const sortedTournamentGames = tournamentGames.sort((a, b) => { return a.id - b.id })
        if (editScores) {
            const editPairings = [...activeTournament?.pairings]
            // const filteredPairings = editPairings.filter(pairing => pairing.round < activeTournament?.rounds)
            return (
                <section id="tournamentEditSection">
                    <button className="buttonStyleReject" id="cancelEditBtn" onClick={() => setEditScores(false)}>cancel edit</button>
                    <section id="previousMatchups">
                        {
                            sortedTournamentGames.map(game => {
                                const white = allPlayersArr.find(player => {
                                    if (game.player_w.guest_id) {
                                        return player.guest_id === game.player_w.guest_id
                                    }
                                    else {
                                        return player.id === game.player_w.id
                                    }
                                })
                                const black = allPlayersArr.find(player => {
                                    if (game.player_b?.guest_id) {
                                        return player.guest_id === game.player_b?.guest_id
                                    }
                                    else {
                                        return player.id === game.player_b?.id
                                    }
                                })
                                const whiteTargetForIndicator = white?.guest_id ? white?.guest_id : white?.id
                                const blackTargetForIndicator = black?.guest_id ? black?.guest_id : black?.id
                                if (game.bye === false) {
                                    return (
                                        <div key={`${game.tournament_round} + ${game.id} + editing`} className="editScoreListItem">
                                            <div>
                                                <div className="setCustomFont">Round {game.tournament_round}</div>
                                            </div>
                                            <div className="editMatchup">
                                                <div className={gameForApi.id === game.id && gameForApi.winner === whiteTargetForIndicator ? "selectedWhitePiecesMatchup" : "whitePiecesMatchup"}
                                                    id="whitePieces"
                                                    onClick={(evt) => {
                                                        handleGameForApiUpdate(evt.target.id, white, black, game)
                                                        // }}>{white?.username || white?.full_name}</div>
                                                    }}>{white?.full_name}</div>
                                                <div className={gameForApi.id === game.id && gameForApi.win_style === "draw" ? "selectedDrawMatchupButton" : "drawMatchupButton"}
                                                    id="drawUpdate"
                                                    onClick={(evt) => {
                                                        handleGameForApiUpdate(evt.target.id, white, black, game)
                                                    }}>Draw</div>
                                                <div className={gameForApi.id === game.id && gameForApi.winner === blackTargetForIndicator ? "selectedBlackPiecesMatchup" : "blackPiecesMatchup"}
                                                    id="blackPieces"
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
                allPlayersArr.map(player => {
                    const playerIdentifier = player.guest_id ? player.guest_id : player.id
                    if (player.guest_id) {
                        resultArr.push([player.full_name, parseFloat(scoreObj[playerIdentifier]), player.guest_id])
                        arrForTieBreakers.push(player.guest_id)
                    }
                    else {
                        resultArr.push([player.full_name, parseFloat(scoreObj[playerIdentifier]), player.id])
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
                            {activeTournament.complete === false ?
                                <button
                                    className="buttonStyleApprove"
                                    onClick={() => {
                                        endTournamentModal.style.display = "flex"
                                        modal.style.display = "none"
                                    }}>End Tournament</button>
                                : ""}
                            <button
                                className="buttonStyleReject"
                                onClick={() => {
                                    modal.style.display = "none"
                                }}>cancel</button>
                        </div>
                    </div>
                    <div id="endTournamentModal" className="setCustomFont">
                        End Tournament?
                        <div id="endTournamentBtnBlock">
                            <button
                                className="buttonStyleApprove"
                                onClick={() => {
                                    endTournament(selectedTournament)
                                        .then(() => {
                                            resetTournaments()
                                            setSelectedTournament(0)
                                        })
                                }
                                }>confirm</button>
                            <button
                                className="buttonStyleReject"
                                onClick={() => {
                                    endTournamentModal.style.display = "none"
                                    modal.style.display = "flex"
                                }}>cancel</button>
                        </div>
                    </div>
                    {editPlayers ? <div id="editPlayersModal" className="setCustomFont">
                        <EditPlayersModal
                            activeTournamentObj={activeTournament}
                            setCurrentTournament={setActiveTournament}
                            // tournamentId={selectedTournament}
                            setEdit={setEditPlayers}
                            playedRounds={currentRound}
                            gamesFromThisRound={tournamentGames.filter(g => g.tournament_round === currentRound)}
                            previousOpponents={playerOpponentsReferenceObj}
                            scoreObject={scoreObj}
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
                        {activeTournament.complete === false ?
                            <button
                                className="progressionControlBtn controlBtnApprove"
                                onClick={() => {
                                    if (window.confirm("create round?")) {
                                        if (byePlayer && byeGame.player_w) {
                                            sendNewGame(byeGame)
                                        }
                                        const tournamentCopy = { ...activeTournament }
                                        const playersArg = []
                                        //need to filter by active tournament players. currently creating matchups for players that have left

                                        for (const opponentRef in playerOpponentsReferenceObj) {
                                            let identifier = null
                                            let isActive = true
                                            if (isNaN(parseInt(opponentRef))) {
                                                identifier = opponentRef
                                                if (!activeTournamentPlayers.find(ap => ap.guest_id === identifier)) {
                                                    isActive = false
                                                }
                                            }
                                            else {
                                                identifier = parseInt(opponentRef)
                                                if (!activeTournamentPlayers.find(ap => ap.id === identifier)) {
                                                    isActive = false
                                                }
                                            }
                                            if (isActive) {
                                                const playerRefObj = {
                                                    id: identifier,
                                                    //added below to account for scores
                                                    score: scoreObj[identifier],
                                                    avoid: playerOpponentsReferenceObj[identifier].filter(ref => ref !== 'bye')
                                                }
                                                if (playerOpponentsReferenceObj[identifier].includes('bye')) {
                                                    playerRefObj.receivedBye = true
                                                    //added below to remove byes from score parameter
                                                    playerRefObj.score--
                                                }
                                                playersArg.push(playerRefObj)
                                            }
                                        }
                                        // console.log(playersArg)
                                        tournamentCopy.pairings = tournamentCopy.pairings.concat(Swiss(playersArg, currentRound + 1))
                                        tournamentCopy.rounds++
                                        // console.log(tournamentCopy)
                                        tournamentCopy.competitors = tournamentCopy.competitors.map(c => { return c.id })
                                        tournamentCopy.guest_competitors = tournamentCopy.guest_competitors.map(gc => { return gc.id })
                                        updateTournament(tournamentCopy)
                                            .then(() => {
                                                resetTournaments()
                                                resetTournamentGames()
                                            })
                                    }
                                }}>New Round</button>
                            : ""}
                        {activeTournament.complete === false ?
                            <button
                                className="progressionControlBtn controlBtnApprove"
                                onClick={() => {
                                    setEditScores(true)
                                    // setScoring(false)
                                }}>edit scores</button>
                            : ""}
                        {scoringButtonOrNone()}
                        {activeTournament.complete === false ?
                            <button className="progressionControlBtn controlBtnApprove" onClick={() => {
                                const currentRoundGames = tournamentGames.filter(g => g.tournament_round === currentRound)
                                if ((currentRoundGames.length === currentRoundMatchups.length && !currentRoundMatchups.find(p => p.player2 === null)) || (currentRoundGames.length === currentRoundMatchups.length - 1 && currentRoundMatchups.find(p => p.player2 === null))) {
                                    window.alert('This round seems to be over. Start new round before adding players')
                                    setEditPlayers(false)
                                }
                                else {
                                    setEditPlayers(true)
                                }
                            }}>edit players</button>
                            : ""}
                        {activeTournament.complete === false ?
                            <button className="progressionControlBtn controlBtnApprove" onClick={() => {
                                setViewTable(!viewTable)
                            }}>View Table</button>
                            : ""}
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
                    <article id="tableCenter">
                        {viewTable ?
                            <section id="tournamentTableContainer">
                                <table id="tournamentTable">
                                    <thead>
                                        <tr key={0} className="tableHeaderRow">
                                            <th className="sticky-col first-col">player</th>
                                            {
                                                roundHtml.map(round => {
                                                    return round
                                                })
                                            }
                                            {currentRound < 6 ? <th ></th> : ""}
                                            <th>score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* {
                                            allPlayersArr.map(p => {
                                                let score = 0
                                                const guestIdOrId = p.guest_id ? p.guest_id : p.id
                                                const tourneyPlayerScores = scoreCard[guestIdOrId]
                                                return (
                                                    <tr key={guestIdOrId} id={guestIdOrId + "--tourneyRow"} className="tablePlayerRow">
                                                        <td key={p.full_name + '--row'} className="tablePlayerCell sticky-col first-col">{p.full_name}</td>
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
                                                                        <td key={guestIdOrId + '--' + index + '--' + p.full_name} className="scoreCell">{s}</td>
                                                                    )
                                                                }
                                                                else {
                                                                    return (
                                                                        <td key={guestIdOrId + '--' + index + '--' + p.full_name} className="scoreCell">0</td>
                                                                    )
                                                                }
                                                            })
                                                        }
                                                        {currentRound < 6 ? <td className="scoreCell"></td> : ""}
                                                        <td key={guestIdOrId + "-- score" + p.full_name} id={guestIdOrId + "-- score"} className="totalScoreCell" value={scoreObj[guestIdOrId]}>
                                                            {score}
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        } */}
                                        {
                                            sortAllPlayersArr(allPlayersArr).map(p => {
                                                let score = 0
                                                const guestIdOrId = p.guest_id ? p.guest_id : p.id
                                                const tourneyPlayerScores = scoreCard[guestIdOrId]
                                                return (
                                                    <tr key={guestIdOrId} id={guestIdOrId + "--tourneyRow"} className="tablePlayerRow">
                                                        <td key={p.full_name + '--row'} className="tablePlayerCell sticky-col first-col">{p.full_name}</td>
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
                                                                        <td key={guestIdOrId + '--' + index + '--' + p.full_name} className="scoreCell">{s}</td>
                                                                    )
                                                                }
                                                                else {
                                                                    return (
                                                                        <td key={guestIdOrId + '--' + index + '--' + p.full_name} className="scoreCell">0</td>
                                                                    )
                                                                }
                                                            })
                                                        }
                                                        {currentRound < 6 ? <td className="scoreCell"></td> : ""}
                                                        <td key={guestIdOrId + "-- score" + p.full_name} id={guestIdOrId + "-- score"} className="totalScoreCell" value={scoreObj[guestIdOrId]}>
                                                            {score}
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
                            </section>
                            : ""}
                    </article>
                    {tableOrEdit()}
                </main>
            </>
        }

    }

}