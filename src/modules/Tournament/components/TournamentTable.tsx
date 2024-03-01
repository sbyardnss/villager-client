import { findIdentifier } from "../actions/find-identifier";
import type { Guest } from "../../../Types/Guest";
import type { PlayerRelated } from "../../../Types/Player";
import type { tournamentAnalysisOutput } from "../actions/matchup-game-analysis"
import { Tournament } from "../../../Types/Tournament";
import { findByIdentifier } from "../../../Tournament/actions/find-by-identifier";
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
  const [byePlayerIdentifier, setByePlayerIdentifier] = useState<string| number>();
  useEffect(
    () => {
      if (byeGame.current) {
        setByePlayerIdentifier(findIdentifier(byeGame.current.player_w));
      }
    },[byeGame.current]
  )
  console.log(byePlayerIdentifier)
  const sortAllPlayersArr = (playersArr: (PlayerRelated | Guest)[]) => {
    return playersArr.sort((a: PlayerRelated | Guest, b: PlayerRelated | Guest) => {
      const aIdentifier = findIdentifier(a);
      const bIdentifier = findIdentifier(b);
      return analysis.scoreObj[bIdentifier] - analysis.scoreObj[aIdentifier];
    });
  };
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
          {/* {
            sortAllPlayersArr(allClubMates).map(p => {
              let score = 0
              const guestIdOrId = p.guest_id ? p.guest_id : p.id
              const tourneyPlayerScores = scoreCard[guestIdOrId]
              return (
                <tr key={guestIdOrId} id={guestIdOrId + "--tourneyRow"} className="tablePlayerRow">
                  <td key={p.full_name + '--row'} className="tablePlayerCell sticky-col first-col">{p.full_name}</td>
                  {
                    tourneyPlayerScores?.map((s, index) => {
                      if (typeof s === 'number') {
                        score += s
                      }
                      if (s === 'bye') {
                        score += 1

                      }
                      if (s !== 'none') {
                        return (
                          <td key={guestIdOrId + '--' + index + '--' + p.full_name} className="scoreCell">{s}</td>
                        )
                      }
                      else if (s === 'none' && byePlayer === guestIdOrId && index + 1 === round) {
                        return (
                          <td key={guestIdOrId + '--' + index + '--' + p.full_name} className="scoreCell">bye</td>
                        )
                      }
                      else {
                        return (
                          <td key={guestIdOrId + '--' + index + '--' + p.full_name} className="scoreCell">0</td>
                        )
                      }
                    })
                  }
                  {!tourneyPlayerScores ? <td key={guestIdOrId + '-- noGameYet' + '--' + p.full_name} className="scoreCell">0</td> : ""}
                  {round < 6 ? <td className="scoreCell"></td> : ""}
                  <td key={guestIdOrId + "-- score" + p.full_name} id={guestIdOrId + "-- score"} className="totalScoreCell" value={analysis.scoreObj[guestIdOrId]}>
                    {score}
                  </td>
                </tr>
              )
            })
          } */}
          {
            Object.keys(analysis.scoreCard).map((identifier: number | string) => {
              const player = findByIdentifier(identifier, allClubMates);
              console.log(analysis.scoreCard[identifier])
              return (
                <tr key={identifier} id={identifier + "--tourneyRow"} className="tablePlayerRow">
                  <td key={player.full_name + '--row'} className="tablePlayerCell sticky-col first-col">{player.full_name}</td>
                  {
                    analysis.scoreCard[identifier].map((score, index) => {

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
                </tr>
              )
            })
          }
        </tbody>
        </table>
    </section>
  )
}