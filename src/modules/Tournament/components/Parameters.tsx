import { SetStateAction, useEffect, useState } from "react";
import { getAllTimeSettings } from "../../../ServerManager";
import type { TimeSetting } from "../../../Types/TimeSetting";
import type { NewTournament, Tournament } from "../../../Types/Tournament";

interface TournamentParametersProps {
  editOrNew: 'new' | 'edit';
  tournamentObj: NewTournament;
  updateTournamentObj: React.Dispatch<SetStateAction<NewTournament | Tournament>>;
  gamesStarted?: boolean; // Mark as optional
  setGamesStarted?: React.Dispatch<React.SetStateAction<boolean>>;
}
export const TournamentParameters: React.FC<TournamentParametersProps> = ({
  editOrNew,
  tournamentObj,
  updateTournamentObj,
  gamesStarted,
  setGamesStarted,
}) => {
  const [timeSettings, setTimeSettings] = useState<TimeSetting[]>([]);

  useEffect(
    () => {
      getAllTimeSettings()
        .then(data => setTimeSettings(data));
    }, []
  )
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
            updateTournamentObj(copy);
          }}
        />
        <div id="tournamentTimeSettingSelection">
          <select
            className="tournamentFormDropdownSelection"
            onChange={(e) => {
              const copy = { ...tournamentObj }
              copy.time_setting = parseInt(e.target.value)//WHY DO I HAVE TO PARSEINT HERE?
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
          <input id="digitalTournamentCheckbox" className="setColor" type="checkbox" onChange={(e) => {
            const copy = {...tournamentObj};
            const in_person = !e.target.checked;
            copy.in_person = in_person;
            updateTournamentObj(copy);
          }} />
          <label id="digitalTournamentLabel" className="setColor">digital tournament</label>
        </div>
      </div>

    )
  } else {
    return (
      <div id="gamesStartedBtnBlock">
        <button className={gamesStarted === true ? "gamesStartedBtnActive" : "gamesStartedBtn"} onClick={() => {
          if (setGamesStarted)
            setGamesStarted(true)
          }
        }>Games already started</button>
        <button className={gamesStarted === false ? "gamesNotStartedBtnActive" : "gamesNotStartedBtn"} onClick={() => {
          if (setGamesStarted)
          setGamesStarted(false)
        }}>Games not started</button>
      </div>
    )
  }
}