import { SetStateAction } from "react";
import { Guest } from "../../../Types/Guest";
import { PlayerRelated } from "../../../Types/Player";
import { checkIfUserIsAppCreator } from "../actions/check-if-creator";
import { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";
import { Tournament } from "../../../Types/Tournament";
import { findByIdentifier } from "../actions/find-by-identifier";
import { TieBreakDisplay } from "./TieBreakDisplay";

interface ResultsModalProps {
  allClubMates: (PlayerRelated | Guest)[];
  analysis: tournamentAnalysisOutput;
  modalModeSetter: React.Dispatch<SetStateAction<'none' | 'results' | 'edit-players' | 'end-tournament'>>;
  creatorBool: boolean;
  tournamentObj: Tournament;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  allClubMates,
  analysis,
  modalModeSetter,
  creatorBool,
  tournamentObj,
}) => {
  // const isNewOrPastRound = () => {
  //   if (tournamentGames.find(tGame => tGame.tournament_round === currentRound)) {
  //     return true
  //   }
  //   return false
  // }
  // const byePlayerId =  Object.keys(analysis.scoreCard).find((key, value) => {
  //   console.log('key', key)
  //   console.log('value', value)
  // })
  // console.log(analysis)
  const resultArr: [string, number, string][] =
    Object.entries(analysis.scoreObj).map(([key, value]): [string, number, string] => {
      const player = findByIdentifier(key, allClubMates);
      if (player) {
        return [player.full_name, value, key];
      } else {
        return ['unknown', value, key];
      }
    }).sort((a: [string, number, string], b: [string, number, string]) => {
      return b[1] - a[1];
    });
  console.log(resultArr)
  return (
    <div id="resultsModal">
      Results
      <section id="fullResults" className="setCustomFont">
        <div id="standardResults" >
          <div className="resultsHeader">standard</div>
          {
            resultArr.map((r: any) => {
              return (
                <div key={r[0]} className="resultsModalListItem">
                  <div>{r[0]}: </div>
                  {/* <div>{r[2] === currentByePlayer && isNewOrPastRound() === true ? (r[1] + 1).toString() : r[1].toString()}</div> */}
                  <div>{r[1]}</div>
                </div>
              )
            })
          }
        </div>
        <TieBreakDisplay
          analysis={analysis}
          playerScores={resultArr} 
          allClubMates={allClubMates}/>
      </section>
      <div id="modalBtns">
        {tournamentObj?.complete === false && (creatorBool || checkIfUserIsAppCreator()) ?
          <button
            className="buttonStyleApprove"
            onClick={() => {
              modalModeSetter('end-tournament');
            }}>End Tournament</button>
          : ""}
        <button
          className="buttonStyleReject"
          onClick={() => {
            modalModeSetter('none');
          }}>cancel</button>
      </div>
    </div>
  )
}