import { useState, useEffect, useRef } from "react"
import { useAppContext } from "../../App/AppProvider"
import { checkIfUserIsAppCreator } from "../actions/check-if-creator"
import { getTournamentGames, getTournament, sendNewGame } from "../../../ServerManager";
import { tournamentAnalysis } from "../actions/matchup-game-analysis";
import { ResultsModal } from "./ResultsModal";
import { EndTournamentModal } from "./EndTournamentModal";
import { EditPlayersModal } from "./EditPlayersModal";
import { Scoring } from "./Scoring";
import { EditScores } from "./EditScores";
import { TournamentTable } from "./TournamentTable";
import { TournamentControls } from "./TournamentControls";
import { type Tournament, selectedTournamentDefaults } from "../../../Types/Tournament";
import type { PlayerRelated } from "../../../Types/Player";
import { playerRelatedDefaults } from "../../../Types/Player";
import type { Guest } from "../../../Types/Guest";
import type { Game, OutgoingGame } from "../../../Types/Game";
import { gameForApiDefaults } from "../../../Types/Game";
import type { Match } from "tournament-pairings/dist/Match";
import type { ChessClub } from "../../../Types/ChessClub";
import { chessClubDefaults } from "../../../Types/ChessClub";
import type { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";
import { tournamentAnalysisDefaults } from "../actions/matchup-game-analysis";
import { findByIdentifier } from "../actions/find-by-identifier";
import { createPairings } from "../actions/create-pairings";
import { NewRoundModal } from "./NewRoundModal";
import { ForcePlayersModal } from "./ForcePlayersModal";
import { handleUpdateTournament } from "../actions/handle-update-tournament";
import { findIdentifier } from "../actions/find-identifier";

interface ActiveTournamentProps {
  selectedTournament: Tournament;
  selectTournament: React.Dispatch<React.SetStateAction<Tournament>>;
  selectClub: React.Dispatch<React.SetStateAction<ChessClub>>;
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
  allClubMates,
}) => {
  const { localVillagerUser, myChessClubs } = useAppContext();

  const [activeTournamentPlayers, setActiveTournamentPlayers] = useState<(PlayerRelated | Guest)[]>([])
  const [tournamentCreatorBool, setTournamentCreatorBool] = useState(false);
  const [tournamentGames, setTournamentGames] = useState<Game[]>([]);
  const [currentRoundMatchups, setCurrentRoundMatchups] = useState<Match[]>([]);
  const currentRoundMatchupsRef = useRef(currentRoundMatchups);
  const [selectedClubMates, setSelectedClubMates] = useState<(PlayerRelated | Guest)[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [scoreMode, setScoreMode] = useState<'scoring' | 'editing' | 'table'>("scoring");
  const [modalMode, setModalMode] = useState<'none' | 'results' | 'edit-players' | 'end-tournament' | 'new-round' | 'force-match'>('none');
  const [tournamentAnalysisObj, setTournamentAnalysisObj] = useState<tournamentAnalysisOutput>({ ...tournamentAnalysisDefaults }); //TODO DEFAULTS
  const [roundOver, setRoundOver] = useState(false);
  const [gameForApi, updateGameForApi] = useState<OutgoingGame | Game>({ ...gameForApiDefaults });
  const [selectedPlayersForForce, setSelectedPlayersForForce] = useState<(PlayerRelated | Guest)[]>([]);
  const [currentOperation, setCurrentOperation] = useState<'editing-players' | 'new-round-normal' | 'normal-play'>('normal-play');
  const byeGameRef = useRef<OutgoingGame>({
    player_w: {} as Guest | PlayerRelated, //TODO: INITIALIZE THIS WITH UNDEFINED OR NULL
    player_w_model_type: "",
    player_b: null,
    player_b_model_type: null,
    tournament: 0,
    time_setting: 0,
    win_style: "",
    accepted: true,
    tournament_round: 0,
    winner: null,
    winner_model_type: null,
    bye: true
  });

  //TODO: MAYBE ADD THESE TO CONTEXT LAYER? THEY ARE ONLY USED FOR CREATING PAIRINGS WITH EDITED PLAYERS
  const [gamesStarted, setGamesStarted] = useState(true);
  const [pastPairings, setPastPairings] = useState<Match[]>([]);
  const [currentPairings, setCurrentPairings] = useState<Match[]>([]);
  const [gamesFromThisRound, setGamesFromThisRound] = useState<Game[]>([]);
  const [roundGameIdentifiers, setRoundGameIdentifiers] = useState<(string | number)[][]>([]);
  const [editedTournamentAnalysis, setEditedTournamentAnalysis] = useState<tournamentAnalysisOutput>({ ...tournamentAnalysisDefaults });
  const [editedTournament, updateEditedTournament] = useState<Tournament>({
    id: 0,
    title: "",
    creator: { ...playerRelatedDefaults },
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
  //END ONLY FOR EDITED PLAYER PAIRING CREATION


  useEffect(
    () => {
      console.log('currentOperation', currentOperation)
    }, [currentOperation]
  )
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
      if (chosenClub)
        selectClub(chosenClub)
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
      const analysis = tournamentAnalysis(tournamentGames, currentRoundMatchupsRef.current, currentRound, byeGameRef, activeTournamentPlayers);
      setTournamentAnalysisObj(analysis);
      // }
    }, [tournamentGames, currentRound, selectedTournament]
  )
  //TODO: THIS USEEFFECT CAN BE MORE EFFICIENT
  useEffect(
    () => {
      const byePairing = currentRoundMatchups.find(pairing => pairing.player2 === null);
      if (byePairing) {
        const byeGameData: OutgoingGame = {
          ...gameForApiDefaults,
          bye: true,
          player_b: null,
          player_b_model_type: null,
          win_style: "",
          tournament_round: currentRound,
          tournament: selectedTournament.id,
          time_setting: selectedTournament.time_setting,
        };
        const byeCompetitor = findByIdentifier(byePairing.player1, activeTournamentPlayers);
        if (byeCompetitor) {
          byeGameData.player_w = byeCompetitor;
          byeGameData.winner = byeCompetitor;
          if (typeof byePairing.player1 === 'number') {
            byeGameData.player_w_model_type = 'player';
            byeGameData.winner_model_type = 'player';
          } else {
            byeGameData.player_w_model_type = 'guestplayer';
            byeGameData.winner_model_type = 'guestplayer';
          }
        }
        byeGameRef.current = byeGameData;
      } else {
        byeGameRef.current = {
          ...gameForApiDefaults,
          bye: true,
          player_b: null,
          player_b_model_type: null,
          win_style: "",
          tournament_round: currentRound,
          tournament: selectedTournament.id,
          time_setting: selectedTournament.time_setting,
        };
      }
    }, [currentRoundMatchups, selectedTournament.rounds, activeTournamentPlayers]
  )
  useEffect(
    () => {
      currentRoundMatchupsRef.current = currentRoundMatchups;
    }, [currentRoundMatchups]
  )

  useEffect(
    () => {
      const matchupIdentifiers: (string | number)[][] = [];
      //TODO: IS THIS FILTERED ENOUGH? DO WE NEED TO CHECK ANYTHING ELSE?
      const completedCurrentRoundGames = tournamentGames.filter(game => {
        if (game.player_b && game.player_w && game.tournament_round === currentRound)
          matchupIdentifiers.push([findIdentifier(game.player_w), findIdentifier(game.player_b)]);
        return game.tournament_round === currentRound;
      });
      setRoundGameIdentifiers(matchupIdentifiers);
      setGamesFromThisRound(completedCurrentRoundGames);
    }, [tournamentGames, currentRound]
  )

  const resetTournamentGames = () => {
    getTournamentGames(selectedTournament.id)
      .then(data => setTournamentGames(data))
  }
  const resetGameForApi = () => {
    updateGameForApi({ ...gameForApiDefaults });
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
  // console.log(createPairings('new', activeTournamentPlayers, currentRound, tournamentAnalysisObj, byeGameRef.current))

  //TODO: need to have the same data going out as coming in for Games. Currently causing some complexity
  const handleGameForApiUpdate = (
    whitePlayer: PlayerRelated | Guest | null,
    blackPlayer: PlayerRelated | Guest | null,
    winner?: PlayerRelated | Guest,
    pastGame?: Game,
  ) => {
    if (whitePlayer && blackPlayer) {
      //update winner, round, 
      let copy: OutgoingGame | Game = { ...gameForApiDefaults };
      // let copy: OutgoingGame | Game = {} as OutgoingGame | Game;
      //TODO: ADD USEEFFECT FOR SOME OF THIS. SHOULD BE ABLE TO AUTOMATICALLY ADD SOME PROPERTIES TO GAMEFORAPI LIKE ROUND AND TOURNAMENT
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
    } else {
      resetGameForApi();
    }
  }
  const handleSendGameToApi = () => {
    if (gameForApi.win_style) {
      sendNewGame(gameForApi)
        .then(data => {
          setTournamentGames([...tournamentGames, data]);
        });
      resetGameForApi();
    }
  }
  const handleReplaceGame = (gameData: Game, index: number) => {
    setTournamentGames(tournamentGames.map(game => game.id === gameData.id ? gameData : game));
    resetGameForApi();
  }

  const callHandleUpdateTournament = () => {
    if (currentOperation === 'editing-players') {
      handleUpdateTournament(currentOperation, setCurrentOperation, editedTournament, [...selectedPlayersForForce], setSelectedPlayersForForce, tournamentAnalysisObj, currentRound, byeGameRef.current, resetActiveTournament, resetTournamentGames, gamesFromThisRound, roundGameIdentifiers, gamesStarted, editedTournamentAnalysis, currentPairings);
    } else if (currentOperation === 'new-round-normal') {
      handleUpdateTournament(currentOperation, setCurrentOperation, selectedTournament, [...selectedPlayersForForce], setSelectedPlayersForForce, tournamentAnalysisObj, currentRound, byeGameRef.current, resetActiveTournament, resetTournamentGames, gamesFromThisRound, undefined, undefined, undefined, currentPairings);
    }
  }

  return <>
    <main id="tournamentContainer">
      {modalMode === 'results' ?
        <ResultsModal
          allClubMates={allClubMates}
          modalModeSetter={setModalMode}
          analysis={tournamentAnalysisObj}
          creatorBool={tournamentCreatorBool}
          tournamentObj={selectedTournament} />
        : modalMode === 'edit-players' ?
          <EditPlayersModal
            // operation={currentOperation}
            setOperation={setCurrentOperation}
            tournamentObj={selectedTournament}
            modalModeSetter={setModalMode}
            // activeTournamentResetter={resetActiveTournament}
            byeGame={byeGameRef}
            rounds={currentRound}
            // analysis={tournamentAnalysisObj}
            tourneyGames={tournamentGames}
            tournamentClub={selectedClub}
            // resetTournaments={resetTourneys}
            // selectedPlayersForForce={selectedPlayersForForce}
            // setSelectedPlayersForForce={setSelectedPlayersForForce} 
            setPastPairings={setPastPairings}
            currentPairings={currentPairings}
            setCurrentPairings={setCurrentPairings}
            setGamesFromThisRound={setGamesFromThisRound}
            setRoundGameIdentifiers={setRoundGameIdentifiers}
            setNewAnalysis={setEditedTournamentAnalysis}
            editedTournament={editedTournament}
            updateEditedTournament={updateEditedTournament}
            gamesStarted={gamesStarted}
            setGamesStarted={setGamesStarted}
            callHandleUpdateTournament={callHandleUpdateTournament} />
          : modalMode === 'end-tournament' ?
            <EndTournamentModal
              resetTourneys={resetTourneys}
              modalModeSetter={setModalMode}
              selectTournament={selectTournament}
              selectedTournament={selectedTournament} />
            : modalMode === 'new-round' ?
              <NewRoundModal
                operation={currentOperation}
                setOperation={setCurrentOperation}
                modalModeSetter={setModalMode}
                callHandleUpdateTournament={callHandleUpdateTournament} />
              : modalMode === 'force-match' ?
                <ForcePlayersModal
                  modalModeSetter={setModalMode}
                  selectedPlayersForForce={selectedPlayersForForce}
                  setSelectedPlayersForForce={setSelectedPlayersForForce}
                  activePlayers={
                    currentOperation === 'editing-players'
                      ? editedTournament.competitors.concat(editedTournament.guest_competitors)
                      : activeTournamentPlayers
                  }
                  analysis={
                    currentOperation === 'editing-players'
                      ? editedTournamentAnalysis
                      : tournamentAnalysisObj
                  }
                  callHandleUpdateTournament={callHandleUpdateTournament}
                />
                : ""}
      <div id="tournamentHeader">
        <div id="activeTournamentTitle" className="setColor setTournamentFontSize">{selectedTournament.title}</div>
        <button
          className="progressionControlBtn buttonStyleReject"
          onClick={() => {
            setModalMode('none');
            selectTournament(selectedTournamentDefaults);
            selectClub(chessClubDefaults);
            setTournamentAnalysisObj({ ...tournamentAnalysisDefaults }); //TODO do we actually need this? the component should be reinitialized with the default value
            resetTourneys();
          }}>exit</button>
        <button
          className="progressionControlBtn controlBtnApprove"
          onClick={() => {
            setModalMode('results');
          }}>Results</button>
      </div>
      <TournamentControls
        operation={currentOperation}
        setOperation={setCurrentOperation}
        tournamentResetter={resetTourneys}
        tournamentGamesResetter={resetTournamentGames}
        activeTournamentResetter={resetActiveTournament} //TODO: where is this being used
        modalMode={modalMode}
        modalModeSetter={setModalMode}
        scoringMode={scoreMode}
        scoringModeSetter={setScoreMode}
        tournamentObj={selectedTournament}
        currentMatchups={currentRoundMatchups}
        gameForApi={gameForApi}
        byeGameCurrent={byeGameRef.current}
        userIsCreator={tournamentCreatorBool}
        activePlayers={activeTournamentPlayers}
        currentRound={currentRound}
        analysis={tournamentAnalysisObj}
        roundComplete={roundOver} />
      {currentRound ?
        <div className="setColor setTournamentFontSize">
          Round {currentRound}
        </div>
        : ""}
      <section id="matchupsContainer">
        {scoreMode === 'scoring' ?
          <Scoring
            tournamentObj={selectedTournament}
            tourneyGames={tournamentGames}
            currentMatches={currentRoundMatchups}
            byeGame={byeGameRef}
            isTourneyCreator={tournamentCreatorBool}
            round={currentRound}
            activePlayers={activeTournamentPlayers}
            analysis={tournamentAnalysisObj}
            handleUpdate={handleGameForApiUpdate}
            handleSendGameToApi={handleSendGameToApi} />
          : scoreMode === 'editing' ?
            <EditScores
              tourneyGames={tournamentGames}
              resetGame={resetGameForApi}
              resetTourneyGames={resetTournamentGames}
              gameForApi={gameForApi}
              handleUpdate={handleGameForApiUpdate}
              allClubMates={selectedClubMates}
              handleReplaceGame={handleReplaceGame} />
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