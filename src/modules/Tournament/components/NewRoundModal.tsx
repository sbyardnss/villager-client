import { OutgoingGame } from "../../../Types/Game";
import { Guest } from "../../../Types/Guest"
import { PlayerRelated } from "../../../Types/Player"
import { Tournament } from "../../../Types/Tournament";
import { createPairings } from "../actions/create-pairings";
import { sendNewGame, updateTournament } from "../../../ServerManager";
import { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";
import { useEffect, useState } from "react";
import { handleCreatePairings } from "../actions/handle-create-pairings";
import { findIdentifier } from "../actions/find-identifier";
//TODO: CSS-ISSUE --throughout this component
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
  const [selectedPlayers, setSelectedPlayers] = useState<(PlayerRelated | Guest)[]>([]);
  const [displayedPlayers, setDisplayedPlayers] = useState<(PlayerRelated | Guest)[]>([]);
  useEffect(
    () => {
      const selectedIdentifiers: (string | number)[] = [];
      [...selectedPlayers]
        .forEach(p => {
          if (p) {
            const identifier = findIdentifier(p);
            if (identifier !== undefined) {
              selectedIdentifiers.push(identifier);
            }
          }
        });
      const availablePlayers: (PlayerRelated | Guest)[] = [];
      activePlayers.map(p => {
        const pIdentifier = findIdentifier(p);
        if (!selectedPlayers.includes(p) && !selectedIdentifiers.some(identifier => analysis.playerOppRefObj[pIdentifier].includes(identifier))) {
          availablePlayers.push(p);
        }
      })
      setDisplayedPlayers(availablePlayers);
      console.log('currently selectedPlayers', selectedPlayers)
    }, [selectedPlayers]
  )
  return <>
    {forcePairing === true ?
      <div className="tournament-modal-fixed">
        <div className="d-flex j-between w-100">
          <h2 className="setCustomFont">Force Matchup</h2>
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
                displayedPlayers.map(p => {
                  return (
                    <li
                      key={`force-${p.id}--${p.full_name}`}
                      data-cy={`select-player--${p.full_name}--${p.id}`}
                      className="newTournamentPlayerListItem"
                      onClick={() => {
                        let selectedPlayersCopy = [...selectedPlayers];
                        if (!selectedPlayersCopy[0]) {
                          selectedPlayersCopy[0] = p;
                        } else if (!selectedPlayersCopy[1]) {
                          selectedPlayersCopy[1] = p;
                        } else {
                          selectedPlayersCopy = selectedPlayersCopy;
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
                selectedCopy.splice(0, 1);
                setSelectedPlayers(selectedCopy);
              }}>{selectedPlayers[0] ? selectedPlayers[0].full_name : 'select player'}</h2>
              <div>VS</div>
              <h2 onClick={() => {
                const selectedCopy = [...selectedPlayers];
                selectedCopy.splice(1, 1);
                setSelectedPlayers(selectedCopy);
              }}>{selectedPlayers[1] ? selectedPlayers[1].full_name : 'select player'}</h2>
            </div>
          </div>
        </div>
        <div className="d-flex j-between w-100 m-t-half">
          <h2 className="setCustomFont">Select Players</h2>
          <button
            className="progressionControlBtn buttonStyleReject"
            onClick={() => {
              // const confirmedForcePlayers = [...selectedPlayers] as (PlayerRelated | Guest)[];
              // console.log('confirmedForcePlayers', confirmedForcePlayers)
              if (selectedPlayers && selectedPlayers[0] && selectedPlayers[1] && selectedPlayers.length === 2) {
                if (window.confirm(`create round with forced pairing: ${selectedPlayers[0].full_name} vs ${selectedPlayers[1].full_name}?`)) {
                  const tournamentCopy = { ...tournamentObj }
                  console.log('selectedPlayers immediately before', selectedPlayers)
                  const newPairings = handleCreatePairings('forcing-matchup-new', tournamentObj, analysis, currentRound, undefined, undefined, false, undefined, [...selectedPlayers] as (PlayerRelated | Guest)[]/* TODO: address typing*/, undefined)
                  tournamentCopy.pairings = tournamentCopy.pairings.concat(newPairings)
                  tournamentCopy.rounds++
                  console.log('tournamentCopy', tournamentCopy)
                  // if (byeGameCurrent.player_w.id) {
                  //   sendNewGame(byeGameCurrent)
                  // }
                  // updateTournament(tournamentCopy)
                  //   .then(() => {
                  //     // tournamentResetter();
                  //     activeTournamentResetter();
                  //     tournamentGamesResetter();
                  //   });
                  modalModeSetter('none');
                }
              } else {
                window.alert('You must select two players to force. Otherwise, click cancel')
              }
              
              // setForcePairing(false);
            }}>
            Create Round
          </button>
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