import type { DigitalGame } from "../../../Types/Game";
import type { Move } from "./NewPlay";

interface ResetOrStartProps {
  selectedGame: DigitalGame;
  matchReady: boolean;
  // playerMove: Move;
  handleGameReset: () => void;
  review: boolean;
  reviewLength: number;
  setReviewLength: React.Dispatch<React.SetStateAction<number>>;
  reviewPgn: string[];
}


export const ResetOrStartBtns: React.FC<ResetOrStartProps> = ({
  selectedGame,
  matchReady,
  // playerMove,
  handleGameReset,
  review,
  reviewLength,
  setReviewLength,
  reviewPgn,
}) => {
  return <>
    <div id="playControls" >
      {!selectedGame.id && matchReady ?
        <div>
          <button
            className="buttonStyleApprove playBtns"
            onClick={() => {
              handleGameReset()
            }}
          >reset</button>
        </div> :
        review === true ?
          <div>
            <button className="reviewButtons"
              onClick={() => {
                setReviewLength(reviewLength - 1)
              }}>&lt;</button>
            <button className="reviewButtons"
              onClick={() => {
                if (reviewLength < reviewPgn.length) {
                  setReviewLength(reviewLength + 1)
                }
              }}>&gt;</button>
          </div>
          : ""
      }
    </div>
  </>
  // if (!selectedGame.id) {
  //   if (matchReady) {
  //     return (
  //       <div>
  //         <button
  //           className="buttonStyleApprove playBtns"
  //           onClick={() => {
  //             handleGameReset()
  //           }}
  //         >reset</button>
  //       </div>
  //     )
  //   }
  //   else {
  //     return null
  //   }
  // }
  // else if (review === true) {
  //   return (
  //     <div>
  //       <button className="reviewButtons"
  //         onClick={() => {
  //           setReviewLength(reviewLength - 1)
  //         }}>&lt;</button>
  //       <button className="reviewButtons"
  //         onClick={() => {
  //           if (reviewLength < reviewPgn.length) {
  //             setReviewLength(reviewLength + 1)
  //           }
  //         }}>&gt;</button>
  //     </div>
  //   )
  // } else {
  //   return <></>;
  // }

}