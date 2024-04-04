import React, { SetStateAction } from 'react';
import { PlayerRelated } from '../../../Types/Player';
import { Guest } from '../../../Types/Guest';
import { findIdentifier } from '../actions/find-identifier';

interface MatchupItemProps {
  matchup: any; // Define the type for matchup
  whitePlayer: any; // Define the type for whitePlayer
  blackPlayer: any; // Define the type for blackPlayer
  handleUpdate: (...args: any[]) => void; // Define the type for handleUpdate
  index: number;
  handleSendGameToApi: () => void;
  selectedOutcome: [number, number, PlayerRelated | Guest | null | 'draw'];
  setSelectedOutcome: React.Dispatch<SetStateAction<[number, number, PlayerRelated | Guest | null | 'draw']>>;
}

export const MatchupItem: React.FC<MatchupItemProps> = ({
  matchup,
  whitePlayer,
  blackPlayer,
  handleUpdate,
  index,
  handleSendGameToApi,
  selectedOutcome,
  setSelectedOutcome,
}) => {

  return (
    <div
      data-cy={`matchup-div--match-${matchup.match}--round-${matchup.round}`}
      className="tournamentScoringMatchup">
      <div
        data-cy={`white-scoring-selector--match-${matchup.match}--round-${matchup.round}`}
        className={selectedOutcome[2] === whitePlayer ? "selectedWhitePiecesMatchup" : "whitePiecesMatchup"}
        id="whitePieces"
        onClick={() => {
          setSelectedOutcome([matchup.round, matchup.match, whitePlayer]);
          handleUpdate(whitePlayer, blackPlayer, whitePlayer);
        }}>{whitePlayer.full_name} {findIdentifier(whitePlayer)}
      </div>
      <div
        data-cy={`draw-scoring-selector--match-${matchup.match}--round-${matchup.round}`}
        className={selectedOutcome[0] === matchup.round && selectedOutcome[1] === matchup.match && selectedOutcome[2] === 'draw' ? "selectedDrawMatchupButton" : "drawMatchupButton"}
        id="drawUpdate"
        onClick={() => {
          setSelectedOutcome([matchup.round, matchup.match, 'draw']);
          handleUpdate(whitePlayer, blackPlayer);
        }}>Draw
      </div>
      <div
        data-cy={`black-scoring-selector--match-${matchup.match}--round-${matchup.round}`}
        className={selectedOutcome[2] === blackPlayer ? "selectedBlackPiecesMatchup" : "blackPiecesMatchup"}
        id="blackPieces"
        onClick={() => {
          setSelectedOutcome([matchup.round, matchup.match, blackPlayer]);
          handleUpdate(whitePlayer, blackPlayer, blackPlayer);
        }}>{blackPlayer.full_name} {findIdentifier(blackPlayer)}
      </div>
      <button
        data-cy={`submit-score-btn--match-${matchup.match}--round-${matchup.round}`}
        id="scoringSubmit"
        className="buttonStyleReject"
        onClick={() => {
          handleSendGameToApi();
        }}>
        submit
      </button>
    </div>
  )
}