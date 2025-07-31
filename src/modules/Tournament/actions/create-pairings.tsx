import { findIdentifier } from "./find-identifier";
import { PlayerArg, playerArgCreator } from "./create-player-pairing-arg";
import { Swiss } from "tournament-pairings";
import type { PlayerRelated } from "../../../Types/Player";
import type { Guest } from "../../../Types/Guest";
import type { tournamentAnalysisOutput } from "./matchup-game-analysis";
import { findByIdentifier } from "./find-by-identifier";
import { Match } from "tournament-pairings/dist/Match";
import { resetPairingMatchNumbers } from "./reset-pairing-match-numbers";

type CreatePairingsFunction = (
  editOrNew: "edit" | "new",
  tournamentPlayers: (PlayerRelated | Guest)[],
  curRound: number,
  analysisObj: tournamentAnalysisOutput,
  currentByeGameRef?: any
) => any;

export const createPairings: CreatePairingsFunction = (
  editOrNew,
  tournamentPlayers,
  curRound,
  analysisObj,
  currentByeGameRef
) => {
  let playerArgs = [];
  //SETTING TARGET ROUND THIS WAY ACCOUNTS FOR EDITING OR NEW PAIRING
  const targetRound = editOrNew === "new" ? curRound + 1 : curRound;

  function* iterateSortedKeys(
    obj: { [key: string | number]: (string | number)[] },
    ascending = true
  ) {
    const sortedKeys = Object.keys(obj).sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      return ascending ? numA - numB : numB - numA;
    });
    for (const key of sortedKeys) {
      yield [key, obj[key]];
    }
  }

  function shuffleArray<T>(arr: T[]): T[] {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  let scoreByGroup: {
    [key: string | number]: (string | number)[];
  } = {};
  interface ScoreEntry {
    identifier: string | number;
    score: number;
  }

  const scoreEntries: ScoreEntry[] = [];
  for (const identifier in analysisObj.scoreObj) {
    const fixedIdentifier = isNaN(Number(identifier))
      ? identifier
      : Number(identifier);

    const rawScore = analysisObj.scoreObj[identifier];
    let playerScore = typeof rawScore === "number" ? rawScore : 0;

    if (
      currentByeGameRef &&
      identifier === findIdentifier(currentByeGameRef.player_w)
    ) {
      playerScore -= 1;
    }

    scoreEntries.push({ identifier: fixedIdentifier, score: playerScore });
  }

  // Process scores in order
  scoreEntries.sort((a, b) => a.score - b.score);
  const processedScores = new Set<number>();

  for (const { identifier, score } of scoreEntries) {
    if (!processedScores.has(score)) {
      processedScores.add(score);

      const playersAtScore = scoreEntries
        .filter(entry => entry.score === score)
        .map(entry => entry.identifier);

      scoreByGroup[score] = playersAtScore;
    }
  }

  // Handle bye games without modifying during iteration
  let byePlayerIdentifier: string | number | null = null;
  if (tournamentPlayers.length % 2 !== 0) {
    byePlayerLoop: for (const [score, idArr] of iterateSortedKeys(
      scoreByGroup,
      true
    )) {
      // debugger;
      if (!byePlayerIdentifier && Array.isArray(idArr)) {
        const shuffledPlayers = shuffleArray([...idArr]);

        for (const playerIdentifier of shuffledPlayers) {
          if (
            (analysisObj.playerOppRefObj[playerIdentifier] ?? []).includes(
              "bye"
            )
          ) {
            continue;
          }

          byePlayerIdentifier = playerIdentifier;
          break byePlayerLoop;
        }
      }
    }
  }
  
  console.log("currentByeGameRef", currentByeGameRef);
  console.log(
    "byePlayer",
    findByIdentifier(byePlayerIdentifier, tournamentPlayers)
  );

  //we have a POTENTIAL bye player
  let leftovers: any = [];

  let swissifiedOutput: Match[] = [];
  const lowestScore = Math.min(...Object.keys(scoreByGroup).map(Number));
  for (const [score, idArr] of iterateSortedKeys(scoreByGroup, false)) {
    // debugger;
    let playersInGroup = [...idArr, ...leftovers].filter(
      player => player !== byePlayerIdentifier
    );
    let pairingArgs: PlayerArg[] = [];
    if (playersInGroup.length > 1) {
      for (const identifier of playersInGroup) {
        const playerArg = playerArgCreator(
          identifier,
          analysisObj,
          tournamentPlayers,
          currentByeGameRef
        );
        if (!!playerArg) {
          pairingArgs.push(playerArg);
        }
      }
      if (!!pairingArgs && pairingArgs.length > 1) {
        // debugger;
        const swissified: Match[] = Swiss(
          pairingArgs,
          targetRound,
          false,
          true
        );
        const remainingPlayers = [];
        if (!!swissified.length) {
          const noByeSwissified = swissified.filter(
            g => g.player1 !== null && g.player2 !== null
          );
          swissifiedOutput = swissifiedOutput.concat(noByeSwissified);
          for (const playerId of playersInGroup) {
            const match = noByeSwissified.find(
              m => m.player1 === playerId || m.player2 === playerId
            );
            if (!match) {
              remainingPlayers.push(playerId);
            }
          }
        }

        leftovers = [...remainingPlayers];
      }
    } else {
      leftovers = [...playersInGroup];
    }

  }

  const unMatchedPlayers = tournamentPlayers.filter(p => {
    return !swissifiedOutput.find(
      match =>
        match.player1 === findIdentifier(p) ||
        match.player2 === findIdentifier(p)
    );
  });


  if (!!byePlayerIdentifier) {
    const byeMatchup = {
      round: targetRound,
      match: swissifiedOutput.length + 1,
      player1: Number(byePlayerIdentifier) || byePlayerIdentifier,
      player2: null,
    };
    swissifiedOutput.push(byeMatchup);
  }
  swissifiedOutput = resetPairingMatchNumbers(swissifiedOutput);

  return swissifiedOutput;
}