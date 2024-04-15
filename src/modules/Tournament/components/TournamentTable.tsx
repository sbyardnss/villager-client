import { findIdentifier } from "../actions/find-identifier";
import type { Guest } from "../../../Types/Guest";
import type { PlayerRelated } from "../../../Types/Player";
import { ScoreCardType, type tournamentAnalysisOutput } from "../actions/matchup-game-analysis"
import { Tournament } from "../../../Types/Tournament";
import { findByIdentifier } from "../actions/find-by-identifier";
import { OutgoingGame } from "../../../Types/Game";
import { useEffect, useState } from "react";

interface TournamentTableProps {
  analysis: tournamentAnalysisOutput;
  allClubMates: (PlayerRelated | Guest)[];
  round: number;
  tournamentObj: Tournament;
  byeGame: React.RefObject<OutgoingGame>;
}
export const TournamentTable: React.FC<TournamentTableProps> = ({
  analysis,
  allClubMates,
  round,
  tournamentObj,
  byeGame,
}) => {
  const [byePlayerIdentifier, setByePlayerIdentifier] = useState<string | number>();
  const [scoreCardForDisplay, setScoreCardForDisplay] = useState<ScoreCardType>({});
  const [sortedScoreIdentifiers, setSortedScoreIdentifiers] = useState<(string | number)[]>([]);
  useEffect(
    () => {
      if (byeGame.current) {
        setByePlayerIdentifier(findIdentifier(byeGame.current.player_w));
      }
    }, [byeGame]
  )
  useEffect(
    () => {
      const scoreCardCopy = { ...analysis.scoreCard };
      //TODO: do we need this 
      for (const identifier in scoreCardCopy) {
        if (scoreCardCopy[identifier].length < round) {
          while (scoreCardCopy[identifier].length < round) {
            scoreCardCopy[identifier].push('none');
          }
        }
      }
      setScoreCardForDisplay(scoreCardCopy);
    }, [analysis.scoreCard, round]
  )
  useEffect(
    () => {
      const sorted = Object.keys(analysis.scoreObj).sort((a, b) => analysis.scoreObj[b] - analysis.scoreObj[a]).map(i => parseInt(i) || i);
      setSortedScoreIdentifiers(sorted);
    }, [analysis.scoreObj]
  )

  const roundPopulation = () => {
    let roundNumber = tournamentObj.rounds;

    let tableHtml = [];
    while (roundNumber > 0) {
      if (roundNumber === round) {
        tableHtml.push(<th key={roundNumber} className="currentRoundHeader">{roundNumber}</th>)

      }
      else {
        tableHtml.push(<th key={roundNumber} className="roundHeader">{roundNumber}</th>)
      }
      roundNumber--;
    }
    return tableHtml.reverse()
  }
  const roundHtml = roundPopulation()

  return (
    <section id="tournamentTableContainer">
      <table id="tournamentTable">
        <thead>
          <tr key={0} className="tableHeaderRow">
            <th className="sticky-col first-col">player</th>
            {
              roundHtml.map(round => {
                return round
              })
            }
            {round < 6 ? <th ></th> : ""}
            <th>score</th>
          </tr>
        </thead>
        <tbody>
          {
            sortedScoreIdentifiers.map((identifier: number | string) => {
              const player = findByIdentifier(identifier, allClubMates);
              if (player) {
                return (
                  <tr key={identifier} id={identifier + "--tourneyRow"} className="tablePlayerRow">
                    <td key={player.full_name + '--row'} className="tablePlayerCell sticky-col first-col">{player.full_name}</td>
                    {
                      scoreCardForDisplay[identifier].map((score, index) => {
                        if (score !== 'none') {
                          return (
                            <td key={identifier + '--' + index + '--' + player.full_name} className="scoreCell">{score}</td>
                          )
                        }
                        else if (score === 'none' && byePlayerIdentifier === identifier && index + 1 === round) {
                          return (
                            <td key={identifier + '--' + index + '--' + player.full_name} className="scoreCell">bye</td>
                          )
                        }
                        else {
                          return (
                            <td key={identifier + '--' + index + '--' + player.full_name} className="scoreCell">0</td>
                          )
                        }
                      })
                    }
                    {round < 6 ? <td className="scoreCell"></td> : ""}
                    <td
                      data-cy={`${identifier}--score-cell`}
                      key={identifier + "-- score" + player.full_name}
                      id={identifier + "-- score"}
                      className="totalScoreCell">
                      {analysis.scoreObj[identifier]}
                    </td>
                  </tr>
                )
              }
            })
          }
        </tbody>
      </table>
    </section>
  )
}