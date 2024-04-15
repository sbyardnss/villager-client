import { useEffect, useState, useRef, useContext } from "react"
import { updateClub, deleteChessClub, removeClubPassword } from "../../../ServerManager"
import { handleFormChange } from "../actions/handle-form-change";
import { ChessClub, ChessClubEdit } from "../../../Types/ChessClub";
import { AppContext, useAppContext } from "../../App/AppProvider";
import { showAlertModal } from "../../../shared/AlertModal/alert-modal";

interface EditClubProps {
  clubId: number;
  clubObj: ChessClub;
  setClub: React.Dispatch<React.SetStateAction<number>>;
  resetter: () => Promise<void>;
}

export const EditClub: React.FC<EditClubProps> = ({ clubId, clubObj, setClub, resetter }) => {
  const { localVillagerUser } = useAppContext();
  const [addPassword, setAddPassword] = useState(false);
  const [editedClub, updateEditedClub] = useState<ChessClubEdit>({
    id: 0,
    name: "",
    address: "",
    city: "",
    state: "",
    zipcode: 0,
    details: "",
    // oldPassword: "",
    newPassword: null,
    has_password: false,
    date: "",
    guest_members: [],
    members: [],
    manager: {
      id: 0,
      // username: "",
      full_name: ""
    }
  });
  const initPassword = useRef<HTMLInputElement>(null);
  const confirmPassword = useRef<HTMLInputElement>(null);
  useEffect(
    () => {
      const editingClubObj: ChessClubEdit = {
        ...clubObj, // Spread the properties of clubObj
        newPassword: "", // Explicitly set confirmPassword
      };
      updateEditedClub(editingClubObj)
    }, [clubObj]
  )
  const handleUpdate = () => {
    let passwordValue = "";
    if (clubObj.has_password === true && initPassword.current) {
      passwordValue = initPassword.current.value;
    }
    updateClub(clubId, editedClub, passwordValue)
      .then(res => {
        if (res) {
          if (res.status === 400 || res.status === 500) {
            if (errorModal) errorModal.style.display = 'flex';
          }
          setClub(0);
          resetter();
        }
        showAlertModal(res.message);
      })
  }

  const handleDelete = (password="") => {
    if (window.confirm('Are you sure you want to delete your club?'))
        if (window.confirm('SERIOUSLY. YOU ARE SURE? THIS CANNOT BE UNDONE. YOUR CLUB WILL BE GONE FOREVER'))
          deleteChessClub(editedClub.id, password)
          .then(data => {
            showAlertModal(data.message)
            resetter();
            setClub(0)
          });
  }

  const errorModal = document.getElementById("errorModal");

  return <>
    <article id="editClubContainer">
      <div id="errorModal">
        <h4>
          Incorrect password or missing club name
        </h4>
        <button className="buttonStyleReject" onClick={() => { if (errorModal) errorModal.style.display = 'none' }}>dismiss</button>
      </div>
      <div id="editClubHeader">
        <div className="setCustomFont">
          {clubObj?.name}
        </div>
        <div id="editClubBtnBlock">
          <button className="buttonStyleReject" onClick={() => {
            if (localVillagerUser.userId === editedClub.manager.id) {
              if (initPassword.current) {
                handleDelete(initPassword.current.value)
              } else {
                handleDelete()
              }
            }
          }}>Delete</button>
          <button className="buttonStyleApprove" onClick={() => {
            if (editedClub.name) {
              handleUpdate()

            }
          }}>submit</button>
          <button className="buttonStyleReject" onClick={() => setClub(0)}>cancel</button>
        </div>
      </div>
      <section id="clubForm">
        <div className="formInput">
          <label className="setCustomFont ClubFormLabel">Club Name</label>
          <input id="name" type="text" placeholder="club name" value={editedClub?.name ?? ''} onChange={(evt) => handleFormChange({ stateObject: editedClub, evt: evt, handler: updateEditedClub })} />
        </div>
        <div className="formInput">
          <label className="setCustomFont ClubFormLabel">Address</label>
          <input id="address" type="text" placeholder="street address (optional)" value={editedClub?.address ?? ''} onChange={(evt) => handleFormChange({ stateObject: editedClub, evt: evt, handler: updateEditedClub })} />
        </div>
        <div className="formInput">
          <label className="setCustomFont ClubFormLabel">City</label>
          <input id="city" type="text" placeholder="city (optional)" value={editedClub?.city ?? ''} onChange={(evt) => handleFormChange({ stateObject: editedClub, evt: evt, handler: updateEditedClub })} />
        </div>
        <div className="formInput">
          <label className="setCustomFont ClubFormLabel">State (Abbreviation)</label>
          <input id="state" type="text" placeholder="abbreviation (optional)" value={editedClub?.state ?? ''} onChange={(evt) => handleFormChange({ stateObject: editedClub, evt: evt, handler: updateEditedClub })} />
        </div>
        <div className="formInput">
          <label className="setCustomFont ClubFormLabel">ZipCode</label>
          <input id="zipcode" type="number" placeholder="zipcode (optional)" value={editedClub?.zipcode ?? ''} onChange={(evt) => handleFormChange({ stateObject: editedClub, evt: evt, handler: updateEditedClub })} />
        </div>
        <div className="formInput">
          <label className="setCustomFont ClubFormLabel">Details</label>
          <textarea id="details" placeholder="Where do you meet? What time? etc (optional)" value={editedClub?.details ?? ''} onChange={(evt) => handleFormChange({ stateObject: editedClub, evt: evt, handler: updateEditedClub })}></textarea>
        </div>
        {clubObj?.has_password || addPassword ?
          <div className="formInput">
            <label className="setCustomFont newClubFormLabel" >{addPassword ? 'New password' : 'Password Required for changes'}</label>
            <input id="oldPassword" ref={initPassword} type="text" placeholder="password" onChange={(evt) => handleFormChange({ stateObject: editedClub, evt: evt, handler: updateEditedClub })} />
          </div>
          : ""}
        {clubObj?.has_password || addPassword ?
          <div className="formInput">
            <label className="setCustomFont newClubFormLabel" >{addPassword ? 'Confirm New Password' : 'New password'}</label>
            <input id="newPassword" ref={confirmPassword} type="text" placeholder=" set new password" onChange={(evt) => handleFormChange({ stateObject: editedClub, evt: evt, handler: updateEditedClub })} />
          </div>
          : <button className="buttonStyleApprove" onClick={() => setAddPassword(true)}>Add Password</button>}
        {clubObj?.has_password ?
          <button className="buttonStyleReject m-t-1" onClick={() => {
            if (initPassword.current) {
              removeClubPassword(clubObj.id, initPassword.current.value)
                .then((data) => {
                  showAlertModal(data.message)
                  resetter();
                })
            }
          }}>Remove password</button>
          : null}
      </section>
    </article>
  </>
}