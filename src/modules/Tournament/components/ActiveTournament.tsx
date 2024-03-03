import { useState, useContext, useEffect, SetStateAction, useRef } from "react"
import { AppContext } from "../../App/AppProvider"
import { checkIfUserIsAppCreator } from "../actions/check-if-creator"
import { getTournamentGames, getTournament } from "../../../ServerManager";
import { tournamentAnalysis } from "../actions/matchup-game-analysis";
import { ResultsModal } from "./ResultsModal";
import { EndTournamentModal } from "./EndTournamentModal";
import { EditPlayersModal } from "./EditPlayersModal";
import { Scoring } from "./Scoring";
import { EditScores } from "./EditScores";
import { TournamentTable } from "./TournamentTable";
// import { createPairings } from "../actions/create-pairings";
// import { findIdentifier } from "../actions/find-identifier";
import { TournamentControls } from "./TournamentControls";
// import { getPlayerType } from "../../../utils/player-guest-typing";
import { type Tournament, selectedTournamentDefaults } from "../../../Types/Tournament";
import type { PlayerRelated } from "../../../Types/Player";
import type { Guest } from "../../../Types/Guest";
import type { Game, OutgoingGame } from "../../../Types/Game";
import type { Match } from "tournament-pairings/dist/Match";
import type { ChessClub } from "../../../Types/ChessClub";
import type { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";

interface ActiveTournamentProps {
  selectedTournament: Tournament;
  selectTournament: React.Dispatch<SetStateAction<Tournament>>;
  selectClub: React.Dispatch<SetStateAction<ChessClub>>;
  selectedClub: ChessClub;
  resetTourneys: () => void;
  allClubMates: (PlayerRelated | Guest)[];
}
export const ActiveTournament: React.FC<ActiveTournamentProps> = ({
  selectedTournament,
  selectTournament,
  selectClub,
  selectedClub,
  resetTourneys,
  allClubMates
}) => {
  const { localVillagerUser, myChessClubs } = useContext(AppContext);

  // const [activeTournament, setActiveTournament] = useState<Tournament>({} as Tournament);
  const [activeTournamentPlayers, setActiveTournamentPlayers] = useState<(PlayerRelated | Guest)[]>([])
  const [tournamentCreatorBool, setTournamentCreatorBool] = useState(false);
  const [tournamentGames, setTournamentGames] = useState<Game[]>([]);
  const [currentRoundMatchups, setCurrentRoundMatchups] = useState<Match[]>([]);
  const currentRoundMatchupsRef = useRef(currentRoundMatchups);
  const [selectedClubMates, setSelectedClubMates] = useState<(PlayerRelated | Guest)[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [scoreMode, setScoreMode] = useState<'scoring' | 'editing' | 'table'>("scoring");
  const [modalMode, setModalMode] = useState<'none' | 'results' | 'edit-players' | 'end-tournament'>('none');
  // const [viewTable, setViewTable] = useState(false);
  // const [showResults, setShowResults] = useState(false);
  // const [showEndTournament, setShowEndTournament] = useState(false);
  const [tournamentAnalysisObj, setTournamentAnalysisObj] = useState<tournamentAnalysisOutput>({} as tournamentAnalysisOutput);
  const [roundOver, setRoundOver] = useState(false);
  const [gameForApi, updateGameForApi] = useState<OutgoingGame | Game>({
    id: undefined,
    player_w: {} as Guest | PlayerRelated,
    player_w_model_type: "",
    player_b: {} as Guest | PlayerRelated,
    player_b_model_type: "",
    tournament: 0,
    time_setting: 0,
    win_style: "",
    accepted: true,
    tournament_round: 0,
    winner: {} as Guest | PlayerRelated,
    winner_model_type: "",
    bye: false
  });
  //TODO: FIGURE OUT HOW TO RECONCILE THIS
  const [byeGame] = useState<OutgoingGame>({
    player_w: {} as Guest | PlayerRelated,
    player_w_model_type: "",
    player_b: {} as Guest | PlayerRelated,
    player_b_model_type: "",
    tournament: 0,
    time_setting: 0,
    win_style: "",
    accepted: true,
    tournament_round: 0,
    winner: {} as Guest | PlayerRelated,
    winner_model_type: "",
    bye: true
  });
  const byeGameRef = useRef<OutgoingGame>({
    player_w: {} as Guest | PlayerRelated,
    player_w_model_type: "",
    player_b: {} as Guest | PlayerRelated,
    player_b_model_type: "",
    tournament: 0,
    time_setting: 0,
    win_style: "",
    accepted: true,
    tournament_round: 0,
    winner: {} as Guest | PlayerRelated,
    winner_model_type: "",
    bye: true
  });

  useEffect(
    () => {
      getTournamentGames(selectedTournament.id)
        .then(data => setTournamentGames(data));
      setCurrentRound(selectedTournament.rounds);
      setActiveTournamentPlayers(selectedTournament.competitors.concat(selectedTournament.guest_competitors));
      if (selectedTournament.creator.id === localVillagerUser.userId) {
        setTournamentCreatorBool(true);
      }
      const chosenClub = myChessClubs.find((club: ChessClub) => club.id === selectedTournament.club);
      selectClub(chosenClub)
      console.log(selectedTournament)
    }, [selectedTournament, selectClub, myChessClubs, localVillagerUser.userId]
  )
  useEffect(
    () => {
      const selectedClubMembers = selectedClub.members;
      const selectedClubGuests = selectedClub.guest_members;
      let allSelectedClubCompetitors = [];
      if (selectedClubGuests) {
        allSelectedClubCompetitors = selectedClubMembers.concat(selectedClubGuests);
      } else {
        allSelectedClubCompetitors = selectedClubMembers;
      }
      setSelectedClubMates(allSelectedClubCompetitors);
    }, [selectedClub]
  )
  useEffect(
    () => {
      //TODO: CAN WE CHANGE THIS TO SIMPLY LOOK FOR NUMBER OF GAMES AGAINST COMPETITORS? MAYBE NOT IF WE ARE ADDING COMPETITORS
      const currentRoundGames = tournamentGames.filter(g => g.tournament_round === currentRound);
      if ((currentRoundGames.length === currentRoundMatchups.length
        && !currentRoundMatchups.find(p => p.player2 === null))
        || (currentRoundGames.length === currentRoundMatchups.length - 1
          && currentRoundMatchups.find(p => p.player2 === null))) {
        setRoundOver(true);
      } else {
        setRoundOver(false);
      }
    }, [tournamentGames, currentRound, currentRoundMatchups]
  )
  useEffect(
    () => {

      if (checkIfUserIsAppCreator()) {
        setTournamentCreatorBool(true);
      }
    }, [localVillagerUser.userId]
  )

  useEffect(
    () => {
      if (selectedTournament.pairings) {
        // const opponentObj = createPlayerOpponentReferenceObject(selectedTournament.pairings);


        const currentRoundPairings = selectedTournament.pairings.filter(p => p.round === currentRound);
        currentRoundPairings.forEach(pairing => {
          if (pairing.player1 === null) {
            pairing.player1 = pairing.player2
            pairing.player2 = null
          };
        });
        setCurrentRoundMatchups(currentRoundPairings)

      }
    }, [selectedTournament.pairings, currentRound]
  )

  // useEffect(
  //   () => {
  //     const copy = {...gameForApi};
  //     copy.tournament_round = currentRound;
  //     updateGameForApi(copy);
  //   }, [currentRound]
  // )
  useEffect(
    () => {
      // if (tournamentGames) {
      const analysis = tournamentAnalysis(tournamentGames, currentRoundMatchupsRef.current, currentRound, byeGameRef);
      setTournamentAnalysisObj(analysis);
      // }
    }, [tournamentGames, currentRound, selectedTournament]
  )
  //TODO: THIS USEEFFECT CAN BE MORE EFFICIENT
  useEffect(
    () => {
      const byePairing = currentRoundMatchups.find(pairing => pairing.player2 === null);
      if (byePairing) {
        const byeCopy = { ...byeGame };
        byeCopy.player_b = {} as PlayerRelated | Guest;
        byeCopy.bye = true;
        byeCopy.win_style = "";
        byeCopy.time_setting = selectedTournament.time_setting;
        byeCopy.tournament = selectedTournament.id;
        byeCopy.tournament_round = currentRound;
        if (typeof byePairing.player1 === 'string') {
          const guestPlayer = activeTournamentPlayers.find(p => (p as Guest).guest_id === byePairing.player1)
          // byeCopy.winner_model_type = 'guestplayer';
          console.log(byeCopy)
          if (guestPlayer) {
            byeCopy.player_w_model_type = 'guestplayer';
            byeCopy.winner_model_type = getModelTypeForApi(guestPlayer);
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
    }, [currentRoundMatchups, activeTournamentPlayers, byeGame, tournamentAnalysisObj, currentRound, selectedTournament.id, selectedTournament.time_setting]
  )
  useEffect(
    () => {
      currentRoundMatchupsRef.current = currentRoundMatchups;
    }, [currentRoundMatchups]
  )

  const resetTournamentGames = () => {
    getTournamentGames(selectedTournament.id)
      .then(data => setTournamentGames(data))
  }
  const resetGameForApi = () => {
    updateGameForApi({
      player_w: {} as Guest | PlayerRelated,
      player_w_model_type: "",
      player_b: {} as Guest | PlayerRelated,
      player_b_model_type: "",
      tournament: 0,
      time_setting: 0,
      win_style: "",
      accepted: true,
      tournament_round: 0,
      winner: {} as Guest | PlayerRelated,
      winner_model_type: "",
      bye: false,
    });
  }
  const resetActiveTournament = () => {
    getTournament(selectedTournament.id)
      .then(data => selectTournament(data));
  }
  const getModelTypeForApi = (obj: PlayerRelated | Guest): string => {
    if ('guest_id' in obj) {
      return 'guestplayer';
    } else {
      return 'player'
    }
  }

  //TODO: need to have the same data going out as coming in for Games. Currently causing some complexity
  const handleGameForApiUpdate = (
    whitePlayer: PlayerRelated | Guest,
    blackPlayer: PlayerRelated | Guest,
    winner?: PlayerRelated | Guest,
    pastGame?: Game,
  ) => {
    //update winner, round, 
    let copy: OutgoingGame | Game = {} as OutgoingGame | Game;
    if (!pastGame) {
      copy = { ...gameForApi } as OutgoingGame;
      copy.tournament = selectedTournament.id;
      copy.tournament_round = currentRound;
      copy.time_setting = selectedTournament.time_setting;
      copy.player_w = whitePlayer;
      copy.player_w_model_type = getModelTypeForApi(whitePlayer);
      copy.player_b = blackPlayer;
      copy.player_b_model_type = getModelTypeForApi(blackPlayer);
    } else {
      if (pastGame) {
        copy = { ...pastGame };
      }
    }
    if (winner) {
      copy = copy as OutgoingGame;
      copy.winner = winner;
      copy.winner_model_type = getModelTypeForApi(winner);
      copy.win_style = 'checkmate';
    } else {
      copy = copy as OutgoingGame;
      copy.winner = null;
      copy.winner_model_type = null;
      copy.win_style = 'draw';
    }

    if (copy) {
      updateGameForApi(copy);
    }
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
            setTournamentAnalysisObj({} as tournamentAnalysisOutput);
          }}>exit</button>
        <button
          className="progressionControlBtn controlBtnApprove"
          onClick={() => {
            setModalMode('results');
          }}>Results</button>
      </div>
      <TournamentControls
        tournamentResetter={resetTourneys}
        tournamentGamesResetter={resetTournamentGames}
        activeTournamentResetter={resetActiveTournament}
        modalMode={modalMode}
        modalModeSetter={setModalMode}
        scoringMode={scoreMode}
        scoringModeSetter={setScoreMode}
        tournamentObj={selectedTournament}
        currentMatchups={currentRoundMatchups}
        gameForApi={gameForApi}
        byeGame={byeGameRef}
        userIsCreator={tournamentCreatorBool}
        activePlayers={activeTournamentPlayers}
        currentRound={currentRound}
        analysis={tournamentAnalysisObj}
        roundComplete={roundOver} />
      <div className="setColor setTournamentFontSize">
        Round {currentRound}
      </div>
      <section id="matchupsContainer">
        {scoreMode === 'scoring' ?
          <Scoring
            tournamentObj={selectedTournament}
            tourneyGames={tournamentGames}
            currentMatches={currentRoundMatchups}
            byeGame={byeGameRef}
            resetGame={resetGameForApi}
            resetTourneyGames={resetTournamentGames}
            isTourneyCreator={tournamentCreatorBool}
            round={currentRound}
            activePlayers={activeTournamentPlayers}
            analysis={tournamentAnalysisObj}
            gameForApi={gameForApi as OutgoingGame}
            handleUpdate={handleGameForApiUpdate} />
          : scoreMode === 'editing' ?
            <EditScores
              tourneyGames={tournamentGames}
              resetGame={resetGameForApi}
              resetTourneyGames={resetTournamentGames}
              gameForApi={gameForApi}
              handleUpdate={handleGameForApiUpdate}
              allClubMates={selectedClubMates} />
            : scoreMode === 'table' ?
              <TournamentTable
                analysis={tournamentAnalysisObj}
                allClubMates={selectedClubMates}
                round={currentRound}
                tournamentObj={selectedTournament} 
                byeGame={byeGameRef} />
              : null}
      </section>
    </main>
  </>
}