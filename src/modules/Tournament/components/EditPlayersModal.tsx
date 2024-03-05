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
    }, [tournamentObj]
  )
  useEffect(
    () => {
      setClubPlayers(tournamentClub.members);
      setClubGuests(tournamentClub.guest_members);
    }, [tournamentClub]
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
  const [gamesStarted, setGamesStarted] = useState(true)
  const resetGuests = () => {
    getClubsGuests(tournamentClub.id)
      .then(data => {
        setClubGuests(data);
      })
  }
  //Check whether tourney is in_person
  //check if games started
  //check if only one unmatched player
  // if two, create own matchup
  //otherwise, create pairings for real

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
        {/* editOrNew: 'new' | 'edit';
        tournamentObj: NewTournament;
        updateTournamentObj: React.Dispatch<SetStateAction<NewTournament>>;
          gamesStarted?: boolean; // Mark as optional
          setGamesStarted?: React.Dispatch<React.SetStateAction<boolean>>; //</React.SetStateAction> */}
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
                // if (tournamentObj.in_person === true) {
                const copy = { ...tournamentObj };
                // }
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