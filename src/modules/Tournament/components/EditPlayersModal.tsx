import React, { useState, useEffect } from "react"
import { Guest } from "../../../Types/Guest"
import { TournamentParameters } from "./Parameters"
import { PlayerSelection } from "./PlayerSelection"
import { NewTournament, Tournament } from "../../../Types/Tournament"
import { AppContext } from "../../App/AppProvider";
import type { PlayerRelated } from "../../../Types/Player";
import { playerRelatedDefaults } from "../../../Types/Player"
import { Game, OutgoingGame } from "../../../Types/Game";
import type { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";
import { tournamentAnalysis, tournamentAnalysisDefaults } from "../actions/matchup-game-analysis";
import "../../../styles/Tournament.css";
import { ChessClub } from "../../../Types/ChessClub";
import { getClubsGuests, updateTournament } from "../../../ServerManager";
import { Match } from "tournament-pairings/dist/Match";
import { findIdentifier } from "../actions/find-identifier";
import { createPairings } from "../actions/create-pairings";
import { createPairingForTwoPlayers } from "../actions/two-players-pairing"
// import { Swiss } from "tournament-pairings"
import { resetPairingMatchNumbers } from "../actions/reset-pairing-match-numbers";
import { handleCreatePairings } from "../actions/handle-create-pairings"
interface EditPlayersModalProps {
  // operation: 'editing-players' | 'new-round-normal' | 'normal-play';
  setOperation: React.Dispatch<React.SetStateAction<'editing-players' | 'new-round-normal' | 'normal-play'>>;
  tournamentObj: Tournament;
  modalModeSetter: React.Dispatch<React.SetStateAction<'none' | 'results' | 'edit-players' | 'end-tournament' | 'new-round' | 'force-match'>>;
  // activeTournamentResetter: () => void;
  byeGame: React.RefObject<OutgoingGame>;
  rounds: number;
  // analysis: tournamentAnalysisOutput;
  tourneyGames: Game[];
  tournamentClub: ChessClub;
  // resetTournaments: () => void;
  // selectedPlayersForForce: (PlayerRelated | Guest)[];
  // setSelectedPlayersForForce: React.Dispatch<React.SetStateAction<(PlayerRelated | Guest)[]>>;
  setPastPairings: React.Dispatch<React.SetStateAction<Match[]>>;
  currentPairings: Match[];
  setCurrentPairings: React.Dispatch<React.SetStateAction<Match[]>>;
  setGamesFromThisRound: React.Dispatch<React.SetStateAction<Game[]>>;
  setRoundGameIdentifiers: React.Dispatch<React.SetStateAction<(string | number)[][]>>;
  setNewAnalysis: React.Dispatch<React.SetStateAction<tournamentAnalysisOutput>>;
  editedTournament: Tournament;
  updateEditedTournament: React.Dispatch<React.SetStateAction<Tournament>>;
  gamesStarted: boolean;
  setGamesStarted: React.Dispatch<React.SetStateAction<boolean>>;
  callHandleUpdateTournament: () => void;

}

export const EditPlayersModal: React.FC<EditPlayersModalProps> = ({
  // operation,
  setOperation,
  tournamentObj,
  modalModeSetter,
  // activeTournamentResetter,
  byeGame,
  rounds,
  // analysis,
  tourneyGames,
  tournamentClub,
  // resetTournaments,
  // selectedPlayersForForce,
  // setSelectedPlayersForForce,
  setPastPairings,
  currentPairings,
  setCurrentPairings,
  setGamesFromThisRound,
  setRoundGameIdentifiers,
  setNewAnalysis,
  editedTournament,
  updateEditedTournament,
  gamesStarted,
  setGamesStarted,
  callHandleUpdateTournament,
}) => {
  // const { localVillagerUser } = useContext(AppContext);
  const [playersSelected, setPlayersSelected] = useState(false);
  const [clubPlayers, setClubPlayers] = useState<PlayerRelated[]>([]);
  const [clubGuests, setClubGuests] = useState<Guest[]>([]);
  // const [pastPairings, setPastPairings] = useState<Match[]>([]);
  // const [currentPairings, setCurrentPairings] = useState<Match[]>([]);
  // const [gamesFromThisRound, setGamesFromThisRound] = useState<Game[]>([]);
  // const [roundGameIdentifiers, setRoundGameIdentifiers] = useState<(string | number)[][]>([]);
  // const [newAnalysis, setNewAnalysis] = useState<tournamentAnalysisOutput>({ ...tournamentAnalysisDefaults });
  // const [editedTournament, updateEditedTournament] = useState<Tournament>({
  //   id: 0,
  //   title: "",
  //   creator: { ...playerRelatedDefaults },
  //   date: "",
  //   club: 0,
  //   rounds: 0,
  //   in_person: false,
  //   complete: false,
  //   time_setting: 0,
  //   competitors: [],
  //   guest_competitors: [],
  //   pairings: [],
  // })

  //TODO: DO WE NEED THESE STATE VARIABLES. MAYBE FOR RESETTING THE TOURNAMENT COMPETITORS ON CANCEL?
  // const [initialCompetitors, setInitialCompetitors] = useState<(PlayerRelated | Guest)[]>([]);
  useEffect(
    () => {
      updateEditedTournament({ ...tournamentObj });
      // setInitialCompetitors(tournamentObj.competitors.concat(tournamentObj.guest_competitors));
      let currentRoundPairings: Match[] = [];
      let previousPairings: Match[] = [];
      tournamentObj.pairings.forEach(pairing => {
        if (pairing.round === rounds) {
          currentRoundPairings.push(pairing);
        } else {
          previousPairings.push(pairing);
        }
      });
      setCurrentPairings(currentRoundPairings);
      setPastPairings(previousPairings)
    }, [tournamentObj, rounds]
  )
  useEffect(
    () => {
      setClubPlayers(tournamentClub.members);
      setClubGuests(tournamentClub.guest_members);
    }, [tournamentClub]
  )
  useEffect(
    () => {
      const matchupIdentifiers: (string | number)[][] = [];
      //TODO: IS THIS FILTERED ENOUGH? DO WE NEED TO CHECK ANYTHING ELSE?
      const completedCurrentRoundGames = tourneyGames.filter(game => {
        if (game.player_b && game.player_w && game.tournament_round === rounds)
          matchupIdentifiers.push([findIdentifier(game.player_w), findIdentifier(game.player_b)]);
        return game.tournament_round === rounds;
      });
      setRoundGameIdentifiers(matchupIdentifiers);
      setGamesFromThisRound(completedCurrentRoundGames);
    }, [tourneyGames, rounds]
  )
  useEffect(
    () => {
      const allNewPlayers = editedTournament.competitors.concat(editedTournament.guest_competitors);
      const editedPlayersAnalysis = tournamentAnalysis(tourneyGames, currentPairings, rounds, byeGame, allNewPlayers);
      setNewAnalysis(editedPlayersAnalysis);
    }, [editedTournament]
  )
  // useEffect(
  //   () => {
  //     console.log('newAnalysis', newAnalysis)

  //   }, [newAnalysis]
  // )

  const resetGuests = () => {
    getClubsGuests(tournamentClub.id)
      .then(data => {
        setClubGuests(data);
      });
  };


  return (
    <div id="editPlayersModal" className="setCustomFont">
      <article id="editPlayersContainer">
        <div id="editPlayersHeader">
          <h3>Edit Players</h3>
          <button className="buttonStyleReject" onClick={() => {
            // getTournament(activeTournamentObj.id)
            //     .then(data => updatedTournamentObj(data))
            setOperation('normal-play');
            modalModeSetter('none');
          }}>cancel</button>
        </div>
        {!playersSelected ?
          <PlayerSelection
            editOrNew={"edit"}
            players={clubPlayers}
            guests={clubGuests}
            updatePlayersSelected={setPlayersSelected}
            tournamentObj={editedTournament}
            resetGuests={resetGuests}
            selectedClub={tournamentClub}
            updateTournamentObj={updateEditedTournament as React.Dispatch<React.SetStateAction<NewTournament | Tournament>>}
          />
          : ""}
        {playersSelected ?
          <TournamentParameters
            editOrNew={"edit"}
            tournamentObj={editedTournament}
            updateTournamentObj={updateEditedTournament as React.Dispatch<React.SetStateAction<NewTournament | Tournament>>}
            gamesStarted={gamesStarted}
            setGamesStarted={setGamesStarted}
          />
          : null}
        {playersSelected ?
          <div id="editPlayersToggleAndSubmitBtnBlock">
            <button className="buttonStyleApprove" onClick={() => setPlayersSelected(false)}>choose players</button>
            <button
              data-cy="submit-players-btn"
              id="submitNewPlayersBtn"
              className="buttonStyleApprove"
              onClick={() => {
                if (window.confirm(gamesStarted === true ? "Confirm games have already started" : "Confirm games have not started")) {
                  modalModeSetter('new-round');
                }
                // if (!gamesStarted) {
                //   if (window.confirm("Confirm games have NOT started")) {
                //     if (!gamesFromThisRound.length) {
                //       modalModeSetter('new-round');
                //     } else {
                //       window.alert('It looks like the games actually have started. try again');
                //     }
                //   }
                // } else {
                //   if (window.confirm("Confirm games have already started")) {
                //     const newPairings: Match[] = handleCreatePairings(tournamentObj, analysis, rounds, currentPairings, roundGameIdentifiers, gamesStarted, gamesFromThisRound, selectedPlayersForForce, newAnalysis);
                //     const copy = { ...editedTournament };
                //     copy.pairings = pastPairings.concat(newPairings);
                //   }
                // }
                /*
                if (window.confirm(gamesStarted === true ? "Confirm games have already started" : "Confirm games have not started")) {
                  if (tournamentObj.in_person === true) {
                    const copy = { ...editedTournament };

                    const allAddedCompetitors = editedTournament.competitors.concat(editedTournament.guest_competitors);
                    // filtering pairings to only those between active players or those that have been submitted
                    const filteredPairings = currentPairings.filter(p => {
                      const allPreviousCompetitors = tournamentObj.competitors.concat(tournamentObj.guest_competitors);
                      const playerW = allPreviousCompetitors.find(c => findIdentifier(c) === p.player1);
                      const playerB = allPreviousCompetitors.find(c => findIdentifier(c) === p.player2);

                      const hasGameBeenPlayed = roundGameIdentifiers.find(i => {
                        return i[0] === p.player1 && i[1] === p.player2;
                      });

                      return (playerW && playerB) || hasGameBeenPlayed;
                    });
                    const newPairings: Match[] = handleCreatePairings(tournamentObj, analysis, rounds, currentPairings, roundGameIdentifiers, gamesStarted, gamesFromThisRound, selectedPlayersForForce, newAnalysis);
                    //TODO: DO WE NEED THIS AT ALL SINCE WE ALWAYS RESET THE MATCH NUMBERS?
                    // const lastMatchNumFromCurrentPairings = currentPairings[currentPairings.length - 1]?.match;

                    // const unmatchedCompetitors = allAddedCompetitors.filter(competitor => {
                    //   const identifier = findIdentifier(competitor);
                    //   return (!filteredPairings.find(p => {
                    //     return p.player1 === identifier || p.player2 === identifier
                    //   })

                    //   );
                    // });
                    // let newPairings: Match[] = [];


                    // //GAMES NOT STARTED
                    // if (!gamesStarted && !gamesFromThisRound.length) {
                    //   newPairings = createPairings('edit', allAddedCompetitors, rounds, analysis);
                    // } else {
                    //   //GAMES STARTED
                    //   // CANNOT SEND ONE PLAYER TO CREATE PAIRINGS. THAT IS THE REASON FOR IF ELSES BELOW

                    //   if (unmatchedCompetitors.length === 1) {
                    //     //ONE UNMATCHED PLAYER. SIMPLY CREATING BYE
                    //     //can set this match number to 1 because it will be changed before the return
                    //     const byeMatchup = { round: rounds, match: 1, player1: findIdentifier(unmatchedCompetitors[0]), player2: null };
                    //     //TODO-QUESTION: WHY DOES THIS NEED TO BE CONCAT AND NOT PUSH?
                    //     newPairings = filteredPairings.concat(byeMatchup);

                    //   } else if (unmatchedCompetitors.length === 2) {
                    //     //TWO UNMATCHED PLAYERS. SIMPLY CREATING MATCH
                    //     const newMatchup = createPairingForTwoPlayers(unmatchedCompetitors, rounds)
                    //     newPairings = filteredPairings.concat(newMatchup);

                    //   } else {
                    //     //ZERO OR MORE THAN TWO UNMATCHED PLAYERS.
                    //     let newlyCreatedPairings = [];
                    //     if (unmatchedCompetitors.length) {
                    //       newlyCreatedPairings = createPairings('edit', unmatchedCompetitors, rounds, newAnalysis);
                    //     }
                    //     newPairings = filteredPairings.concat(newlyCreatedPairings);
                    //   }
                    // }

                    //resetting match numbers for new pairings and adding to past pairings
                    resetPairingMatchNumbers(newPairings);
                    copy.pairings = pastPairings.concat(newPairings);
                    console.log('copy', copy)
                    // updateTournament(copy)
                    //   .then(() => {
                    //     activeTournamentResetter();
                    //     modalModeSetter('none');
                    //     resetTournaments();
                    //   })
                  }
                }
                */
              }
              }>
              Submit
            </button>
          </div>
          : ""}
      </article>
    </div>
  )

}