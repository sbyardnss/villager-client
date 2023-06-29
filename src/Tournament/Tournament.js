import { useState, useEffect, useContext, useRef } from "react"
import { RoundRobin } from "tournament-pairings"
import { TournamentContext } from "./TournamentProvider"
import "./Tournament.css"
import { alterGame, getAllGames, getAllPlayers, getAllTournaments, sendNewGame, sendNewTournament, sendTournamentRoundOutcomes, sendUpdatedGames, updateTournament } from "../ServerManager"
import { ActiveTournament } from "./ActiveTournament"

export const Tournament = () => {
    const { localVillagerObj, tournamentGames, tournaments, setTournaments, players, timeSettings, setGames, selectedTournament, setSelectedTournament, resetTournamentGames, guests } = useContext(TournamentContext)
    const [potentialCompetitors, setPotentialCompetitors] = useState([])
    // const [activeTournament, setActiveTournament] = useState({})
    // const [activeTournamentPlayers, setActiveTournamentPlayers] = useState([])
    // const [currentRound, setCurrentRound] = useState(0)
    // const [currentRoundMatchups, setCurrentRoundMatchups] = useState([])
    // const [scoring, setScoring] = useState(true)
    // const [editScores, setEditScores] = useState(false)
    // const [resultsForTieBreak, updateResultsForTieBreak] = useState([])
    const [pastTournaments, setPastTournaments] = useState(false)
    // const [gameForApi, updateGameForApi] = useState({
    //     player_w: 0,
    //     player_b: 0,
    //     tournament: 0,
    //     time_setting: 0,
    //     win_style: "",
    //     accepted: true,
    //     tournament_round: 0,
    //     winner: 0,
    //     bye: false
    // })
    const [newTournament, updateNewTournament] = useState({
        title: "",
        creator: localVillagerObj.userId,
        competitors: [],
        timeSetting: 0,
        rounds: 1,
        in_person: true,
        pairings: []
    })
    // const [byePlayer, setByePlayer] = useState(0)
    // const [byeGame, setByeGame] = useState({
    //     player_w: 0,
    //     player_b: null,
    //     tournament: 0,
    //     time_setting: 0,
    //     win_style: "",
    //     accepted: true,
    //     tournament_round: 0,
    //     winner: 0,
    //     bye: true
    // })
    useEffect(
        () => {
            const unselectedPlayers = players.filter(p => {
                return !newTournament.competitors.find(c => c === p.id)
            })
            setPotentialCompetitors(unselectedPlayers)
        }, [players, newTournament]
    )

    //getter/setter for tournaments
    const resetTournaments = () => {
        getAllTournaments()
            .then(data => setTournaments(data))
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
    const pastTournamentSection = () => {
        if (pastTournaments === false) {
            return (
                <section>
                    <button onClick={() => setPastTournaments(true)}>
                        view past tournaments
                    </button>
                </section>
            )
        }
        else {
            return (
                <section>
                    <button onClick={() => setPastTournaments(false)}>exit</button>
                    {
                        tournaments?.map(t => {
                            if (t.complete === true) {
                                return (
                                    <li key={t.id}
                                        className="tournamentListItem"
                                        value={t.id}
                                        onClick={(e) => {
                                            setSelectedTournament(e.target.value)
                                        }}>
                                        {t.title}
                                    </li>
                                )
                            }
                        })
                    }
                </section>
            )
        }
    }
    if (selectedTournament) {
        return <>
            <ActiveTournament
                tournamentId={selectedTournament}
            />
        </>


        // const scoringButtonOrNone = () => {
        //     if (activeTournament.in_person === false) {
        //         return (
        //             <button onClick={() => {
        //                 {
        //                     currentRoundMatchups.map(matchup => {
        //                         if (matchup.player2 !== null) {
        //                             const copy = { ...gameForApi }
        //                             copy.winner = null
        //                             copy.player_w = matchup.player1
        //                             copy.player_b = matchup.player2
        //                             sendNewGame(copy)
        //                         }
        //                         else {
        //                             const copy = { ...gameForApi }
        //                             copy.winner = null
        //                             copy.player_w = matchup.player1
        //                             copy.player_b = null
        //                             sendNewGame(copy)
        //                         }

        //                     })
        //                 }
        //             }}>create round games</button>
        //         )
        //     }
        //     else {
        //         return (
        //             <button onClick={() => {
        //                 setScoring(true)
        //                 setEditScores(false)
        //             }}>score</button>
        //         )
        //     }
        // }
        // if (activeTournament && activeTournamentPlayers) {
        //     const modal = document.getElementById('finishTournamentModal')
        //     //current method for displaying results. delete when new useEffect is working
        //     const resultsDisplay = () => {
        //         const results = {}
        //         const resultArr = []
        //         const arrForTieBreakers = []
        //         activeTournamentPlayers.map(player => {
        //             const scoreElement = document.getElementById(player.id + "-- score")
        //             results[player.username] = [parseFloat(scoreElement?.innerHTML), player.id]
        //         })
        //         for (let player in results) {
        //             resultArr.push([player, results[player]])
        //         }
        //         resultArr.sort((a, b) => { return b[1][0] - a[1][0] })
        //         return (
        //             <section id="fullResults" className="setCustomFont">
        //                 <div id="standardResults" >
        //                     <div className="resultsHeader">standard</div>
        //                     {
        //                         resultArr.map(r => {
        //                             arrForTieBreakers.push(r[1][1])
        //                             return (
        //                                 <div key={r[0]} className="resultsModalListItem">
        //                                     <div>{r[0]}: </div>
        //                                     <div>{r[1][0].toString()}</div>
        //                                 </div>
        //                             )
        //                         })
        //                     }
        //                 </div>
        //                 <div id="tieBreakResults">
        //                     <div id="solkoffResults">
        //                         <div className="resultsHeader">solkoff</div>
        //                         {
        //                             arrForTieBreakers.map(r => {
        //                                 const player = activeTournamentPlayers.find(p => p.id === r)
        //                                 // console.log(activeTournamentPlayers)
        //                                 return (
        //                                     <div key={'playerId' + r} className="resultsModalListItem">
        //                                         <div>{player?.username}: </div>
        //                                         <div>{solkoffTieBreaker([r]).toString()}</div>
        //                                     </div>
        //                                 )
        //                             })
        //                         }
        //                     </div>
        //                     <div id="cumulativeResults">
        //                         <div className="resultsHeader">cumulative</div>
        //                         {
        //                             arrForTieBreakers.map(r => {
        //                                 const player = activeTournamentPlayers.find(p => p.id === r)
        //                                 // console.log(activeTournamentPlayers)
        //                                 return (
        //                                     <div key={'playerId' + r} className="resultsModalListItem">
        //                                         <div>{player?.username}: </div>
        //                                         <div>{cumulativeTieBreaker([r]).toString()}</div>
        //                                     </div>
        //                                 )
        //                             })
        //                         }
        //                     </div>
        //                 </div>
        //             </section>
        //         )
        //     }
        //     return <>
        //         <main id="tournamentContainer">
        //             <div id="finishTournamentModal">
        //                 Results
        //                 {resultsDisplay()}
        //                 {/* <div id="modalResults">
        //                 </div> */}
        //                 <div id="modalBtns">
        //                     <button>End Tournament</button>
        //                     <button onClick={() => {
        //                         modal.style.display = "none"
        //                     }}>cancel</button>
        //                 </div>
        //             </div>
        //             <div className="setColor setTournamentFontSize">{activeTournament.title}</div>
        //             <div id="tournamentProgressionControls">
        //                 <button
        //                     className="progressionControlBtn"
        //                     onClick={() => {
        //                         if (window.confirm("create round?")) {
        //                             if (byePlayer) {
        //                                 sendNewGame(byeGame)
        //                             }
        //                             const tournamentCopy = { ...activeTournament }
        //                             tournamentCopy.rounds++
        //                             updateTournament(tournamentCopy)
        //                                 .then(() => {
        //                                     resetTournaments()
        //                                     resetTournamentGames()
        //                                 })
        //                         }
        //                     }}>Finish Round</button>
        //                 <button
        //                     className="progressionControlBtn"
        //                     onClick={() => {
        //                         setSelectedTournament(0)
        //                         setEditScores(false)
        //                         setScoring(false)
        //                     }}>exit</button>
        //                 <button
        //                     className="progressionControlBtn"
        //                     onClick={() => {
        //                         setEditScores(true)
        //                         setScoring(false)
        //                     }}>edit scores</button>
        //                 {scoringButtonOrNone()}
        //                 <button
        //                     className="progressionControlBtn"
        //                     onClick={() => {
        //                         modal.style.display = "flex";
        //                     }}>Results</button>
        //             </div>
        //             <div className="setColor setTournamentFontSize">
        //                 Round {currentRound}
        //             </div>
        //             <section id="matchupsContainer">
        //                 {/* {matchupsOrScoring()} */}
        //                 {submitResultsOrNull()}
        //             </section>
        //             <section id="tournamentTableContainer">
        //                 <table id="tournamentTable">
        //                     <thead>
        //                         <tr key={0} className="tableHeaderRow">
        //                             <th>player</th>
        //                             {
        //                                 roundHtml.map(round => {
        //                                     return round
        //                                 })
        //                             }
        //                             <th>count</th>
        //                         </tr>
        //                     </thead>
        //                     <tbody>
        //                         {
        //                             activeTournamentPlayers.map(tourneyPlayer => {
        //                                 const tourneyPlayerGames = tournamentGames.filter(tg => {
        //                                     return tg.player_b?.id === tourneyPlayer.id || tg.player_w.id === tourneyPlayer.id
        //                                 })
        //                                 const emptyCellCompensation = () => {
        //                                     if (tourneyPlayerGames.length < currentRound) {
        //                                         return (
        //                                             <td></td>
        //                                         )
        //                                     }
        //                                 }
        //                                 let score = 0
        //                                 return (
        //                                     <tr key={tourneyPlayer.id} id={tourneyPlayer.id + "--tourneyRow"}>
        //                                         <td key={tourneyPlayer.id} className="tablePlayerCell">{tourneyPlayer.full_name}</td>
        //                                         {
        //                                             tourneyPlayerGames.map(tpg => {
        //                                                 // if (tpg.player_b?.id === 3 || tpg.player_w?.id === 3) {
        //                                                 //     console.log(tpg)
        //                                                 // }
        //                                                 if (tpg.bye === true) {
        //                                                     score++
        //                                                     return (
        //                                                         <td key={tpg.id} value={1} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResultBye">bye</td>
        //                                                     )
        //                                                 }
        //                                                 if (tpg.winner?.id === tourneyPlayer.id) {
        //                                                     score++
        //                                                     return (
        //                                                         <td key={tpg.id} value={1} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult">1</td>
        //                                                     )
        //                                                 }
        //                                                 else if (tpg.winner === null && tpg.win_style === "draw") {
        //                                                     score += .5
        //                                                     return (
        //                                                         <td key={tpg.id} value={.5} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult">1/2</td>
        //                                                     )
        //                                                 }
        //                                                 else if (tpg.winner === null && !tpg.win_style) {
        //                                                     score = score
        //                                                     return (
        //                                                         <td key={tpg.id} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult"></td>
        //                                                     )
        //                                                 }
        //                                                 else {
        //                                                     score = score
        //                                                     return (
        //                                                         <td key={tpg.id} value={0} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult">0</td>
        //                                                     )
        //                                                 }
        //                                             })
        //                                         }
        //                                         {emptyCellCompensation()}
        //                                         <td key={tourneyPlayer.id + "-- score"} id={tourneyPlayer.id + "-- score"} value={score || "0"}>
        //                                             {score}
        //                                         </td>
        //                                     </tr>
        //                                 )
        //                             })
        //                         }
        //                     </tbody>
        //                 </table>
        //             </section>
        //             {tableOrEdit()}
        //         </main>
        //     </>
        // }
    }
    else {
        return <>
            <main id="tournamentContainer">
                <section id="newTournamentForm">
                    <div id="tournamentPlayerSelectionSection">
                        <div id="competitorSelectionSplit">
                            <div id="potentialLabel" className="setColor setCustomFont">Potential:</div>
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
                        </div>
                        <div id="competitorSelectionSplit">
                            <div id="selectedLabel" className="setColor setCustomFont">Selected:</div>
                            <div id="tournamentSelectedCompetitors">
                                {
                                    newTournament.competitors.map((competitor, index) => {
                                        const player = players.find(p => p.id === competitor)
                                        return (
                                            <li key={player.id + '-- competitor'}
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
                        </div>
                    </div>
                    <section id="tournamentParameters">
                        <div id="tournamentParameterControls">
                            {/* <label className="setColor" htmlFor="title">Tournament name: </label> */}
                            <input
                                type="text"
                                name="title"
                                className="text-input"
                                placeholder="tournament title"
                                value={newTournament.title}
                                onChange={(e) => {
                                    const copy = { ...newTournament }
                                    copy.title = e.target.value
                                    updateNewTournament(copy)
                                }}
                            />
                            <div id="tournamentTimeSettingSelection">
                                <select
                                    className="tournamentFormDropdownSelection"
                                    onChange={(e) => {
                                        const copy = { ...newTournament }
                                        copy.timeSetting = parseInt(e.target.value)//WHY DO I HAVE TO PARSEINT HERE?
                                        updateNewTournament(copy)
                                    }}>
                                    <option key={0} className="timeSelectOption" value={0}>time setting</option>
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
                                <input id="digitalTournamentCheckbox" className="setColor" type="checkbox" onChange={handleChange} />
                                <label id="digitalTournamentLabel" className="setColor">digital tournament</label>
                            </div>
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
                </section>
                <article key="activeTournaments" id="activeTournamentsSection">
                    <h3 id="activeTournamentsHeader">active tournaments</h3>
                    <section id="activeTournamentsList" className="setCustomFont">
                        {
                            tournaments?.map(t => {
                                if (t.complete === false) {
                                    return (
                                        <li key={t.id}
                                            className="tournamentListItem"
                                            value={t.id}
                                            onClick={(e) => {
                                                setSelectedTournament(e.target.value)
                                            }}>
                                            {t.title}
                                        </li>
                                    )
                                }
                            })
                        }
                    </section>
                </article>
                {pastTournamentSection()}
            </main>
        </>
    }
}