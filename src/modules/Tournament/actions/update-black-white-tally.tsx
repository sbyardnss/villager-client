import type { BlackWhiteTallyType } from "./matchup-game-analysis"

export const updateBlackWhiteTally = (
  bwTallyObj: BlackWhiteTallyType,
  wIdentifier: string | number,
  bIdentifier: string | number,
) => {
  if (bwTallyObj[wIdentifier]) {
    bwTallyObj[wIdentifier].push('w');
  } else {
    bwTallyObj[wIdentifier] = ['w'];
  }
  //BLACK bwTallyObjTALLY
  if (bwTallyObj[bIdentifier]) {
    bwTallyObj[bIdentifier].push('b');
  } else {
    bwTallyObj[bIdentifier] = ['b'];
  }
}