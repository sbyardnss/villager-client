import type { ScoreCardType, ScoreObjType } from "./matchup-game-analysis"
import { updateScoreCardNones } from "./update-score-card-none";

export const updateScoreCard = (
  iterationRound: number,
  scoreCardObj: ScoreCardType,
  totalScoreObj: ScoreObjType,
  identifier: string | number | undefined,
  score: string | number
) => {
  if (identifier) {
    if (scoreCardObj[identifier]) {
      updateScoreCardNones(scoreCardObj[identifier], iterationRound);
      scoreCardObj[identifier].push(score);
      totalScoreObj[identifier] += scoreFromString(score);
    } else {
      scoreCardObj[identifier] = [];
      updateScoreCardNones(scoreCardObj[identifier], iterationRound);
      scoreCardObj[identifier].push(score);
      totalScoreObj[identifier] = scoreFromString(score);
    }
    // if (totalScoreObj[identifier]) {
    // } else {
    // }
  }
}

const scoreFromString = (score: number | string) => {
  if (typeof score === 'number') {
    return score;
  } else if (score === 'bye') {
    return 1;
  } else {
    return 0;
  }
}