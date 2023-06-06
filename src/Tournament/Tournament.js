import { useState, useEffect, useContext } from "react"
import { TournamentContext } from "./TournamentProvider"
import "./Tournament.css"
import { getAllGames, getAllTournaments, sendNewGame, sendNewTournament } from "../ServerManager"
export const Tournament = () => {
    const { localVillagerObj, tournamentGames, tournaments, setTournaments, players, timeSettings, setGames } = useContext(TournamentContext)
    const [potentialCompetitors, setPotentialCompetitors] = useState([])
    const [selectedTournament, setSelectedTournament] = useState(0)
    const [activeTournament, setActiveTournament] = useState({})
    const [activeTournamentPlayers, setActiveTournamentPlayers] = useState([])
    const [playerBye, setPlayerBye] = useState({})
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
        rounds: 1
    })
    useEffect(
        () => {
            setPotentialCompetitors(players)
            setSelectedTournament(6) //remove this line after tournament view built
        }, [players]
    )
    useEffect(
        () => {
            const selectedTournamentObj = tournaments.find(t => t.id === selectedTournament)
            setActiveTournament(selectedTournamentObj)
        }, [selectedTournament, players]//remove players after tournament view built
    )
    useEffect(
        () => {
            const playersForSelectedTournament = players.filter(p => activeTournament?.competitors.find(c => c === p.id))
            setActiveTournamentPlayers(playersForSelectedTournament)
        }, [activeTournament]
    )
    //getter/setter
    const resetTournaments = () => {
        getAllTournaments()
            .then(data => setTournaments(data))
    }
    //code for populating number of table columns based on number of rounds in activeTournament
    const roundPopulation = () => {
        let roundNumber = activeTournament?.rounds;
        let tableHtml = [];
        while (roundNumber > 0) {
            tableHtml.push(<th key={roundNumber} className="roundHeader">{roundNumber}</th>)
            roundNumber--;
        }
        return tableHtml
    };
    const roundHtml = roundPopulation()

    //NOT WORKING QUITE RIGHT YET
    //generating random matchups for next round
    const createMatchups = () => {
        const playersForMatchup = [...activeTournamentPlayers]
        const numOfPlayers = playersForMatchup.length
        // generate random player_w
        const randomNumWhite = Math.floor(Math.random() * parseInt(numOfPlayers))
        const player_w = playersForMatchup[randomNumWhite]
        // remove matched player_w
        playersForMatchup.splice(randomNumWhite, 1)
        // generate random player_b
        const randomNumBlack = Math.floor(Math.random() * parseInt(numOfPlayers))
        const player_b = playersForMatchup[randomNumBlack]
        // remove matched player_b
        playersForMatchup.splice(randomNumBlack, 1)
        // send game with matched players
        const gameCopy = { ...gameForApi }
        
        gameCopy.player_b = player_b?.id
        gameCopy.player_w = player_w?.id
        if (gameCopy.player_b !== 0 && gameCopy.player_w !== 0) {
            updateGameForApi(gameCopy)
            sendNewGame(gameForApi)
        }
        //check if all players that can be matched have been matched
        if (playersForMatchup.length > 1) {
            createMatchups()
        }
        else if (playersForMatchup.length === 1) {
            setPlayerBye(playersForMatchup[0])
        }
    }


    if (selectedTournament) {
        if (activeTournament && activeTournamentPlayers) {
            return <>
                <main id="tournamentContainer">
                    {activeTournament.title}
                    {
                        activeTournamentPlayers.map(tourneyPlayer => {
                            return (
                                <li key={tourneyPlayer.id} className="tournamentPlayerListItem">{tourneyPlayer.full_name}</li>
                            )
                        })
                    }
                    <button onClick={() => {
                        if (window.confirm("create round?")) {
                            createMatchups()
                            getAllGames().then(data => setGames(data))
                        }
                    }}>Start Next Round</button>
                    <button onClick={() => setSelectedTournament(0)}>exit tournament</button>
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
                                        return (
                                            <tr key={tourneyPlayer.id}>
                                                <td key={tourneyPlayer.id} className="tablePlayerCell">{tourneyPlayer.full_name}</td>
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
                                    sendNewTournament(newTournament)
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