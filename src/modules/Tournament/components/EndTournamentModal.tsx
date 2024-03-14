import { SetStateAction } from "react";
import { endTournament } from "../../../ServerManager"
import { type Tournament, selectedTournamentDefaults } from "../../../Types/Tournament";

interface EndTournamentModalProps {
  resetTourneys: () => void;
  selectTournament: React.Dispatch<SetStateAction<Tournament>>;
  selectedTournament: Tournament;
  modalModeSetter: React.Dispatch<SetStateAction<'none' | 'results' | 'edit-players' | 'end-tournament'>>;
}

export const EndTournamentModal: React.FC<EndTournamentModalProps> = ({
  resetTourneys,
  selectTournament,
  selectedTournament,
  modalModeSetter,
}) => {
  return (
    <div id="endTournamentModal" className="setCustomFont">
      End Tournament?
      <div id="endTournamentBtnBlock">
        <button
          className="buttonStyleApprove"
          onClick={() => {
            endTournament(selectedTournament.id)
              .then(() => {
                resetTourneys();
                selectTournament(selectedTournamentDefaults);
              })
          }
          }>confirm</button>
        <button
          className="buttonStyleReject"
          onClick={() => {
            modalModeSetter('results');
          }}>cancel</button>
      </div>
    </div>
  )
}