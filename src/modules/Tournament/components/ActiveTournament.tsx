import { useState, useContext, useEffect, SetStateAction, useRef } from "react"
import { Guest, PlayerOnTournament, type Tournament } from "../Types"
import { AppContext } from "../../App/AppProvider"
import { checkIfUserIsAppCreator } from "../actions/check-if-creator"
import type { Game } from "../../../Types/Game";
import type { Match } from "tournament-pairings/dist/Match";
import { getTournamentGames, updateTournament } from "../../../ServerManager";
import { ChessClub } from "../../App/types";
import { tournamentAnalysis } from "../actions/matchup-game-analysis";
import { ResultsModal } from "./ResultsModal";
import { EndTournamentModal } from "./EndTournamentModal";
import { EditPlayersModal } from "./EditPlayersModal";
import { Scoring } from "./Scoring";
import { EditScores } from "./EditScores";
import { TournamentTable } from "./TournamentTable";
import { selectedTournamentDefaults } from "../Types";
interface ActiveTournamentProps {
  selectedTournament: Tournament;
  selectTournament: React.Dispatch<SetStateAction<Tournament>>;
  selectClub: React.Dispatch<SetStateAction<ChessClub>>;
  selectedClub: ChessClub;
  resetTourneys: () => void;
}
export const ActiveTournament: React.FC<ActiveTournamentProps> = ({
  selectedTournament,
  selectTournament,
  selectClub,
  selectedClub,
  resetTourneys,
}) => {
  const { localVillagerUser } = useContext(AppContext);

  // const [activeTournament, setActiveTournament] = useState<Tournament>({} as Tournament);
  const [activeTournamentPlayers, setActiveTournamentPlayers] = useState<(PlayerOnTournament | Guest)[]>([])
  const [tournamentCreatorBool, setTournamentCreatorBool] = useState(false);
  const [tournamentGames, setTournamentGames] = useState<Game[]>([]);
  const [currentRoundMatchups, setCurrentRoundMatchups] = useState<Match[]>([]);
  const currentRoundMatchupsRef = useRef(currentRoundMatchups);
  const [currentRound, setCurrentRound] = useState(0);
  const [mode, setMode] = useState<'scoring' | 'editing'>("scoring");
  const [modalMode, setModalMode] = useState<'none' | 'results' | 'edit-players' | 'end-tournament'>('none');
  // const [viewTable, setViewTable] = useState(false);
  // const [showResults, setShowResults] = useState(false);
  // const [showEndTournament, setShowEndTournament] = useState(false);
  const [tournamentAnalysisObj, setTournamentAnalysisObj] = useState({});
  //TODO: ADJUST SERVER TO ACCEPT PLAYERRELATED TYPE FOR WINNER AND PLAYER_W/B
  const [gameForApi, updateGameForApi] = useState<Game | any>({
    player_w: {} as Guest | PlayerOnTournament,
    player_w_model_type: "",
    player_b: 0,
    player_b_model_type: "",
    tournament: 0,
    time_setting: 0,
    win_style: "",
    accepted: true,
    tournament_round: 0,
    winner: {} as Guest | PlayerOnTournament,
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
  // const [playerOpponentsReferenceObj, updatePlayerOpponentsReferenceObj] = useState({})



  useEffect(
    () => {
      getTournamentGames(selectedTournament.id)
        .then(data => setTournamentGames(data));
      setCurrentRound(selectedTournament.rounds);
      setActiveTournamentPlayers(selectedTournament.competitors.concat(selectedTournament.guest_competitors));
      if (selectedTournament.creator.id === localVillagerUser.userId) {
        setTournamentCreatorBool(true);
      }
    }, [selectedTournament, localVillagerUser.userId]
  )
  useEffect(
    () => {
      console.log(tournamentGames)
    }, [tournamentGames]
  )
  useEffect(
    () => {

      if (checkIfUserIsAppCreator()) {
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
      if (tournamentGames) {
        const analysis = tournamentAnalysis(tournamentGames, currentRoundMatchupsRef.current, setCurrentRoundMatchups, currentRound);
        setTournamentAnalysisObj(analysis);
      }
    }, [tournamentGames, currentRound]
  )
  const resetTournamentGames = () => {
    getTournamentGames(selectedTournament)
      .then(data => setTournamentGames(data))
  }
  return <>
    <main id="tournamentContainer">
      {modalMode === 'results' ?
        <ResultsModal />
        : modalMode === 'edit-players' ?
          <EditPlayersModal />
          : modalMode === 'end-tournament' ?
            <EndTournamentModal />
            : ""}
      <div id="tournamentHeader">
        <div id="activeTournamentTitle" className="setColor setTournamentFontSize">{selectedTournament.title}</div>
        <button
          className="progressionControlBtn buttonStyleReject"
          onClick={() => {
            setModalMode('none');
            selectTournament(selectedTournamentDefaults);
            setTournamentAnalysisObj({});
          }}>exit</button>
        <button
          className="progressionControlBtn controlBtnApprove"
          onClick={() => {
            setModalMode('results');
          }}>Results</button>
      </div>
      <div id="tournamentProgressionControls">
        {/* {selectedTournament.complete === false && (tournamentCreatorBool || checkIfUserIsAppCreator()) ?
          <button
            className="progressionControlBtn controlBtnApprove"
            onClick={() => {
              if (window.confirm("create round?")) {
                if (byePlayer && byeGame.player_w) {
                  sendNewGame(byeGame)
                }
                const tournamentCopy = { ...activeTournament }
                const newPairings = createPairings('new', activeTournamentPlayers, playerOpponentsReferenceObj, currentRound, scoreObj, scoreCard, byeGame.player_w, blackWhiteTally)
                tournamentCopy.pairings = tournamentCopy.pairings.concat(newPairings)
                tournamentCopy.rounds++
                tournamentCopy.competitors = tournamentCopy.competitors.map(c => { return c.id })
                tournamentCopy.guest_competitors = tournamentCopy.guest_competitors.map(gc => { return gc.id })
                updateTournament(tournamentCopy)
                  .then(() => {
                    resetTourneys();
                    resetTournamentGames();
                  })
                setModalMode('none');
              }
            }}>New Round</button>
      :""} */}
      </div>
    </main>
  </>
}