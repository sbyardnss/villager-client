import type { PlayerOppRefObjType } from "./matchup-game-analysis"

export const updatePlayerOppRefObj = (
  refObj: PlayerOppRefObjType,
  wIdentifier: string | number,
  bIdentifier?: string | number | null,
) => {
  const byeOrBlackIdentifier = bIdentifier ? bIdentifier : 'bye';

  if (refObj[wIdentifier]) {
    refObj[wIdentifier].push(byeOrBlackIdentifier);
  } else {
    refObj[wIdentifier] = [byeOrBlackIdentifier];
  }
  //BLACK refObj
  if (bIdentifier) {
    if (refObj[bIdentifier]) {
      refObj[bIdentifier].push(wIdentifier);
    } else {
      refObj[bIdentifier] = [wIdentifier];
    }
  }
}