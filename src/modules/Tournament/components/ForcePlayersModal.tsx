import React, { useEffect, useState } from "react";
import { PlayerRelated } from "../../../Types/Player";
import { Guest } from "../../../Types/Guest";
import { findIdentifier } from "../actions/find-identifier";
import { handleCreatePairings } from "../actions/handle-create-pairings";
import { Tournament } from "../../../Types/Tournament";
import { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";

interface ForcePlayersModalProps {
  operation: 'editing-players' | 'new-round-normal' | 'normal-play';
  setOperation: React.Dispatch<React.SetStateAction<'editing-players' | 'new-round-normal' | 'normal-play'>>;
  tournamentObj: Tournament;
  modalModeSetter: React.Dispatch<React.SetStateAction<'none' | 'results' | 'edit-players' | 'end-tournament' | 'new-round' | 'force-match'>>;
  selectedPlayersForForce: (PlayerRelated | Guest)[];
  setSelectedPlayersForForce: React.Dispatch<React.SetStateAction<(PlayerRelated | Guest)[]>>;
  activePlayers: (PlayerRelated | Guest)[];
  analysis: tournamentAnalysisOutput;
  currentRound: number
}
export const ForcePlayersModal: React.FC<ForcePlayersModalProps> = ({
  operation,
  setOperation,
  tournamentObj,
  modalModeSetter,
  selectedPlayersForForce,
  setSelectedPlayersForForce,
  activePlayers,
  analysis,
  currentRound,
}) => {
  const [displayedPlayers, setDisplayedPlayers] = useState<(PlayerRelated | Guest)[]>([]);


  useEffect(
    () => {
      const selectedIdentifiers: (string | number)[] = [...selectedPlayersForForce].map(p => findIdentifier(p));
      const availablePlayers: (PlayerRelated | Guest)[] = [];
      activePlayers.forEach(p => {
        const pIdentifier = findIdentifier(p);
        if (!selectedPlayersForForce.includes(p) && !selectedIdentifiers.some(identifier => analysis.playerOppRefObj[pIdentifier].includes(identifier))) {
          availablePlayers.push(p);
        }
      })
      setDisplayedPlayers(availablePlayers);
    }, [selectedPlayersForForce]
  )
  return <>
    <div className="tournament-modal-fixed">
      <div className="d-flex j-between w-100">
        <h2 className="setCustomFont">Force Matchup</h2>
        <button
          className="progressionControlBtn buttonStyleReject"
          onClick={() => {
            modalModeSetter('new-round');
            setSelectedPlayersForForce([]);
          }}>
          back
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
                      let selectedPlayersCopy = [...selectedPlayersForForce];
                      if (!selectedPlayersCopy[0]) {
                        selectedPlayersCopy[0] = p;
                      } else if (!selectedPlayersCopy[1]) {
                        selectedPlayersCopy[1] = p;
                      } else {
                        selectedPlayersCopy = selectedPlayersCopy;
                      }
                      setSelectedPlayersForForce(selectedPlayersCopy);
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
              const selectedPlayersCopy = [...selectedPlayersForForce];
              selectedPlayersCopy.splice(0, 1);
              setSelectedPlayersForForce(selectedPlayersCopy);
            }}>{selectedPlayersForForce[0] ? <span className="text-hl-pink">{selectedPlayersForForce[0].full_name}</span> : 'select player'}</h2>
            <div>VS</div>
            <h2 onClick={() => {
              const selectedPlayersCopy = [...selectedPlayersForForce];
              selectedPlayersCopy.splice(1, 1);
              setSelectedPlayersForForce(selectedPlayersCopy);
            }}>{selectedPlayersForForce[1] ? <span className="text-hl-blue">{selectedPlayersForForce[1].full_name}</span> : 'select player'}</h2>
          </div>
        </div>
      </div>
      <div className="d-flex j-between w-100 m-t-half">
        <h2 className="setCustomFont">Select Players</h2>
        <button
          className="progressionControlBtn buttonStyleReject"
          onClick={() => {
            if (selectedPlayersForForce && selectedPlayersForForce[0] && selectedPlayersForForce[1] && selectedPlayersForForce.length === 2) {
              if (window.confirm(`create round with forced pairing: ${selectedPlayersForForce[0].full_name} vs ${selectedPlayersForForce[1].full_name}?`)) {
                const tournamentCopy = { ...tournamentObj };
                const newPairings = handleCreatePairings(operation, setOperation, tournamentObj, analysis, currentRound, undefined, undefined, false, undefined, [...selectedPlayersForForce] as (PlayerRelated | Guest)[]/* TODO: address typing*/, undefined);
                tournamentCopy.pairings = tournamentCopy.pairings.concat(newPairings);
                tournamentCopy.rounds++
                console.log('tournament', tournamentCopy)
                //TODO: CREATE HANDLER FOR THIS TO BE PLACED IN ACTIVE TOURNAMENT
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
                setSelectedPlayersForForce([]);
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
  </>
}