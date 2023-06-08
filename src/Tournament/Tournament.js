import { useState, useEffect, useContext } from "react"
import { RoundRobin } from "tournament-pairings"
import { TournamentContext } from "./TournamentProvider"
import "./Tournament.css"
import { getAllGames, getAllTournaments, sendNewGame, sendNewTournament, sendTournamentRoundOutcomes, updateTournament } from "../ServerManager"
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
        w_notes: "",
        b_notes: "",
        tournament: 0,
        time_setting: 0,
        win_style: "",
        accepted: true,
        tournament_round: 0,
        winner: 0
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
                setCurrentRoundMatchups(currentRoundPairings)
                const copy = { ...gameForApi }
                copy.tournament_round = activeTournament?.rounds
                updateGameForApi(copy)
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
    const matchupsOrScoring = () => {
        if (scoring) {
            return (
                <table>
                    <thead>
                        <tr className="tableHeaderRow">
                            <th></th>
                            <th>outcomes</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            currentRoundMatchups?.map(matchup => {
                                const white = activeTournamentPlayers.find(player => player.id === matchup.player1)
                                const black = activeTournamentPlayers.find(player => player.id === matchup.player2)
                                return (
                                    <tr key={matchup.round + matchup.match}>
                                        <td className="whitePiecesMatchup"
                                            onClick={() => {
                                                const copy = { ...gameForApi }
                                                copy.winner = white.id
                                                copy.player_w = white.id
                                                copy.player_b = black.id
                                                copy.win_style = "checkmate"
                                                copy.tournament_round = currentRound
                                                const outcomeCopy = [...outcomes]
                                                outcomeCopy.push(copy)
                                                updateOutcomes(outcomeCopy)
                                            }}>{white.full_name}</td>
                                        <td className="drawMatchupButton"
                                            onClick={() => {
                                                const copy = { ...gameForApi }
                                                copy.winner = null
                                                copy.player_w = white.id
                                                copy.player_b = black.id
                                                copy.win_style = "draw"
                                                copy.tournament_round = currentRound
                                                const outcomeCopy = [...outcomes]
                                                outcomeCopy.push(copy)
                                                updateOutcomes(outcomeCopy)
                                            }}>Draw</td>
                                        <td className="blackPiecesMatchup"
                                            onClick={() => {
                                                const copy = { ...gameForApi }
                                                copy.winner = black.id
                                                copy.player_w = white.id
                                                copy.player_b = black.id
                                                copy.win_style = "checkmate"
                                                copy.tournament_round = currentRound
                                                const outcomeCopy = [...outcomes]
                                                outcomeCopy.push(copy)
                                                updateOutcomes(outcomeCopy)
                                            }}>{black.full_name}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            )
        }
        else {
            return (
                <table>
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
                                return (
                                    <tr key={matchup.round + matchup.match}>
                                        <td className="whitePiecesMatchup">{white.full_name}</td>
                                        <td className="matchupTableVS">vs</td>
                                        <td className="blackPiecesMatchup">{black.full_name}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            )
        }
    }
    const tableOrEdit = () => {
        if (editScores) {
            const editPairings = [...activeTournament?.pairings]
            const filteredPairings = editPairings.filter(pairing => pairing.round <= activeTournament?.rounds)
            return (
                <table>
                    <thead>
                        <tr className="tableHeaderRow">
                            <th></th>
                            <th>outcomes</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            filteredPairings.map(pairing => {
                                const white = activeTournamentPlayers.find(player => player.id === pairing.player1)
                                const black = activeTournamentPlayers.find(player => player.id === pairing.player2)
                                const matchup = tournamentGames?.find(game => game.tournament_round === pairing.round && game.player_w?.id === white.id && game.player_b?.id === black.id)
                                return (
                                    <tr key={pairing?.round + pairing.player1 + "editing"}>
                                        <td className="whitePiecesMatchup"
                                            onClick={() => {
                                                const copy = { ...gameForApi }
                                                copy.winner = white.id
                                                copy.player_w = white.id
                                                copy.player_b = black.id
                                                copy.win_style = "checkmate"
                                                const outcomeCopy = [...outcomes]
                                                outcomeCopy.push(copy)
                                                updateOutcomes(outcomeCopy)
                                            }}>{white.full_name}</td>
                                        <td className="drawMatchupButton"
                                            onClick={() => {
                                                const copy = { ...gameForApi }
                                                copy.winner = null
                                                copy.player_w = white.id
                                                copy.player_b = black.id
                                                copy.win_style = "draw"
                                                const outcomeCopy = [...outcomes]
                                                outcomeCopy.push(copy)
                                                updateOutcomes(outcomeCopy)
                                            }}>Draw</td>
                                        <td className="blackPiecesMatchup"
                                            onClick={() => {
                                                const copy = { ...gameForApi }
                                                copy.winner = black.id
                                                copy.player_w = white.id
                                                copy.player_b = black.id
                                                copy.win_style = "checkmate"
                                                const outcomeCopy = [...outcomes]
                                                outcomeCopy.push(copy)
                                                updateOutcomes(outcomeCopy)
                                            }}>{black.full_name}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            )
        }
    }
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
                    <button onClick={() => setEditScores(true)}>edit scores</button>
                    <button onClick={() => setScoring(true)}>score</button>
                    <button onClick={() => {
                        if (window.confirm("submit scores?")) {
                            sendTournamentRoundOutcomes(outcomes)
                                .then(() => {
                                    resetGames()
                                })
                        }
                    }}>submit scores</button>
                    <section id="matchupsContainer">
                        <div>
                            Round {currentRound}
                        </div>
                        {matchupsOrScoring()}
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
                                            return tg.player_b.id === tourneyPlayer.id || tg.player_w.id === tourneyPlayer.id
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
                                                        if (tpg.winner?.id === tourneyPlayer.id) {
                                                            score++
                                                            return (
                                                                <td key={tpg.id} value={1} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult">1</td>
                                                            )
                                                        }
                                                        else if (tpg.winner === null) {
                                                            score += .5
                                                            return (
                                                                <td key={tpg.id} value={.5} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult">1/2</td>
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
                    <section>
                        {tableOrEdit()}
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