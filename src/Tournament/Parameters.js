import { useContext } from "react"
import { TournamentContext } from "./TournamentProvider"


export const Parameters = ({ editOrNew, tournamentObj, updateTournamentObj, handleChange, gamesStarted, setGamesStarted }) => {
    const {timeSettings} = useContext(TournamentContext)
    //CONTEXT
    //timesettings


    //CREATION
    //newtournament, update
    //handleChange
    

    //setgamesStarted, games started
    if (editOrNew === 'new') {
        return (
            <div id="tournamentParameterControls">
                <input
                    type="text"
                    name="title"
                    className="text-input"
                    placeholder="tournament title"
                    value={tournamentObj.title}
                    onChange={(e) => {
                        const copy = { ...tournamentObj }
                        copy.title = e.target.value
                        updateTournamentObj(copy)
                    }}
                />
                <div id="tournamentTimeSettingSelection">
                    <select
                        className="tournamentFormDropdownSelection"
                        onChange={(e) => {
                            const copy = { ...tournamentObj }
                            copy.timeSetting = parseInt(e.target.value)//WHY DO I HAVE TO PARSEINT HERE?
                            updateTournamentObj(copy)
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
        )
    }
    else {
        return (
            <div id="gamesStartedBtnBlock">
                <button className={gamesStarted === true ? "gamesStartedBtnActive" : "gamesStartedBtn"} onClick={() => setGamesStarted(true)}>Games already started</button>
                <button className={gamesStarted === false ? "gamesNotStartedBtnActive" : "gamesNotStartedBtn"} onClick={() => setGamesStarted(false)}>Games not started</button>
            </div>
        )
    }
}