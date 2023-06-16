import { useState, useEffect, useContext } from "react"
import { RoundRobin } from "tournament-pairings"
import { TournamentContext } from "./TournamentProvider"
import "./Tournament.css"
import { alterGame, getAllGames, getAllTournaments, sendNewGame, sendNewTournament, sendTournamentRoundOutcomes, sendUpdatedGames, updateTournament } from "../ServerManager"
export const Tournament = () => {
    const { localVillagerObj, tournamentGames, tournaments, setTournaments, players, timeSettings, setGames, selectedTournament, setSelectedTournament, pastPairings } = useContext(TournamentContext)
    const [potentialCompetitors, setPotentialCompetitors] = useState([])
    const [activeTournament, setActiveTournament] = useState({})
    const [activeTournamentPlayers, setActiveTournamentPlayers] = useState([])
    const [currentRound, setCurrentRound] = useState(0)
    const [currentRoundMatchups, setCurrentRoundMatchups] = useState([])
    const [scoring, setScoring] = useState(false)
    const [editScores, setEditScores] = useState(false)
    const [outcomes, updateOutcomes] = useState([])
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
    const [newTournament, updateNewTournament] = useState({
        title: "",
        creator: localVillagerObj.userId,
        competitors: [],
        timeSetting: 0,
        rounds: 1,
        in_person: true,
        pairings: []
    })
    const [byePlayer, setByePlayer] = useState(0)
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
            setPotentialCompetitors(players)
        }, [players]
    )
    useEffect(
        () => {
            const selectedTournamentObj = tournaments.find(t => t.id === selectedTournament)
            setActiveTournament(selectedTournamentObj)
        }, [selectedTournament, tournaments]
    )
    useEffect(
        () => {
            const playersForSelectedTournament = players.filter(p => activeTournament?.competitors.find(c => c === p.id))
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
    //getter/setter for tournaments
    const resetTournaments = () => {
        getAllTournaments()
            .then(data => setTournaments(data))
    }
    const resetGames = () => {
        getAllGames()
            .then(data => setGames(data))
    }
    //code for populating number of table columns based on number of rounds in activeTournament
    const roundPopulation = () => {
        let roundNumber = activeTournament?.rounds;
        let tableHtml = [];
        while (roundNumber > 0) {
            tableHtml.push(<th key={roundNumber} className="roundHeader">{roundNumber}</th>)
            roundNumber--;
        }
        return tableHtml.reverse()
    };
    //handles all forms of manually sending games to api
    const handleGameForApiUpdate = (targetId, whitePieces, blackPieces, pastGame) => {
        let copy = {}
        if (scoring) {
            copy = { ...gameForApi }
            copy.player_w = whitePieces.id
            copy.player_b = blackPieces.id
            copy.tournament = activeTournament?.id
            copy.tournament_round = currentRound
        }
        else {
            copy = { ...pastGame }
            copy.player_w = whitePieces.id
            copy.player_b = blackPieces.id
        }
        if (targetId === "whiteUpdate") {
            copy.winner = whitePieces.id
            copy.win_style = "checkmate"
            updateGameForApi(copy)
        }
        else if (targetId === "drawUpdate") {
            copy.winner = null
            copy.win_style = "draw"
            updateGameForApi(copy)
        }
        else {
            copy.winner = blackPieces.id
            copy.win_style = "checkmate"
            updateGameForApi(copy)
        }
    }

    const handleChange = (evt) => {
        if (evt.target.checked) {
            const copy = { ...newTournament }
            copy.in_person = false
            updateNewTournament(copy)
        }
        else {
            const copy = { ...newTournament }
            copy.in_person = true
            updateNewTournament(copy)
        }
    }

    const roundHtml = roundPopulation()

    //function for populating scoring options if tournament is played in person
    const submitResultsOrNull = () => {
        if (activeTournament?.in_person === true) {
            return (
                <section>
                    {
                        currentRoundMatchups?.map(matchup => {
                            const white = activeTournamentPlayers?.find(player => player.id === matchup.player1)
                            const black = activeTournamentPlayers?.find(player => player.id === matchup.player2)
                            const copy = { ...gameForApi }
                            copy.player_w = white?.id
                            copy.player_b = black?.id

                            if (black === undefined) {
                                return (
                                    <div key={`${matchup.round} -- ${matchup.match} -- bye`}>
                                        {white?.full_name} has bye
                                    </div>
                                )
                            }
                            return (
                                <div key={`${matchup.round} -- ${matchup.match}`}>
                                    <div
                                        className="whitePiecesMatchup"
                                        id="whitePieces"
                                        onClick={(evt) => {
                                            handleGameForApiUpdate(evt.target.id, white, black)
                                        }}>{white?.full_name}
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
                                        }}>{black?.full_name}
                                    </div>
                                    <button onClick={() => {
                                        sendNewGame(gameForApi)
                                            .then(() => resetGames())
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
                                const copy = { ...gameForApi }
                                copy.player_w = white?.id
                                copy.player_b = black?.id ? black.id : null
                                const alreadyCreatedGameObj = tournamentGames.find(g => g.tournament === copy.tournament && g.player_b?.id === copy.player_b && g.player_w?.id === copy.player_w)
                                const alreadyCreatedByeGame = tournamentGames.find(g => g.tournament === copy.tournament && g.player_b === copy.player_b && g.player_w?.id === copy.player_w)
                                if (tournamentGames) {
                                    if (!alreadyCreatedGameObj && !alreadyCreatedByeGame) {
                                        copy.pgn = ""
                                        if (copy.player_b === null) {
                                            copy.bye = true
                                            copy.winner = white?.id
                                            copy.win_style = "bye"
                                            // console.log(copy)
                                            sendNewGame(copy) 
                                        }
                                        else {
                                            copy.winner = null
                                            // console.log(copy)

                                            sendNewGame(copy)
                                        }
                                    }
                                }
                                if (white?.id && black?.id) {
                                    return (
                                        <tr key={matchup.round + matchup.match}>
                                            <td className="whitePiecesMatchup">{white.full_name}</td>
                                            <td className="matchupTableVS">vs</td>
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
    //function for populating section for updating previous games
    const tableOrEdit = () => {
        if (editScores) {
            const editPairings = [...activeTournament?.pairings]
            const filteredPairings = editPairings.filter(pairing => pairing.round < activeTournament?.rounds)
            return (
                <section>
                    {
                        tournamentGames.map(game => {
                            const white = activeTournamentPlayers.find(player => player.id === game.player_w.id)
                            const black = activeTournamentPlayers.find(player => player.id === game.player_b?.id)
                            // const matchup = tournamentGames?.find(game => game.tournament_round === pairing.round && game.player_w?.id === white?.id && game.player_b?.id === black?.id)
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
                                            .then(() => resetGames())
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
    }
    if (selectedTournament) {
        if (activeTournament && activeTournamentPlayers) {
            return <>
                <main id="tournamentContainer">
                    {activeTournament.title}
                    <button onClick={() => {
                        if (window.confirm("create round?")) {
                            if (byePlayer) {
                                sendNewGame(byeGame)
                            }
                            const tournamentCopy = { ...activeTournament }
                            tournamentCopy.rounds++
                            updateTournament(tournamentCopy)
                                .then(() => {
                                    resetTournaments()
                                    resetGames()
                                })
                        }
                    }}>Start Next Round</button>
                    <button onClick={() => {
                        setSelectedTournament(0)
                        setEditScores(false)
                        setScoring(false)
                    }}>exit tournament</button>
                    <button onClick={() => {
                        setEditScores(true)
                        setScoring(false)
                    }}>edit scores</button>
                    <button onClick={() => {
                        setScoring(true)
                        setEditScores(false)
                    }}>score</button>
                    <section id="matchupsContainer">
                        <div>
                            Round {currentRound}
                        </div>
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
                                                        if (tpg.bye === true) {
                                                            score++
                                                            return (
                                                                <td key={tpg.id} value={1} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResultBye">bye</td>
                                                            )
                                                        }
                                                        if (tpg.winner === tourneyPlayer.id) {
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
                                                            return (
                                                                <td key={tpg.id} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult"></td>
                                                            )
                                                        }
                                                        else {
                                                            return (
                                                                <td key={tpg.id} value={0} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult">0</td>
                                                            )
                                                        }
                                                    })
                                                }
                                                {emptyCellCompensation()}
                                                <td key={tourneyPlayer.id + "-- score"} id={tourneyPlayer.id + "-- score"}>
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
    else {
        return <>
            <main id="tournamentContainer">
                <section id="newTournamentForm">
                    <input
                        type="text"
                        name="title"
                        value={newTournament.title}
                        onChange={(e) => {
                            const copy = { ...newTournament }
                            copy.title = e.target.value
                            updateNewTournament(copy)
                        }}
                    />
                    <div id="tournamentPotentialCompetitorSelection">
                        {
                            potentialCompetitors.map((p, index) => {
                                return (
                                    <li key={p.id}
                                        className="newTournamentPlayerListItem"
                                        onClick={() => {
                                            const copy = [...potentialCompetitors]
                                            copy.splice(index, 1)
                                            setPotentialCompetitors(copy)
                                            const tournamentCopy = { ...newTournament }
                                            tournamentCopy.competitors.push(p.id)
                                            updateNewTournament(tournamentCopy)
                                        }}>
                                        {p.full_name}
                                    </li>
                                )
                            })
                        }
                    </div>
                    <div id="tournamentSelectedCompetitors">
                        {
                            newTournament.competitors.map((competitor, index) => {
                                const player = players.find(p => p.id === competitor)
                                return (
                                    <li key={competitor.id}
                                        className="newTournamentPlayerListItem"
                                        onClick={() => {
                                            const tournamentCopy = { ...newTournament }
                                            tournamentCopy.competitors.splice(index, 1)
                                            updateNewTournament(tournamentCopy)
                                            const copy = [...potentialCompetitors]
                                            copy.push(competitor)
                                            setPotentialCompetitors(copy)
                                        }}>
                                        {player.full_name}
                                    </li>
                                )
                            })
                        }
                    </div>
                    <div id="tournamentTimeSettingSelection">
                        <select
                            className="tournamentFormDropdownSelection"
                            onChange={(e) => {
                                const copy = { ...newTournament }
                                copy.timeSetting = parseInt(e.target.value)//WHY DO I HAVE TO PARSEINT HERE?
                                updateNewTournament(copy)
                            }}>
                            <option key={0} className="timeSelectOption" value={0}>select time and increment</option>
                            {
                                timeSettings.map(ts => {
                                    return (
                                        <option key={ts.id} value={ts.id} className="newTournamentTimeSettingListItem">
                                            {ts.time_amount} minutes -- {ts.increment} second increment
                                        </option>
                                    )
                                })
                            }
                        </select>
                    </div>
                    <div>
                        <input type="checkbox" onChange={handleChange} />
                        <label>digital tournament</label>
                    </div>
                    <div id="tournamentSubmit">
                        <button onClick={() => {
                            if (newTournament.competitors && newTournament.timeSetting && newTournament.title) {
                                if (window.confirm("Everybody ready?")) {
                                    const copy = { ...newTournament }
                                    copy.pairings = RoundRobin(newTournament.competitors)
                                    sendNewTournament(copy)
                                        .then(() => {
                                            resetTournaments()
                                        })
                                }
                            }
                        }}>
                            Start Tournament
                        </button>
                    </div>
                </section>
                <article key="activeTournaments">
                    <h2>active tournaments</h2>
                    <section id="activeTournaments">
                        {
                            tournaments?.map(t => {
                                return (
                                    <li key={t.id}
                                        className="activeTournamentListItem"
                                        value={t.id}
                                        onClick={(e) => {
                                            setSelectedTournament(e.target.value)
                                        }}>
                                        {t.title}
                                    </li>
                                )
                            })
                        }
                    </section>
                </article>
            </main>
        </>
    }
}
//function for populating section for submitting new game results
    // const matchupsOrScoring = () => {
    //     if (scoring) {
    //         return (
    //             <section>
    //                 {
    //                     currentRoundMatchups?.map(matchup => {
    //                         const white = activeTournamentPlayers?.find(player => player.id === matchup.player1)
    //                         const black = activeTournamentPlayers?.find(player => player.id === matchup.player2)
    //                         if (black === undefined) {
    //                             return (
    //                                 <div key={`${matchup.round} -- ${matchup.match} -- bye`}>
    //                                     {white.full_name} has bye
    //                                 </div>
    //                             )
    //                         }
    //                         return (
    //                             <div key={`${matchup.round} -- ${matchup.match}`}>
    //                                 <div
    //                                     className="whitePiecesMatchup"
    //                                     id="whitePieces"
    //                                     onClick={(evt) => {
    //                                         handleGameForApiUpdate(evt.target.id, white, black)
    //                                     }}>{white?.full_name}
    //                                 </div>
    //                                 <div
    //                                     className="drawMatchupButton"
    //                                     id="drawUpdate"
    //                                     onClick={(evt) => {
    //                                         handleGameForApiUpdate(evt.target.id, white, black)
    //                                     }}>Draw
    //                                 </div>
    //                                 <div
    //                                     className="blackPiecesMatchup"
    //                                     id="blackPieces"
    //                                     onClick={(evt) => {
    //                                         handleGameForApiUpdate(evt.target.id, white, black)
    //                                     }}>{black?.full_name}
    //                                 </div>
    //                                 <button onClick={() => {
    //                                     sendNewGame(gameForApi)
    //                                         .then(() => resetGames())
    //                                 }}>
    //                                     submit
    //                                 </button>
    //                             </div>
    //                         )
    //                     })
    //                 }
    //             </section>
    //         )
    //     }
    //     else {
    //         return (
    //             <table>
    //                 <thead>
    //                     <tr className="tableHeaderRow">
    //                         <th>white player</th>
    //                         <th></th>
    //                         <th>black player</th>
    //                     </tr>
    //                 </thead>
    //                 <tbody>
    //                     {
    //                         currentRoundMatchups?.map(matchup => {
    //                             const white = activeTournamentPlayers.find(player => player.id === matchup.player1)
    //                             const black = activeTournamentPlayers.find(player => player.id === matchup.player2)
    //                             if (white?.id && black?.id) {
    //                                 return (
    //                                     <tr key={matchup.round + matchup.match}>
    //                                         <td className="whitePiecesMatchup">{white.full_name}</td>
    //                                         <td className="matchupTableVS">vs</td>
    //                                         <td className="blackPiecesMatchup">{black.full_name}</td>
    //                                     </tr>
    //                                 )
    //                             }
    //                             if (white?.id && black === undefined) {
    //                                 return (
    //                                     <tr key={matchup.round + matchup.match}>
    //                                         <td className="whitePiecesMatchup">{white.full_name}</td>
    //                                         <td className="matchupTableVS"></td>
    //                                         <td className="blackPiecesMatchup">BYE</td>
    //                                     </tr>
    //                                 )
    //                             }
    //                         })
    //                     }
    //                 </tbody>
    //             </table>
    //         )
    //     }
    // }