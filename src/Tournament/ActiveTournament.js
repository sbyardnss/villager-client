import { useState, useEffect, useContext, useRef } from "react"
import { TournamentContext } from "./TournamentProvider"
import { alterGame, endTournament, getAllGames, getAllPlayers, getAllTournaments, sendNewGame, sendNewTournament, sendTournamentRoundOutcomes, sendUpdatedGames, updateTournament } from "../ServerManager"
import "./Tournament.css"


export const ActiveTournament = () => {
    const { tournaments, setTournaments, players, guests, playersAndGuests, timeSettings, tournamentGames, selectedTournament, setSelectedTournament, resetTournamentGames } = useContext(TournamentContext)
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
    useEffect(
        () => {
            const selectedTournamentObj = tournaments?.find(t => t.id === selectedTournament)
            setActiveTournament(selectedTournamentObj)
        }, [selectedTournament, tournaments]
    )
    useEffect(
        () => {
            // const playersForSelectedTournament = players.filter(p => activeTournament?.competitors?.find(c => c === p.id))
            const playersForSelectedTournament = playersAndGuests.filter(p => {
                if (p.guest_id) {
                    return activeTournament?.guest_competitors?.find(gc => p.guest_id === gc.guest_id)
                }
                else {
                    return activeTournament?.competitors?.find(c => c === p.id)
                }
            })
            setActiveTournamentPlayers(playersForSelectedTournament)
            
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
            if (activeTournament){
                const copy = { ...gameForApi }
                copy.tournament = activeTournament?.id
                copy.time_setting = activeTournament?.time_setting
                copy.tournament_round = activeTournament?.rounds
                updateGameForApi(copy)
            }
        },[activeTournament]
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
            const playerGames = resultsForTieBreak.filter(r => {
                if (typeof playerId === 'string') {
                    return r.black?.guest_id === playerId || r.white?.guest_id === playerId
                }
                return r.black?.id === playerId || r.white?.id === playerId
            })
            let opponentsTotalScore = 0.0
            for (const gameResult of playerGames) {
                // let opponentId = gameResult.white === playerId ? gameResult.black?.id : gameResult.white?.id
                let opponentId = ''
                let opponentIdNum = 0
                //opponentId currently staying null
                if (typeof playerId === 'string') {
                    if (gameResult.white.guest_id === playerId) {
                        // gameResult.black?.guest_id ? opponentId = gameResult.black?.guest_id : opponentIdNum = gameResult.black?.id
                        if (gameResult.black?.guest_id) {
                            opponentId = gameResult.black.guest_id || null
                        }
                        else {
                            opponentIdNum = gameResult.black?.id || null
                        }
                    }
                    else {
                        // gameResult.white?.guest_id ? opponentId = gameResult.white?.guest_id : opponentIdNum = gameResult.white?.id
                        if (gameResult.white?.guest_id) {
                            opponentId = gameResult.white.guest_id
                        }
                        else {
                            opponentIdNum = gameResult.white?.id
                        }
                    }
                }

                //code failing before this line
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
            const playerGames = resultsForTieBreak.filter(r => {
                if (typeof playerId === 'string') {
                    return r.black?.guest_id === playerId || r.white?.guest_id === playerId
                }
                return r.black?.id === playerId || r.white?.id === playerId
            })
            for (const game of playerGames) {
                if (game.winner?.id === playerId || game.winner?.guest_id === playerId) {
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
            if (whitePieces.guest_id) {
                copy.player_w_model_type = 'guestplayer'
                copy.player_w = whitePieces.guest_id
            }
            else {
                copy.player_w_model_type = 'player'
                copy.player_w = whitePieces.id

            }
            if (blackPieces.guest_id) {
                copy.player_b_model_type = 'guestplayer'
                copy.player_b = blackPieces.guest_id
            }
            else {
                copy.player_b_model_type = 'player'
                copy.player_b = blackPieces?.id
            }
            // copy.tournament = activeTournament?.id
            // copy.tournament_round = currentRound
            // updateGameForApi(copy)
        }
        else {
            copy = { ...pastGame }
            console.log(copy)
            if (whitePieces.guest_id) {
                copy.player_w_model_type = 'guestplayer'
                copy.player_w = whitePieces.guest_id
            }
            else {
                copy.player_w_model_type = 'player'
                copy.player_w = whitePieces.id

            }
            if (blackPieces.guest_id) {
                copy.player_b_model_type = 'guestplayer'
                copy.player_b = blackPieces.guest_id
            }
            else {
                copy.player_b_model_type = 'player'
                copy.player_b = blackPieces?.id

            }
            // updateGameForApi(copy)
        }
        if (!pastGame) {
            if (targetId === "whitePieces") {
                // console.log(blackPieces)
                if (whitePieces.guest_id) {
                    copy.winner_model_type = 'guestplayer'
                    copy.winner = whitePieces.guest_id
                }
                else {
                    copy.winner_model_type = 'player'
                    copy.winner = whitePieces.id
                }
                copy.win_style = "checkmate"
                updateGameForApi(copy)
            }
            if (targetId === "drawUpdate") {
                copy.winner = null
                copy.win_style = "draw"
                updateGameForApi(copy)
            }
            if (targetId === "blackPieces") {
                
                if (blackPieces.guest_id) {
                    copy.winner_model_type = 'guestplayer'
                    copy.winner = blackPieces.guest_id
                }
                else {
                    copy.winner_model_type = 'player'
                    copy.winner = blackPieces.id
                }
                copy.win_style = "checkmate"
                updateGameForApi(copy)
            }
        }
        else {
            if (targetId === "whiteUpdate") {
                // console.log(blackPieces)
                if (whitePieces.guest_id) {
                    copy.winner_model_type = 'guestplayer'
                    copy.winner = whitePieces.guest_id
                }
                else {
                    copy.winner_model_type = 'player'
                    copy.winner = whitePieces.id
                }
                copy.win_style = "checkmate"
                updateGameForApi(copy)
            }
            if (targetId === "drawUpdate") {
                copy.winner = null
                copy.win_style = "draw"
                updateGameForApi(copy)
            }
            if (targetId === "blackUpdate") {
                if (blackPieces.guest_id) {
                    copy.winner_model_type = 'guestplayer'
                    copy.winner = blackPieces.guest_id
                }
                else {
                    copy.winner_model_type = 'player'
                    copy.winner = blackPieces.id
                }
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
                                const white = activeTournamentPlayers?.find(player => player.id === matchup.player1 || player.guest_id === matchup.player1)
                                const black = activeTournamentPlayers?.find(player => player.id === matchup.player2 || player.guest_id === matchup.player2)
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
                <section id="tournamentEditSection">
                    <button className="buttonStyleReject" id="cancelEditBtn" onClick={() => setEditScores(false)}>cancel edit</button>
                    <section id="previousMatchups">
                        {
                            tournamentGames.map(game => {
                                // const white = activeTournamentPlayers.find(player => player.id === game.player_w.id)
                                // const black = activeTournamentPlayers.find(player => player.id === game.player_b?.id)
                                const white = activeTournamentPlayers.find(player => {
                                    if (game.player_w.guest_id) {
                                        return player.guest_id === game.player_w.guest_id
                                    }
                                    else {
                                        return player.id === game.player_w.id
                                    }
                                })
                                const black = activeTournamentPlayers.find(player => {
                                    if (game.player_b?.guest_id){
                                        return player.guest_id === game.player_b?.guest_id
                                    }
                                    else {
                                        return player.id === game.player_b?.id
                                    }
                                    
                                })
                                // const matchup = tournamentGames?.find(game => game.tournament_round === pairing.round && game.player_w?.id === white?.id && game.player_b?.id === black?.id)
                                if (game.winner !== null) {
                                    // if (game.bye === true) {
                                    //     return (
                                    //         <div key={`${game.tournament_round} + ${game.id} + editing`} className="editMatchup">
                                    //             <div>Round {game.tournament_round}</div>
                                    //             <div className="whitePiecesMatchup"
                                    //                 id="whiteUpdate">{white.full_name}</div>
                                    //         </div>
                                    //     )
                                    // }
                                    // else {
                                    if (game.bye === false) {

                                        return (
                                            <div key={`${game.tournament_round} + ${game.id} + editing`} className="editScoreListItem">
                                                <div>
                                                    <div className="setCustomFont">Round {game.tournament_round}</div>
                                                </div>
                                                <div className="editMatchup">
                                                    <div className="whitePiecesMatchup"
                                                        id="whiteUpdate"
                                                        onClick={(evt) => {
                                                            handleGameForApiUpdate(evt.target.id, white, black, game)
                                                        }}>{white.username || white.full_name}</div>
                                                    <div className="drawMatchupButton"
                                                        id="drawUpdate"
                                                        onClick={(evt) => {
                                                            handleGameForApiUpdate(evt.target.id, white, black, game)
                                                        }}>Draw</div>
                                                    <div className="blackPiecesMatchup"
                                                        id="blackUpdate"
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
                                    }
                                // }
                            })
                        }
                    </section>
                </section>
            )
        }
    }




    const scoringButtonOrNone = () => {
        if (activeTournament.in_person === false) {
            return (
                <button className="controlBtnApprove" onClick={() => {
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
            return null
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
                    const scoreElement = document.getElementById(player.guest_id ? player.guest_id + "-- score" : player.id + "-- score")
                    if (player.guest_id) {
                        results[player.full_name] = [parseFloat(scoreElement?.innerHTML), player.guest_id]
                    }
                    else {
                        results[player.username] = [parseFloat(scoreElement?.innerHTML), player.id]
                    }
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
                                        const player = activeTournamentPlayers.find(p => {
                                            if (p.guest_id) {
                                                return p.guest_id === r
                                            }
                                            return p.id === r
                                        })

                                        // console.log(activeTournamentPlayers)
                                        return (
                                            <div key={'playerId' + r} className="resultsModalListItem">
                                                <div>{player?.guest_id ? player?.full_name : player?.username}: </div>
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
                                        const player = activeTournamentPlayers.find(p => {
                                            if (p.guest_id) {
                                                return p.guest_id === r
                                            }
                                            return p.id === r
                                        })                                        // console.log(activeTournamentPlayers)
                                        return (
                                            <div key={'playerId' + r} className="resultsModalListItem">
                                                <div>{player?.guest_id ? player?.full_name : player?.username}: </div>
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
                    <div id="activeTournamentHeader">
                        <div className="setColor setTournamentFontSize">{activeTournament.title}</div>
                        <button
                            className="progressionControlBtn buttonStyleReject"
                            onClick={() => {
                                setSelectedTournament(0)
                                setEditScores(false)
                                setScoring(false)
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
                                    tournamentCopy.rounds++
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
                                setScoring(false)
                            }}>edit scores</button>
                        {scoringButtonOrNone()}
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
                                            if (tourneyPlayer.guest_id) {
                                                return tg.player_b?.guest_id === tourneyPlayer.guest_id || tg.player_w.guest_id === tourneyPlayer.guest_id
                                            }
                                            else {
                                                return !tg.player_b?.guest_id && tg.player_b?.id === tourneyPlayer.id || !tg.player_w.guest_id && tg.player_w.id === tourneyPlayer.id
                                            }
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
                                            <tr key={tourneyPlayer.guest_id ? tourneyPlayer.guest_id : tourneyPlayer.id} id={tourneyPlayer.id + "--tourneyRow"}>
                                                <td key={tourneyPlayer.id} className="tablePlayerCell">{tourneyPlayer.full_name}</td>
                                                {
                                                    tourneyPlayerGames.map(tpg => {
                                                        // if (tpg.player_b?.id === 3 || tpg.player_w?.id === 3) {
                                                        //     console.log(tpg)
                                                        // }
                                                        const idMaker = () => {
                                                            if (tourneyPlayer.guest_id) {
                                                                return tpg.id + "--" + tourneyPlayer.guest_id
                                                            }
                                                            else {
                                                                return tpg.id + "--" + tourneyPlayer.id
                                                            }
                                                        }
                                                        if (tpg.bye === true) {
                                                            score++
                                                            return (
                                                                <td key={tpg.id} value={1} id={idMaker()} className="tournamentGameResultBye">bye</td>
                                                            )
                                                        }
                                                        if (tpg.winner?.id === tourneyPlayer.id) {
                                                            score++
                                                            return (
                                                                <td key={tpg.id} value={1} id={idMaker()} className="tournamentGameResult">1</td>
                                                            )
                                                        }
                                                        else if (tpg.winner === null && tpg.win_style === "draw") {
                                                            score += .5
                                                            return (
                                                                <td key={tpg.id} value={.5} id={idMaker()} className="tournamentGameResult">1/2</td>
                                                            )
                                                        }
                                                        else if (tpg.winner === null && !tpg.win_style) {
                                                            score = score
                                                            return (
                                                                <td key={tpg.id} id={idMaker()} className="tournamentGameResult"></td>
                                                            )
                                                        }
                                                        else {
                                                            score = score
                                                            return (
                                                                <td key={tpg.id} value={0} id={idMaker()} className="tournamentGameResult">0</td>
                                                            )
                                                        }
                                                    })
                                                }
                                                {emptyCellCompensation()}
                                                <td key={tourneyPlayer.guest_id ? tourneyPlayer.guest_id + "-- score" : tourneyPlayer.id + "-- score"} id={tourneyPlayer.guest_id ? tourneyPlayer.guest_id + "-- score" : tourneyPlayer.id + "-- score"} value={score || "0"}>
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