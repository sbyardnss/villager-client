import { createNewClub } from "../../ServerManager";
import { Dispatch, SetStateAction, useRef } from "react";
import type { ChessClubCreateEdit } from "./types/ChessClub";
import { handleFormChange } from "./actions/handle-form-change";
export interface CreateClubFormProps {
  newClub: Partial<ChessClubCreateEdit>;
  resetter: () => Promise<void>;
  updateClub: Dispatch<SetStateAction<Partial<ChessClubCreateEdit>>>;
  setter: Dispatch<SetStateAction<boolean>>;
}
export const CreateClubForm: React.FC<CreateClubFormProps> = ({
  newClub,
  resetter,
  updateClub,
  setter,
}) => {
  const initPassword = useRef<HTMLInputElement>(null);
  const confirmPassword = useRef<HTMLInputElement>(null);
  const setPasswordModal = document.getElementById("newClubPasswordSetModal");
  return <>
    <section id="clubForm">
      <div id="newClubPasswordSetModal">
        <div className="formInput">
          <label className="setCustomFont newClubFormLabel">Add password for joining?</label>
          <input id="passwordInit" type="text" placeholder="password" ref={initPassword} />
        </div>
        <div className="formInput">
          <label className="setCustomFont newClubFormLabel">Confirm password</label>
          <input id="passwordConfirm" type="text" placeholder=" confirm password" ref={confirmPassword} />
        </div>
        <div id="newClubButtonBlock">
          <button className="buttonStyleApprove" onClick={() => {
            if (initPassword.current && confirmPassword.current && initPassword.current.value === confirmPassword.current.value) {
              const copy = { ...newClub }
              if (confirmPassword.current.value === "" && initPassword.current.value === "") {
                copy.password = null
              }
              else {
                copy.password = confirmPassword.current.value
              }
              copy.address = copy.address === "" ? null : copy.address;
              copy.state = copy.state === "" ? null : copy.state;
              copy.zipcode = copy.zipcode === 0 ? null : copy.zipcode;
              copy.details = copy.details === "" ? null : copy.details;
              copy.city = copy.city === "" ? null : copy.city;
              // console.log(copy)
              if (setPasswordModal)
                setPasswordModal.style.display = 'none'
              createNewClub(copy)
                .then(() => {
                  resetter()
                })
                // setPasswordModal.style.display = 'none'
                setter(false)
            }
          }}>create new club</button>
          <button className="buttonStyleReject" onClick={() => {
            if (setPasswordModal)
              setPasswordModal.style.display = 'none'
          }}>cancel</button>
        </div>
      </div>
      <div className="formInput">
        <label className="setCustomFont newClubFormLabel">Club Name</label>
        <input id="name" type="text" placeholder="new club name" onChange={(evt) => handleFormChange({ evt: evt, stateObject: newClub, handler: updateClub })} />
      </div>
      <div className="formInput">
        <label className="setCustomFont newClubFormLabel">Address</label>
        <input id="address" type="text" placeholder="street address (optional)" onChange={(evt) => handleFormChange({ evt: evt, stateObject: newClub, handler: updateClub })} />
      </div>
      <div className="formInput">
        <label className="setCustomFont newClubFormLabel">City</label>
        <input id="city" type="text" placeholder="city (optional)" onChange={(evt) => handleFormChange({ evt: evt, stateObject: newClub, handler: updateClub })} />
      </div>
      <div className="formInput">
        <label className="setCustomFont newClubFormLabel">State</label>
        <input id="state" type="text" placeholder="abbreviation (optional)" onChange={(evt) => handleFormChange({ evt: evt, stateObject: newClub, handler: updateClub })} />
      </div>
      <div className="formInput">
        <label className="setCustomFont newClubFormLabel">ZipCode</label>
        <input id="zipcode" type="number" placeholder="zipcode (optional)" onChange={(evt) => handleFormChange({ evt: evt, stateObject: newClub, handler: updateClub })} />
      </div>
      <div className="formInput">
        <label className="setCustomFont newClubFormLabel">Details</label>
        <textarea id="details" placeholder="Where do you meet? What time? etc (optional)" onChange={(evt) => handleFormChange({ evt: evt, stateObject: newClub, handler: updateClub })}></textarea>
      </div>
      <div id="newClubButtonBlock">
        <button className="buttonStyleApprove" onClick={() => {
          if (newClub.name && setPasswordModal) {
            setPasswordModal.style.display = 'flex'
          }
        }}>create new club</button>
        <button className="buttonStyleReject" onClick={() => setter(false)}>cancel</button>
      </div>
    </section>
  </>
}