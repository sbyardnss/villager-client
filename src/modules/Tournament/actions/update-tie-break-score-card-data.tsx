import type { ScoreCardType, ScoreObjType, TieBreakObject } from "./matchup-game-analysis";
import type { Game } from "../../../Types/Game";
import { findIdentifier } from "./find-identifier";
import { updateScoreCard } from "./update-score-card";

export const updateTieBreakAndScoreCardData = (
  game: Game,
  gameResult: TieBreakObject,
  scoreCardForOutput: ScoreCardType,
  scoreObj: ScoreObjType,
  wIdentifier: number | string,
  bIdentifier?: number | string | undefined,
) => {
  if (game.winner) {
    const winnerIdentifier = findIdentifier(game.winner);
    const loserIdentifier = winnerIdentifier === wIdentifier ? bIdentifier : wIdentifier;
    gameResult.winner = winnerIdentifier;
    gameResult.win_style = game.win_style;
    gameResult.round = game.tournament_round;
    if (game.bye) {
      updateScoreCard(scoreCardForOutput, scoreObj, winnerIdentifier, 'bye');
    } else {
      updateScoreCard(scoreCardForOutput, scoreObj, winnerIdentifier, 1);
    }
    if (loserIdentifier) {
      updateScoreCard(scoreCardForOutput, scoreObj, loserIdentifier, 0);
    }
  } else if (game.win_style === 'draw') {
    updateScoreCard(scoreCardForOutput, scoreObj, wIdentifier, .5);
    updateScoreCard(scoreCardForOutput, scoreObj, bIdentifier, .5);
  }
}