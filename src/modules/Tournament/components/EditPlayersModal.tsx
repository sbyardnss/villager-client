import { useState, useContext, SetStateAction, useEffect } from "react"
import { Guest } from "../../../Types/Guest"
import { TournamentParameters } from "./Parameters"
import { PlayerSelection } from "./PlayerSelection"
import { NewTournament, Tournament } from "../../../Types/Tournament"
import { AppContext } from "../../App/AppProvider";
import { PlayerRelated } from "../../../Types/Player";
import { Game, OutgoingGame } from "../../../Types/Game";
import { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";
import "../../../styles/Tournament.css";
import { ChessClub } from "../../../Types/ChessClub"
import { getClubsGuests, updateTournament } from "../../../ServerManager"
import { Match } from "tournament-pairings/dist/Match"
import { findIdentifier } from "../actions/find-identifier"
import { createPairings } from "../actions/create-pairings"
// import { Swiss } from "tournament-pairings"
import { resetPairingMatchNumbers } from "../actions/reset-pairing-match-numbers"
interface EditPlayersModalProps {
  tournamentObj: Tournament;
  modalModeSetter: React.Dispatch<SetStateAction<'none' | 'results' | 'edit-players' | 'end-tournament'>>;
  activeTournamentResetter: () => void;
  byeGame: React.RefObject<OutgoingGame>;
  rounds: number;
  analysis: tournamentAnalysisOutput;
  tourneyGames: Game[];
  tournamentClub: ChessClub;
}

export const EditPlayersModal: React.FC<EditPlayersModalProps> = ({
  tournamentObj,
  modalModeSetter,
  activeTournamentResetter,
  byeGame,
  rounds,
  analysis,
  tourneyGames,
  tournamentClub,
}) => {
  // const { localVillagerUser } = useContext(AppContext);
  const [playersSelected, setPlayersSelected] = useState(false);
  const [clubPlayers, setClubPlayers] = useState<PlayerRelated[]>([]);
  const [clubGuests, setClubGuests] = useState<Guest[]>([]);
  const [pastPairings, setPastPairings] = useState<Match[]>([]);
  const [currentPairings, setCurrentPairings] = useState<Match[]>([]);
  const [gamesFromThisRound, setGamesFromThisRound] = useState<Game[]>([]);
  const [roundGameIdentifiers, setRoundGameIdentifiers] = useState<(string | number)[][]>([]);
  const [editedTournament, updateEditedTournament] = useState<Tournament>({
    id: 0,
    title: "",
    creator: {} as PlayerRelated,
    date: "",
    club: 0,
    rounds: 0,
    in_person: false,
    complete: false,
    time_setting: 0,
    competitors: [],
    guest_competitors: [],
    pairings: [],
  })

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

  const [gamesStarted, setGamesStarted] = useState(true);
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
            <button id="submitNewPlayersBtn" className="buttonStyleApprove" onClick={() => {
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
                    })

                    return (playerW && playerB) || hasGameBeenPlayed;
                  });
                  const lastMatchNumFromCurrentPairings = currentPairings[currentPairings.length - 1]?.match;

                  const unmatchedCompetitors = allAddedCompetitors.filter(competitor => {
                    const identifier = findIdentifier(competitor);
                    return (!filteredPairings.find(p => {
                      return p.player1 === identifier || p.player2 === identifier
                    })
                      //THIS WAS CHECKING IF THE GAME HAD BEEN PLAYED. LIKELY DON'T NEED ANYMORE
                      // && (gamesFromThisRound.find(g => {
                      //   if ((g.player_w && findIdentifier(g.player_w) === identifier) || (g.player_b && findIdentifier(g.player_b) === identifier)) {
                      //     return false;
                      //   } else {
                      //     return true;
                      //   }
                      // }))
                    );
                  });
                  let newPairings: Match[] = [];


                  //GAMES NOT STARTED
                  if (!gamesStarted && !gamesFromThisRound.length) {
                    newPairings = createPairings('edit', allAddedCompetitors, rounds, analysis);
                  } else {
                    //GAMES STARTED
                    // CANNOT SEND ONE PLAYER TO CREATE PAIRINGS. THAT IS THE REASON FOR IF ELSES BELOW

                    if (unmatchedCompetitors.length === 1) {
                      //ONE UNMATCHED PLAYER. SIMPLY CREATING BYE
                      const byeMatchup = { round: rounds, match: lastMatchNumFromCurrentPairings, player1: findIdentifier(unmatchedCompetitors[0]), player2: null };
                      //TODO-QUESTION: WHY DOES THIS NEED TO BE CONCAT AND NOT PUSH?
                      newPairings = filteredPairings.concat(byeMatchup);

                    } else if (unmatchedCompetitors.length === 2) {
                      //TWO UNMATCHED PLAYERS. SIMPLY CREATING MATCH

                      const randomWhite = Math.floor(Math.random() * 2)
                      const whitePlayer = findIdentifier(unmatchedCompetitors.splice(randomWhite, 1)[0])
                      const blackPlayer = findIdentifier(unmatchedCompetitors[0])
                      const newMatchup = {
                        round: rounds,
                        match: lastMatchNumFromCurrentPairings,
                        player1: whitePlayer,
                        player2: blackPlayer,
                      };
                      newPairings = filteredPairings.concat(newMatchup);
                      // if (analysis.playerOppRefObj[whitePlayer].includes(blackPlayer) || analysis.playerOppRefObj[blackPlayer].includes(whitePlayer)) {
                      //   window.alert('adding and removing players may result in duplicate matches')
                      // }
                    } else {
                      //ZERO OR MORE THAN TWO UNMATCHED PLAYERS.
                      //CREATING PAIRINGS FOR UNMATCHED PLAYERS AND APPENDING
                      /*
                      TODO: DO WE NEED THIS ZOMBIE CODE. IS PART OF THE ORIGINAL
                      
                      let remainingPlayersCheckOpponents = []
                      for (let i = 0; i < unMatchedPlayersAndGuests.length; i++) {
                        const identifier = unMatchedPlayersAndGuests[i].guest_id ? unMatchedPlayersAndGuests[i].guest_id : unMatchedPlayersAndGuests[i].id
                        const playersPossibleOpponents = unMatchedPlayersAndGuests.filter(pg => {
                          const opponentIdentifier = pg.guest_id ? pg.guest_id : pg.id
                          if (previousOpponents[identifier]?.includes(opponentIdentifier) || opponentIdentifier === identifier) {
                            return false
                          }
                          else {
                            return opponentIdentifier
                          }
                        })
                        if (playersPossibleOpponents.length) {
                          remainingPlayersCheckOpponents.push(unMatchedPlayersAndGuests[i])
                        }
                        remainingPlayersCheckOpponents.filter(rp => {
                          const identifier = rp.guest_id ? rp.guest_id : rp.id
                          if (currentPairings.find(p => p.player1 === identifier || p.player2 === identifier)) {
                            return false
                          }
                          else {
                            return true
                          }
                        })
                      }
                      */
                      let newlyCreatedPairings = [];
                      if (unmatchedCompetitors.length) {
                        newlyCreatedPairings = createPairings('edit', unmatchedCompetitors, rounds, analysis);
                      }
                      newPairings = filteredPairings.concat(newlyCreatedPairings);
                    }
                  }

                  //resetting match numbers for new pairings and adding to past pairings
                  resetPairingMatchNumbers(newPairings);
                  copy.pairings = pastPairings.concat(newPairings);
                  console.log('copy', copy)
                  updateTournament(copy)
                    .then(() => {
                      activeTournamentResetter();
                      modalModeSetter('none');
                    })
                }
              }
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