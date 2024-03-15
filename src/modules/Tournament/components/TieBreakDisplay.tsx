import type { Guest } from "../../../Types/Guest";
import type { PlayerRelated } from "../../../Types/Player";
import type { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";
import { tieBreakers } from "../actions/tie-breakers";

/*
arr input for tiebreaks:  [playerFullName, parseFloat(scoreObj[player], identifier)][]

*/

interface TieBreakDisplayProps {
  // tournamentPlayers: (PlayerRelated | Guest)[];
  analysis: tournamentAnalysisOutput;
  results: [string, number, string][];
}

export const TieBreakDisplay: React.FC<TieBreakDisplayProps> = ({
  // tournamentPlayers,
  analysis,
  results,
}) => {
  // const solkoffResultsArr = solkoffTieBreaker(analysis);
  console.log('tiebreaks', tieBreakers(analysis))
  return (
    <div id="tieBreakResults">
      {/* {solkoffTieBreaker(analysis)} */}
      {/* <div id="fullResults">
        <div className="resultsHeader">solkoff</div>
        <div id="solkoffResults">
          {
            solkoffResultsArr.map(playerResult => {
              const player = typeof playerResult[0] === 'string' ? allPlayersArr.find(player => player.guest_id === playerResult[0])
                : allPlayersArr.find(player => player.id === playerResult[0])
              return (
                <div key={playerResult[0] + '--' + playerResult[1]} className="resultsModalListItem">
                  <div>{player?.full_name}: </div>
                  <div>{playerResult[1]}</div>
                </div>
              )
            })
          }
        </div>
      </div>
      <div id="fullResults">
        <div className="resultsHeader">cumulative</div>
        <div id="cumulativeResults">
          {
            cumulativeResultsArr.map(playerResult => {
              const player = typeof playerResult[0] === 'string' ? allPlayersArr.find(player => player.guest_id === playerResult[0])
                : allPlayersArr.find(player => player.id === playerResult[0])
              return (
                <div key={playerResult[0] + '--' + playerResult[1]} className="resultsModalListItem">
                  <div>{player?.full_name}: </div>
                  <div>{playerResult[1]}</div>
                </div>
              )
            })
          }
        </div>
      </div> */}
    </div>
  )
}