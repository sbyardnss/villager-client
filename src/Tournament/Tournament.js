import { useState, useEffect, useContext } from "react"
import { RoundRobin } from "tournament-pairings"
import { TournamentContext } from "./TournamentProvider"
import "./Tournament.css"
import { getAllGames, getAllTournaments, sendNewGame, sendNewTournament, updateTournament } from "../ServerManager"
export const Tournament = () => {
    const { localVillagerObj, tournamentGames, tournaments, setTournaments, players, timeSettings, setGames, selectedTournament, setSelectedTournament, pastPairings } = useContext(TournamentContext)
    const [potentialCompetitors, setPotentialCompetitors] = useState([])
    const [activeTournament, setActiveTournament] = useState({})
    const [activeTournamentPlayers, setActiveTournamentPlayers] = useState([])
    const [currentRound, setCurrentRound] = useState(0)
    const [currentRoundMatchups, setCurrentRoundMatchups] = useState([])
    const [gameForApi, updateGameForApi] = useState({
        player_w: 0,
        player_b: 0,
        w_notes: "",
        b_notes: "",
        tournament: activeTournament?.id,
        time_setting: activeTournament?.timeSetting,
        accepted: true
    })
    const [newTournament, updateNewTournament] = useState({
        title: "",
        creator: localVillagerObj.userId,
        competitors: [],
        timeSetting: 0,
        rounds: 1,
        pairings: []
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
                setCurrentRoundMatchups(currentRoundPairings)
            }
        }, [currentRound]
    )
    useEffect(
        () => {

        }, []
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
    const roundHtml = roundPopulation()
    console.log(activeTournament?.pairings)
    if (selectedTournament) {
        if (activeTournament && activeTournamentPlayers) {
            return <>
                <main id="tournamentContainer">
                    {activeTournament.title}
                    {/* {
                        activeTournamentPlayers.map(tourneyPlayer => {
                            return (
                                <li key={tourneyPlayer.id} className="tournamentPlayerListItem">{tourneyPlayer.full_name}</li>
                            )
                        })
                    } */}
                    <button onClick={() => {
                        if (window.confirm("create round?")) {
                            const tournamentCopy = { ...activeTournament }
                            tournamentCopy.rounds++
                            updateTournament(tournamentCopy)
                                .then(() => {
                                    resetTournaments()
                                })
                            // getAllGames().then(data => setGames(data))
                        }
                    }}>Start Next Round</button>
                    <button onClick={() => setSelectedTournament(0)}>exit tournament</button>
                    <section id="matchupsContainer">
                        <div>
                            Round {currentRound}
                        </div>
                        <table>
                            <thead>
                                <tr className="tableHeaderRow">
                                    <th>white player</th>
                                    <th>black player</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    currentRoundMatchups?.map(matchup => {
                                        const white = activeTournamentPlayers.find(player => player.id === matchup.player1)
                                        const black = activeTournamentPlayers.find(player => player.id === matchup.player2)
                                        return (
                                            <tr>
                                                <td>{white.full_name}</td>
                                                <td>{black.full_name}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
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
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    activeTournamentPlayers.map(tourneyPlayer => {
                                        console.log(tournamentGames)
                                        const tourneyPlayerGames = tournamentGames.filter(tg => {
                                            return tg.player_b.id === tourneyPlayer.id || tg.player_w.id === tourneyPlayer.id
                                        })
                                        return (
                                            <tr key={tourneyPlayer.id}>
                                                <td key={tourneyPlayer.id} className="tablePlayerCell">{tourneyPlayer.full_name}</td>
                                                {
                                                    tourneyPlayerGames.map(tpg => {
                                                        return (
                                                            tpg.winner.id === tourneyPlayer.id ? <td key={tpg.id} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult">1</td> :
                                                                tpg.winner === null ? <td key={tpg.id} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult">.5</td> :
                                                                    <td key={tpg.id} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult">0</td>
                                                        )
                                                    })
                                                }
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </section>
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
                                            tournamentCopy.competitors.push(p)
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
                                        {competitor.full_name}
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