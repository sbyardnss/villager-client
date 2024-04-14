//TODO: CSS-ISSUE --throughout this component
interface NewRoundProps {
  operation: 'editing-players' | 'new-round-normal' | 'normal-play';
  setOperation: React.Dispatch<React.SetStateAction<'editing-players' | 'new-round-normal' | 'normal-play'>>;
  modalModeSetter: React.Dispatch<React.SetStateAction<'none' | 'results' | 'edit-players' | 'end-tournament' | 'new-round' | 'force-match'>>;
  callHandleUpdateTournament: () => void;
}

export const NewRoundModal: React.FC<NewRoundProps> = ({
  operation,
  setOperation,
  modalModeSetter,
  callHandleUpdateTournament,
}) => {
  return <>
    <div className="tournament-modal-fixed column a-center">
      <div className="d-flex j-between w-100">
        <h2 className="setCustomFont">Need a forced match?</h2>
        <button
          className="progressionControlBtn buttonStyleReject"
          onClick={() => {
            if (operation === 'editing-players') {
              modalModeSetter('edit-players');
            } else {
              setOperation('normal-play');
              modalModeSetter('none');
            }
          }}>
          cancel
        </button>
      </div>
      <button
        className="large-control-button"
        onClick={() => {
          if (operation === 'editing-players') {
            if (window.confirm("Confirm games have not started")) {
              callHandleUpdateTournament();
              modalModeSetter('none');
            }
          } else if (operation === 'new-round-normal') {
            if (window.confirm("Create Round?")) {
              callHandleUpdateTournament();
              modalModeSetter('none');
            }
          }
        }}>
        Start round
      </button>
      <button
        className="large-control-button"
        onClick={() => modalModeSetter('force-match')}>
        Start round with a forced match
      </button>
    </div>
  </>
}