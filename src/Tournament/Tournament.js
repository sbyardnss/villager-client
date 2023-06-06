import { useState, useEffect, useContext } from "react"
import { TournamentContext } from "./TournamentProvider"
import "./Tournament.css"
import { sendNewTournament } from "../ServerManager"
export const Tournament = () => {
    const { localVillagerObj, games, tournaments, players, timeSettings } = useContext(TournamentContext)
    const [potentialCompetitors, setPotentialCompetitors] = useState([])
    const [newTournament, updateNewTournament] = useState({
        title: "",
        creator: localVillagerObj.userId,
        competitors: [],
        timeSetting: 0
    })
    useEffect(
        () => {
            setPotentialCompetitors(players)
        }, [players]
    )

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
                            }
                        }
                    }}>
                        Start Tournament
                    </button>
                </div>
            </section>
        </main>
    </>
}