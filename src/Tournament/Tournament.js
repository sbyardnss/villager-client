import { useState, useEffect, useContext } from "react"
import { TournamentContext } from "./TournamentProvider"
import "./Tournament.css"
import { getAllGames, getAllTournaments, sendNewGame, sendNewTournament } from "../ServerManager"
export const Tournament = () => {
    const { localVillagerObj, tournamentGames, tournaments, setTournaments, players, timeSettings, setGames, selectedTournament, setSelectedTournament, pastPairings } = useContext(TournamentContext)
    const [potentialCompetitors, setPotentialCompetitors] = useState([])
    const [activeTournament, setActiveTournament] = useState({})
    const [activeTournamentPlayers, setActiveTournamentPlayers] = useState([])
    const [playerBye, setPlayerBye] = useState({})
    const [round, setRound] = useState(0)
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
            // setSelectedTournament(6) //remove this line after tournament view built
        }, [players]
    )
    useEffect(
        () => {
            const selectedTournamentObj = tournaments.find(t => t.id === selectedTournament)
            setActiveTournament(selectedTournamentObj)
        }, [selectedTournament]//remove players after tournament view built
    )
    useEffect(
        () => {
            const playersForSelectedTournament = players.filter(p => activeTournament?.competitors.find(c => c === p.id))
            setActiveTournamentPlayers(playersForSelectedTournament)
        }, [activeTournament]
    )
    useEffect(
        () => {
            setRound(activeTournament?.rounds)
        },[activeTournament]
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

    //shuffle array of players for random matchup
    const shuffle = (arr) => {
        let currentIndex = arr.length, randomIndex;
        //while there are elements to shuffle
        while (currentIndex !== 0) {
            //pick a remaining element
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            //and swap it with the current element
            [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]]
        }
        return arr
    }


    const tournamentPlayers = [...activeTournamentPlayers]
    let shuffledPlayers = shuffle(tournamentPlayers)
    const createMatchups = () => {//function seems to be working correctly other than setting the bye player
        //check to see if there are at least 2 players left
        if (shuffledPlayers.length){
            if (shuffledPlayers.length > 1) {
                const player_w = shuffledPlayers[0]
                const player_b = shuffledPlayers[1]
                if (player_b && player_w) {
                    //check to see if this matchup matches a previous game in the tournament
                    if (pastPairings.find(p => p === [player_w.id, player_b.id] || p === [player_b.id, player_w.id])) {
                        console.log("game already played")
                        createMatchups()
                    }
                    else {
                        const gameCopy = { ...gameForApi }
                        gameCopy.player_w = player_w.id
                        gameCopy.player_b = player_b.id
                        shuffledPlayers.splice(0, 2)
                        console.log(gameCopy)
                        if (shuffledPlayers.length) {
                            createMatchups()
                        }
                    }
                }
                
            }
            else {
                // console.log(shuffledPlayers[0])
                setPlayerBye(shuffledPlayers[0])
                console.log(playerBye)
                
            }
        }
        else {
            console.log('matchup made')
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