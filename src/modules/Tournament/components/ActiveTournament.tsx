import { useState, useContext, useEffect, SetStateAction, useRef } from "react"
import { Guest, PlayerOnTournament, type Tournament } from "../Types"
import { AppContext } from "../../App/AppProvider"
import { checkIfUserIsAppCreator } from "../actions/check-if-creator"
import type { Game } from "../../../Types/Game";
import type { Match } from "tournament-pairings/dist/Match";
import { getTournamentGames } from "../../../ServerManager";
import { ChessClub } from "../../App/types";
import { createPlayerOpponentReferenceObject } from "../actions/create-player-opp-reference";
import { tournamentAnalysis } from "../actions/matchup-game-analysis";

interface ActiveTournamentProps {
  selectedTournament: Tournament;
  selectClub: React.Dispatch<SetStateAction<ChessClub>>;
  selectedClub: ChessClub;
}
export const ActiveTournament: React.FC<ActiveTournamentProps> = ({
  selectedTournament,
}) => {
  const { localVillagerUser, myChessClubs } = useContext(AppContext);

  // const [activeTournament, setActiveTournament] = useState<Tournament>({} as Tournament);
  const [activeTournamentPlayers, setActiveTournamentPlayers] = useState<(PlayerOnTournament | Guest)[]>([])
  const [tournamentGames, setTournamentGames] = useState<Game[]>([]);
  const [currentRoundMatchups, setCurrentRoundMatchups] = useState<Match[]>([]);
  const currentRoundMatchupsRef = useRef(currentRoundMatchups);
  const [currentRound, setCurrentRound] = useState(0);
  const [mode, setMode] = useState<'scoring' | 'editing'>("scoring");
  const [viewTable, setViewTable] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showEndTournament, setShowEndTournament] = useState(false);
  //TODO: ADJUST SERVER TO ACCEPT PLAYERRELATED TYPE FOR WINNER AND PLAYER_W/B
  const [gameForApi, updateGameForApi] = useState<Game | any>({
    player_w: 0,
    player_w_model_type: "",
    player_b: 0,
    player_b_model_type: "",
    tournament: 0,
    time_setting: 0,
    win_style: "",
    accepted: true,
    tournament_round: 0,
    winner: 0,
    winner_model_type: "",
    bye: false
  });
  const [byeGame, setByeGame] = useState({
    player_w: {} as Guest | PlayerOnTournament,
    player_w_model_type: "",
    player_b: null,
    tournament: 0,
    time_setting: 0,
    win_style: "",
    accepted: true,
    tournament_round: 0,
    winner: {} as Guest | PlayerOnTournament,
    winner_model_type: "",
    bye: true
  });
  const byeGameRef = useRef(byeGame);

  // TODO: CAN WE GET RID OF ANY OF THESE STATE VARIABLES?
  const [playerOpponentsReferenceObj, updatePlayerOpponentsReferenceObj] = useState({})
  const [tournamentCreatorBool, setTournamentCreatorBool] = useState(false)



  useEffect(
    () => {
      getTournamentGames(selectedTournament.id)
        .then(data => setTournamentGames(data));
      setCurrentRound(selectedTournament.rounds);
      setActiveTournamentPlayers(selectedTournament.competitors.concat(selectedTournament.guest_competitors));
    }, [selectedTournament]
  )
  useEffect(
    () => {
      console.log(tournamentGames)
    },[tournamentGames]
  )
  useEffect(
    () => {

      if (checkIfUserIsAppCreator(localVillagerUser.userId)) {
        setTournamentCreatorBool(true);
      }
    }, [localVillagerUser.userId]
  )

  // useEffect(
  //   () => {
  //     if (selectedTournament.pairings) {
  //       const opponentObj = createPlayerOpponentReferenceObject(selectedTournament.pairings);


  //       const currentRoundPairings = selectedTournament.pairings.filter(p => p.round === currentRound);
  //       currentRoundPairings.map(pairing => {
  //         if (pairing.player1 === null) {
  //           pairing.player1 = pairing.player2
  //           pairing.player2 = null
  //         };
  //       });
  //       setCurrentRoundMatchups(currentRoundPairings)
  //     }
  //   }, [selectedTournament.pairings, currentRound]
  // )
  // useEffect(
  //   () => {
  //     const copy = {...gameForApi};
  //     copy.tournament_round = currentRound;
  //     updateGameForApi(copy);
  //   }, [currentRound]
  // )
  useEffect(
    () => {
      const byePairing = currentRoundMatchups.find(pairing => pairing.player2 === null);
      if (byePairing) {
        const byeCopy = { ...byeGame };
        byeCopy.player_b = null;
        byeCopy.bye = true;
        byeCopy.win_style = "";
        if (typeof byePairing.player1 === 'string') {
          byeCopy.winner_model_type = 'guestplayer'
          byeCopy.player_w_model_type = 'guestplayer'
          const guestPlayer = activeTournamentPlayers.find(p => (p as Guest).guest_id === byePairing.player1)
          if (guestPlayer) {
            byeCopy.player_w = guestPlayer;
            byeCopy.winner = guestPlayer;
          }
        }
        else {
          byeCopy.winner_model_type = 'player'
          byeCopy.player_w_model_type = 'player'
          const player = activeTournamentPlayers.find(p => p.id === byePairing.player1)
          if (player) {
            byeCopy.player_w = player
            byeCopy.winner = player
          }
        }
        // setByeGame(byeCopy)
        byeGameRef.current = byeCopy;
      }
    }, [currentRoundMatchups, activeTournamentPlayers, byeGame]
  )
  useEffect(
    () => {
      currentRoundMatchupsRef.current = currentRoundMatchups;
    }, [currentRoundMatchups]
  )
  useEffect(
    () => {
      // if (tournamentGames && currentRoundMatchups)
      if (tournamentGames)
        console.log('hitting useEffect conditional')
        tournamentAnalysis(tournamentGames, currentRoundMatchupsRef.current, setCurrentRoundMatchups);
    }, [tournamentGames]
  )
  return <>
    <main id="tournamentContainer">
    </main>
  </>
}