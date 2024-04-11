import { OutgoingGame } from "../../../Types/Game";
import { Guest } from "../../../Types/Guest"
import { PlayerRelated } from "../../../Types/Player"
import { Tournament } from "../../../Types/Tournament";
import { createPairings } from "../actions/create-pairings";
import { sendNewGame, updateTournament } from "../../../ServerManager";
import { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";
import { useState } from "react";
//TODO: CSS-ISSUE
interface NewRoundProps {
  tournamentObj: Tournament;
  activePlayers: (PlayerRelated | Guest)[];
  modalModeSetter: React.Dispatch<React.SetStateAction<'none' | 'results' | 'edit-players' | 'end-tournament' | 'new-round'>>;
  currentRound: number;
  byeGameCurrent: OutgoingGame;
  activeTournamentResetter: () => void;
  tournamentGamesResetter: () => void;
  analysis: tournamentAnalysisOutput;
}

export const NewRoundModal: React.FC<NewRoundProps> = ({
  tournamentObj,
  activePlayers,
  modalModeSetter,
  currentRound,
  byeGameCurrent,
  activeTournamentResetter,
  tournamentGamesResetter,
  analysis,
}) => {
  const [forcePairing, setForcePairing] = useState<boolean>(false);
  const [selectedPlayers, setSelectedPlayers] = useState<(PlayerRelated | Guest | undefined)[]>([undefined, undefined]);

  return <>
    {forcePairing === true ?
      <div className="tournament-modal-fixed">
        <div className="d-flex j-between w-100">
          <h2 className="setCustomFont">Select Players</h2>
          <button
            className="progressionControlBtn buttonStyleReject"
            onClick={() => {
              setForcePairing(false);
            }}>
            cancel
          </button>
        </div>
        <div className="d-flex j-between setColor">
          <div id="competitorSelectionSplit">
            <div id="potentialLabel" className="setCustomFont">Potential:</div>
            <div id="tournamentPotentialCompetitorSelection">
              {
                activePlayers.map(p => {
                  return (
                    <li
                      key={`force-${p.id}--${p.full_name}`}
                      data-cy={`select-player--${p.full_name}--${p.id}`}
                      className="newTournamentPlayerListItem"
                      onClick={() => {
                        const selectedPlayersCopy = [...selectedPlayers];
                        if (selectedPlayersCopy[0] === undefined) {
                          selectedPlayersCopy[0] = p;
                        } else if (selectedPlayersCopy[1] === undefined) {
                          selectedPlayersCopy[1] = p;
                        }
                        setSelectedPlayers(selectedPlayersCopy);
                      }}>
                      {p.full_name}
                    </li>
                  )
                })
              }
            </div>
          </div>
          <div id="competitorSelectionSplit" >
            <div id="potentialLabel" className="setCustomFont">Selected:</div>
            <div className="player-selection-area b-border text-align-c d-flex column j-even">
              <h2 onClick={() => {
                const selectedCopy = [...selectedPlayers];
                selectedCopy[0] = undefined;
                setSelectedPlayers(selectedCopy);
              }}>{selectedPlayers[0] ? selectedPlayers[0].full_name : 'select player'}</h2>
              <div>VS</div>
              <h2 onClick={() => {
                const selectedCopy = [...selectedPlayers];
                selectedCopy[1] = undefined;
                setSelectedPlayers(selectedCopy);
              }}>{selectedPlayers[1] ? selectedPlayers[1].full_name : 'select player'}</h2>
            </div>
          </div>
        </div>
      </div>
      :
      <div className="tournament-modal-fixed column a-center" style={{ top: '30%' }}>
        <div className="d-flex j-between w-100">
          <h2 className="setCustomFont">Create New Round</h2>
          <button
            className="progressionControlBtn buttonStyleReject"
            onClick={() => {
              modalModeSetter('none');
            }}>
            cancel
          </button>
        </div>

        <button
          className="large-control-button"
          onClick={() => {
            if (window.confirm("create round?")) {
              const tournamentCopy = { ...tournamentObj }
              const newPairings = createPairings('new', activePlayers, currentRound, analysis, byeGameCurrent)
              tournamentCopy.pairings = tournamentCopy.pairings.concat(newPairings)
              tournamentCopy.rounds++
              if (byeGameCurrent.player_w.id) {
                sendNewGame(byeGameCurrent)
              }
              updateTournament(tournamentCopy)
                .then(() => {
                  // tournamentResetter();
                  activeTournamentResetter();
                  tournamentGamesResetter();
                });
              modalModeSetter('none');
            }
          }}>
          Start round
        </button>
        <button
          className="large-control-button"
          onClick={() => setForcePairing(true)}>
          Start round with a forced match
        </button>
      </div>}
  </>
}