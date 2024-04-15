
//TODO: MAKE SURE THIS WORKS ====== CARD ISSUE REFERENCE
export const updateScoreCardNones = (scoreArray: (number | string)[], iterationRound: number) => {
  if (scoreArray.length < iterationRound - 1) {
    let numOfRounds = scoreArray.length;
    while (numOfRounds < iterationRound - 1) {
      scoreArray.push('none');
      numOfRounds++;
    }
  }
}