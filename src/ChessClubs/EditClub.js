import { useEffect, useRef, useState } from "react"
import { updateClub } from "../ServerManager"


export const EditClub = ({ clubId, clubObj, setClub }) => {
    const [editedClub, updateEditedClub] = useState({
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
    const handleFormChange = (evt) => {
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
                <button className="buttonStyleReject" onClick={() => {errorModal.style.display = 'none'}}>dismiss</button>
            </div>
            <div id="editClubHeader">
                <div className="setCustomFont">
                    {clubObj?.name}
                </div>
                <button className="buttonStyleReject" onClick={() => setClub(0)}>cancel</button>
            </div>
            <section id="clubForm">
                <div className="formInput">
                    <label className="setCustomFont ClubFormLabel">Club Name</label>
                    <input id="name" type="text" placeholder="club name" onChange={(evt) => handleFormChange(evt)} />
                </div>
                <div className="formInput">
                    <label className="setCustomFont ClubFormLabel">Address</label>
                    <input id="address" type="text" placeholder="street address (optional)" onChange={(evt) => handleFormChange(evt)} />
                </div>
                <div className="formInput">
                    <label className="setCustomFont ClubFormLabel">City</label>
                    <input id="city" type="text" placeholder="city (optional)" onChange={(evt) => handleFormChange(evt)} />
                </div>
                <div className="formInput">
                    <label className="setCustomFont ClubFormLabel">State</label>
                    <input id="state" type="text" placeholder="abbreviation (optional)" onChange={(evt) => handleFormChange(evt)} />
                </div>
                <div className="formInput">
                    <label className="setCustomFont ClubFormLabel">ZipCode</label>
                    <input id="zipcode" type="number" placeholder="zipcode (optional)" onChange={(evt) => handleFormChange(evt)} />
                </div>
                <div className="formInput">
                    <label className="setCustomFont ClubFormLabel">Details</label>
                    <textarea id="details" type="text" placeholder="Where do you meet? What time? etc (optional)" onChange={(evt) => handleFormChange(evt)}></textarea>
                </div>
                <div className="formInput">
                    <label className="setCustomFont newClubFormLabel" >Old password</label>
                    <input id="oldPassword" type="text" placeholder="old password" onChange={(evt) => handleFormChange(evt)} />
                </div>
                <div className="formInput">
                    <label className="setCustomFont newClubFormLabel" >New password</label>
                    <input id="newPassword" type="text" placeholder=" set new password" onChange={(evt) => handleFormChange(evt)} />
                </div>
                <div id="newClubButtonBlock">
                    <button className="buttonStyleApprove" onClick={() => {
                        if (editedClub.name) {
                            updateClub(clubId, editedClub)
                                .then(res => {
                                    if (res) {
                                        if (res.status === 400 || res.status === 500) {
                                            // return (
                                            //     <div id="errorModal">Incorrect password or missing club name</div>
                                            // )
                                            errorModal.style.display = 'flex'
                                        }
                                    }
                                })

                        }
                    }}>submit</button>
                    {/* <button className="buttonStyleReject" onClick={() => setCreateClub(false)}>cancel</button> */}
                </div>
            </section>
        </article>
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