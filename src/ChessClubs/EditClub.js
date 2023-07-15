import { useEffect, useRef } from "react"


export const EditClub = ({ clubId, clubObj, setClub }) => {
    return <>
        <section id="editClubContainer">
            <div className="setCustomFont">
                ello gov
            </div>
            <button className="buttonStyleReject" onClick={() => setClub(0)}>cancel</button>

        </section>
    </>
    // const setPasswordModal = document.getElementById("newClubPasswordSetModal")
    // const initPassword = useRef()
    // const confirmPassword = useRef()
    // return (
    //     <section id="newClubForm">
    //         <div id="newClubPasswordSetModal">
    //             <div className="formInput">
    //                 <label className="setCustomFont newClubFormLabel">Add password for joining?</label>
    //                 <input id="passwordInit" type="text" placeholder="password" ref={initPassword} />
    //             </div>
    //             <div className="formInput">
    //                 <label className="setCustomFont newClubFormLabel">Confirm password</label>
    //                 <input id="passwordConfirm" type="text" placeholder=" confirm password" ref={confirmPassword} />
    //             </div>
    //             <div id="newClubButtonBlock">
    //                 <button className="buttonStyleApprove" onClick={() => {
    //                     if (initPassword.current.value === confirmPassword.current.value) {
    //                         const copy = { ...newClub }
    //                         if (confirmPassword.current.value === "" && initPassword.current.value === "") {
    //                             copy.password = null
    //                         }
    //                         else {
    //                             copy.password = confirmPassword.current.value
    //                         }
    //                         copy.address === "" ? copy.address = null : copy.address = copy.address
    //                         copy.state === "" ? copy.state = null : copy.state = copy.state
    //                         copy.zipcode === "" ? copy.zipcode = null : copy.zipcode = copy.zipcode
    //                         copy.details === "" ? copy.details = null : copy.details = copy.details
    //                         copy.city === "" ? copy.city = null : copy.city = copy.city
    //                         // console.log(copy)
    //                         createNewClub(copy)
    //                     }
    //                 }}>create new club</button>
    //                 <button className="buttonStyleReject" onClick={() => {
    //                     setPasswordModal.style.display = 'none'
    //                 }}>cancel</button>
    //             </div>
    //         </div>
    //         <div className="formInput">
    //             <label className="setCustomFont newClubFormLabel">Club Name</label>
    //             <input id="name" type="text" placeholder="new club name" onChange={(evt) => handleFormChange(evt)} />
    //         </div>
    //         <div className="formInput">
    //             <label className="setCustomFont newClubFormLabel">Address</label>
    //             <input id="address" type="text" placeholder="street address (optional)" onChange={(evt) => handleFormChange(evt)} />
    //         </div>
    //         <div className="formInput">
    //             <label className="setCustomFont newClubFormLabel">City</label>
    //             <input id="city" type="text" placeholder="city (optional)" onChange={(evt) => handleFormChange(evt)} />
    //         </div>
    //         <div className="formInput">
    //             <label className="setCustomFont newClubFormLabel">State</label>
    //             <input id="state" type="text" placeholder="abbreviation (optional)" onChange={(evt) => handleFormChange(evt)} />
    //         </div>
    //         <div className="formInput">
    //             <label className="setCustomFont newClubFormLabel">ZipCode</label>
    //             <input id="zipcode" type="number" placeholder="zipcode (optional)" onChange={(evt) => handleFormChange(evt)} />
    //         </div>
    //         <div className="formInput">
    //             <label className="setCustomFont newClubFormLabel">Details</label>
    //             <textarea id="details" type="text" placeholder="Where do you meet? What time? etc (optional)" onChange={(evt) => handleFormChange(evt)}></textarea>
    //         </div>
    //         <div id="newClubButtonBlock">
    //             <button className="buttonStyleApprove" onClick={() => {
    //                 if (newClub.name) {
    //                     setPasswordModal.style.display = 'flex'
    //                 }
    //             }}>create new club</button>
    //             <button className="buttonStyleReject" onClick={() => setCreateClub(false)}>cancel</button>
    //         </div>
    //     </section>
    // )
}