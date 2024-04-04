import { checkIfUserIsAppCreator } from "../actions/check-if-creator";
import { findIdentifier } from "../actions/find-identifier";
import type { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";
import type { PlayerRelated } from "../../../Types/Player";
import type { Guest } from "../../../Types/Guest";
import type { Tournament } from "../../../Types/Tournament";
import type { Match } from "tournament-pairings/dist/Match";
import type { Game } from "../../../Types/Game";
import { useEffect, useState } from "react";
import { MatchupItem } from "./MatchupItem";

interface ScoringProps {
  tournamentObj: Tournament;
  tourneyGames: Game[];
  currentMatches: Match[];
  //TODO: ANY-FIX PLAYERRELATEDISSUE
  byeGame: any;
  isTourneyCreator: boolean;
  round: number;
  activePlayers: (PlayerRelated | Guest)[];
  analysis: tournamentAnalysisOutput;
  handleUpdate: (
    whitePlayer: PlayerRelated | Guest | null,
    blackPlayer: PlayerRelated | Guest | null,
    winner?: PlayerRelated | Guest | undefined,
    pastGame?: Game
  ) => void;
  handleSendGameToApi: () => void;
}

export const Scoring: React.FC<ScoringProps> = ({
  tournamentObj,
  tourneyGames,
  currentMatches,
  byeGame,
  isTourneyCreator,
  round,
  activePlayers,
  analysis,
  handleUpdate,
  handleSendGameToApi,
}) => {
  const [selectedOutcome, setSelectedOutcome] = useState<[number, number, PlayerRelated | Guest | null | 'draw']>([0, 0, null]);//round, match, winner or 'draw'
  const scoringTargetIds = ['whitePieces', 'blackPieces', 'drawUpdate', 'scoringSubmit'];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target: HTMLElement = e.target as HTMLElement;
      if (target && !scoringTargetIds.includes(target.id)) {
        setSelectedOutcome([0, 0, null]);
        handleUpdate(null, null);
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const byeMatchup = currentMatches?.find(matchup => matchup.player1 === null || matchup.player2 === null);
  const whiteBye = byeGame.current.player_w.full_name;

  if (tournamentObj.in_person && (isTourneyCreator || checkIfUserIsAppCreator())) {
    return (
      <section id="tournamentScoringSection">
        {byeGame.current.player_w.id ?
          <div key={`${byeGame.current.round} -- ${byeGame.current.match} -- bye`} className="setColor setCustomFont">
            {byeGame.current.player_w.full_name} has bye
          </div>
          : ""}
        {byeMatchup !== undefined && tourneyGames.filter(tg => tg.tournament_round === round).length + 1 === currentMatches.length ?
          <div className="setCustomFont">Round complete. Start new round.</div> :
          byeMatchup === undefined && tourneyGames.filter(tg => tg.tournament_round === round).length === currentMatches.length ?
            <div className="setCustomFont">Round complete. Start new round.</div> :
            ""}
        {
          currentMatches.map((matchup, index) => {
            const whitePlayer = activePlayers.find(player => findIdentifier(player) === matchup.player1);
            const blackPlayer = activePlayers.find(player => findIdentifier(player) === matchup.player2);
            if (whitePlayer && blackPlayer && matchup.player1 && matchup.player2) {
              const matchingGame = tourneyGames.find(tg => {
                if (tg.player_w && tg.player_b) {
                  return findIdentifier(tg.player_w) === matchup.player1 && findIdentifier(tg.player_b) === matchup.player2 && tg.tournament_round === round && tg.tournament === tournamentObj.id
                } else {
                  return undefined;
                }
              });
              const whiteIdentifier = findIdentifier(whitePlayer);
              const blackIdentifier = findIdentifier(blackPlayer);
              if (!matchingGame && analysis.playerOppRefObj[whiteIdentifier]?.indexOf(blackIdentifier) !== analysis.playerOppRefObj[whiteIdentifier]?.length + 1) {
                return (
                  <MatchupItem
                    key={`${matchup.round}--${matchup.match}--${index}`}
                    matchup={matchup}
                    whitePlayer={whitePlayer}
                    blackPlayer={blackPlayer}
                    handleUpdate={handleUpdate}
                    index={index}
                    handleSendGameToApi={handleSendGameToApi}
                    selectedOutcome={selectedOutcome} 
                    setSelectedOutcome={setSelectedOutcome} />
                )
              }
            }
            // return (
            //   <div key={`${matchup.round} -- ${matchup.match} -- ${index}`}>
            //     {matchup.player1}
            //   </div>
            // )
          })
        }
      </section>
    )
  } else {
    return (
      <section id="tournamentScoringSection">
        {byeMatchup ?
          <div key={`${byeMatchup.round} -- ${byeMatchup.match} -- bye`} className="setColor setCustomFont">
            {whiteBye?.full_name} has bye
          </div>
          : ""}
        {
          currentMatches.map(matchup => {
            const white = activePlayers.find((player: PlayerRelated | Guest) => player.id === matchup.player1 || (player as Guest).guest_id === matchup.player1)
            const black = activePlayers.find((player: PlayerRelated | Guest) => player.id === matchup.player2 || (player as Guest).guest_id === matchup.player2)
            if (black !== undefined) {
              return (
                <div key={`${matchup.round} -- ${matchup.match}`}
                  className="tournamentScoringMatchup">
                  <div
                    className="whitePiecesMatchup"
                    id="whitePieces">
                    {white?.full_name}
                  </div>
                  <div className="setCustomFont">
                    Vs
                  </div>
                  <div
                    className="blackPiecesMatchup"
                    id="blackPieces">
                    {black.full_name}
                  </div>
                </div>
              )
            } else {
              return null;
            }
          })
        }
      </section>
    )
  }
}