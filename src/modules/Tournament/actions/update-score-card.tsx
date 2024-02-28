import type { ScoreCardType, ScoreObjType } from "./matchup-game-analysis"

export const updateScoreCard = (
  scoreCardObj: ScoreCardType,
  totalScoreObj: ScoreObjType,
  identifier: string | number | undefined,
  score: string | number
) => {
  if (identifier) {
    if (scoreCardObj[identifier]) {
      scoreCardObj[identifier].push(score);
      totalScoreObj[identifier] += scoreFromString(score);
    } else {
      scoreCardObj[identifier] = [score];
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