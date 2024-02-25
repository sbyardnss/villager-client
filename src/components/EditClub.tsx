import { ChangeEvent, useEffect, useRef, useState } from "react"
import { updateClub } from "../ServerManager"
import type { ChessClub } from "../modules/App/types";

interface EditClubProps {
  clubId: number; // Assuming clubId is a number
  clubObj: ChessClub; // Assuming clubObj is of type ChessClub
  setClub: React.Dispatch<React.SetStateAction<number>>; // Assuming setClub is a state setter function for ChessClub
}

export const EditClub: React.FC<EditClubProps> = ({ clubId, clubObj, setClub }) => {
  const [editedClub, updateEditedClub] = useState<Partial<ChessClub>>({
    name: "",
    address: "",
    city: "",
    state: "",
    zipcode: 0,
    details: "",
    oldPassword: "",
    newPassword: ""
  })
  useEffect(
    () => {
      updateEditedClub(clubObj)
    }, [clubObj]
  )
  const handleFormChange = (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const copy = { ...editedClub }
    if (evt.target.id === 'zipcode') {
      copy[evt.target.id] = parseInt(evt.target.value)
    }
    else {
      copy[evt.target.id] = evt.target.value
    }
    updateEditedClub(copy)
  }
  const errorModal = document.getElementById("errorModal")
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
          <button className="buttonStyleApprove" onClick={() => {
            if (editedClub.name) {
              updateClub(clubId, editedClub)
                .then(res => {
                  if (res) {
                    if (res.status === 400 || res.status === 500) {
                      // return (
                      //     <div id="errorModal">Incorrect password or missing club name</div>
                      // )
                      if (errorModal) errorModal.style.display = 'flex'
                    }
                  }
                })

            }
          }}>submit</button>
          <button className="buttonStyleReject" onClick={() => setClub(0)}>cancel</button>
        </div>
      </div>
      <section id="clubForm">
        <div className="formInput">
          <label className="setCustomFont ClubFormLabel">Club Name</label>
          <input id="name" type="text" placeholder="club name" value={editedClub?.name ?? ''} onChange={(evt) => handleFormChange(evt)} />
        </div>
        <div className="formInput">
          <label className="setCustomFont ClubFormLabel">Address</label>
          <input id="address" type="text" placeholder="street address (optional)" value={editedClub?.address ?? ''} onChange={(evt) => handleFormChange(evt)} />
        </div>
        <div className="formInput">
          <label className="setCustomFont ClubFormLabel">City</label>
          <input id="city" type="text" placeholder="city (optional)" value={editedClub?.city ?? ''} onChange={(evt) => handleFormChange(evt)} />
        </div>
        <div className="formInput">
          <label className="setCustomFont ClubFormLabel">State (Abbreviation)</label>
          <input id="state" type="text" placeholder="abbreviation (optional)" value={editedClub?.state ?? ''} onChange={(evt) => handleFormChange(evt)} />
        </div>
        <div className="formInput">
          <label className="setCustomFont ClubFormLabel">ZipCode</label>
          <input id="zipcode" type="number" placeholder="zipcode (optional)" value={editedClub?.zipcode ?? ''} onChange={(evt) => handleFormChange(evt)} />
        </div>
        <div className="formInput">
          <label className="setCustomFont ClubFormLabel">Details</label>
          <textarea id="details" placeholder="Where do you meet? What time? etc (optional)" value={editedClub?.details ?? ''} onChange={(evt) => handleFormChange(evt)}></textarea>
        </div>
        <div className="formInput">
          <label className="setCustomFont newClubFormLabel" >Old password</label>
          <input id="oldPassword" type="text" placeholder="old password" onChange={(evt) => handleFormChange(evt)} />
        </div>
        <div className="formInput">
          <label className="setCustomFont newClubFormLabel" >New password</label>
          <input id="newPassword" type="text" placeholder=" set new password" onChange={(evt) => handleFormChange(evt)} />
        </div>

      </section>
    </article>
  </>
}