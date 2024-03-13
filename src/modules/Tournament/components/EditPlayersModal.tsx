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
import { getClubsGuests } from "../../../ServerManager"
import { Match } from "tournament-pairings/dist/Match"
import { findIdentifier } from "../actions/find-identifier"
import { createPairings } from "../actions/create-pairings"
import { Swiss } from "tournament-pairings"
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
  const { localVillagerUser } = useContext(AppContext);
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

  //TODO: DO WE NEED THESE STATE VARIABLES
  const [initialCompetitors, setInitialCompetitors] = useState<(PlayerRelated | Guest)[]>([]);
  useEffect(
    () => {
      updateEditedTournament({ ...tournamentObj });
      setInitialCompetitors(tournamentObj.competitors.concat(tournamentObj.guest_competitors));
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
      // console.log(matchupIdentifiers)
      setRoundGameIdentifiers(matchupIdentifiers);
      setGamesFromThisRound(completedCurrentRoundGames);
    }, [tourneyGames, rounds]
  )

  //needs
  /*
  tournamentObj
  clubMates
  setModal
  rounds
  games
  analysis
  byeGame
  */
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
          //Check whether tourney is in_person
          //check if games started
          //check if only one unmatched player
          // if two, create own matchup
          //otherwise, create pairings for real
          <div id="editPlayersToggleAndSubmitBtnBlock">
            <button className="buttonStyleApprove" onClick={() => setPlayersSelected(false)}>choose players</button>
            <button id="submitNewPlayersBtn" className="buttonStyleApprove" onClick={() => {
              if (window.confirm(gamesStarted === true ? "Confirm games have already started" : "Confirm games have not started")) {
                if (tournamentObj.in_person === true) {
                  const copy = { ...editedTournament };
                  //if games not started only need:
                  // tournamentObj
                  // new competitors
                  // currentPairings

                  // if games started, need:
                  // roundGames,
                  // currentPairings
                  // tournamentObj

                  const allAddedCompetitors = editedTournament.competitors.concat(editedTournament.guest_competitors);
                  // filtering pairings to only those between active players or those that have been submitted
                  const filteredPairings = currentPairings.filter(p => {
                    const allPreviousCompetitors = tournamentObj.competitors.concat(tournamentObj.guest_competitors);
                    // const allPreviousCompetitors = editedTournament.competitors.concat(editedTournament.guest_competitors);
                    const playerW = allPreviousCompetitors.find(c => findIdentifier(c) === p.player1);
                    const playerB = allPreviousCompetitors.find(c => findIdentifier(c) === p.player2);

                    const hasGameBeenPlayed = roundGameIdentifiers.find(i => {
                      return i[0] === p.player1 && i[1] === p.player2;
                    })

                    return (playerW && playerB) || hasGameBeenPlayed;
                  });
                  console.log(filteredPairings)
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
                  console.log('unmatchedCompetitors', unmatchedCompetitors)

                  //if games started, check each matchup for game already played. if no, check if players still playing (filtered pairings)
                  console.trace('newPairings', createPairings('new', unmatchedCompetitors, rounds, /*byeGame.current, */analysis));
                  console.trace('newPairs')






                  /*
                  PRESERVED BEGINNING

                  const allAddedCompetitors = editedTournament.competitors.concat(editedTournament.guest_competitors);

                  const filteredPairings = currentPairings.filter(p => {
                    const allPreviousCompetitors = tournamentObj.competitors.concat(tournamentObj.guest_competitors);
                    // const allPreviousCompetitors = editedTournament.competitors.concat(editedTournament.guest_competitors);
                    const playerW = allPreviousCompetitors.find(c => findIdentifier(c) === p.player1);
                    const playerB = allPreviousCompetitors.find(c => findIdentifier(c) === p.player2);
                    return playerW && playerB;
                  });

                  const lastMatchNumFromCurrentPairings = currentPairings[currentPairings.length - 1]?.match;

                  const unmatchedCompetitors = allAddedCompetitors.filter(competitor => {
                    const identifier = findIdentifier(competitor);
                    return (!filteredPairings.find(p => {
                      return p.player1 === identifier || p.player2 === identifier
                    }) && (gamesFromThisRound.find(g => {
                      if ((g.player_w && findIdentifier(g.player_w) === identifier) || (g.player_b && findIdentifier(g.player_b) === identifier)) {
                        return false;
                      } else {
                        return true;
                      }
                    })));
                  });


                  //games not started and no completed rounds
                  //TODO: REMOVE gamesStarted and base decision off of gamesFromThisRound.length if possible
                  if (!gamesStarted && !gamesFromThisRound.length) {
                    const newMatches = createPairings('edit', allAddedCompetitors, rounds, analysis);
                    copy.pairings = pastPairings.concat(newMatches);
                  } else {

                    //one player added or one removed
                    if (unmatchedCompetitors.length === 1) {
                      const identifier = findIdentifier(unmatchedCompetitors[0]);
                      const byeMatchup: Match = { round: rounds, match: lastMatchNumFromCurrentPairings, player1: identifier, player2: null };
                      filteredPairings.push(byeMatchup);
                      copy.pairings = pastPairings.concat(filteredPairings);
                    } else if (unmatchedCompetitors.length === 2) {
                      const randomWhite = Math.floor(Math.random() * 2);
                      const whitePlayer = unmatchedCompetitors.splice(randomWhite, 1)[0];
                      const blackPlayer = unmatchedCompetitors[0];
                      const newMatchup: Match = { round: rounds, match: lastMatchNumFromCurrentPairings, player1: findIdentifier(whitePlayer), player2: findIdentifier(blackPlayer) };
                      filteredPairings.push(newMatchup);
                      copy.pairings = pastPairings.concat(filteredPairings);
                    } else {
                      //find players already matched up
                      //create pairings with remaining players
                    }
                  }

                  PRESERVED END
                  */
                }
              }
            }}>
              Submit
            </button>
          </div>
          : ""}
      </article>
    </div>
  )

}