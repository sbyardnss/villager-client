import { useNavigate } from "react-router-dom"
import "../ChessClubs/ChessClubs.css"
import { useEffect, useRef, useState } from "react"
import { createNewClub, getMyChessClubs } from "../ServerManager"
import { EditClub } from "./EditClub"

export const ChessClubs = () => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    const navigate = useNavigate()
    const [myChessClubs, setMyChessClubs] = useState([])
    const [selectedClubToEdit, setSelectedClubToEdit] = useState(0)
    const [selectedClubObj, setSelectedClubObj] = useState({})
    const [createClub, setCreateClub] = useState(false)
    const [newClub, updateNewClub] = useState({
        name: "",
        address: "",
        city: "",
        state: "",
        zipcode: 0,
        details: ""
    })
    const editingModal = document.getElementById("editClubModal")

    useEffect(
        () => {
            getMyChessClubs()
                .then(data => setMyChessClubs(data))
        }, []
    )
    useEffect(
        () => {
            if (selectedClubToEdit) {
                editingModal.style.display = "block"
            }
            //not working
            // else {
            //     editingModal?.style?.display = "none"
            // }
        }, [selectedClubToEdit]
    )
    useEffect(
        () => {
            const selectedClub = myChessClubs.find(club => club.id === selectedClubToEdit)
            setSelectedClubObj(selectedClub)
        }, [selectedClubToEdit]
    )
    const handleFormChange = (evt) => {
        const copy = { ...newClub }
        if (evt.target.id === 'zipcode') {
            copy[evt.target.id] = parseInt(evt.target.value)
        }
        else {
            copy[evt.target.id] = evt.target.value
        }
        updateNewClub(copy)
    }
    const initPassword = useRef()
    const confirmPassword = useRef()

    const createClubForm = () => {
        if (createClub) {
            const setPasswordModal = document.getElementById("newClubPasswordSetModal")
            return (
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
                                if (initPassword.current.value === confirmPassword.current.value) {
                                    const copy = { ...newClub }
                                    if (confirmPassword.current.value === "" && initPassword.current.value === "") {
                                        copy.password = null
                                    }
                                    else {
                                        copy.password = confirmPassword.current.value
                                    }
                                    copy.address === "" ? copy.address = null : copy.address = copy.address
                                    copy.state === "" ? copy.state = null : copy.state = copy.state
                                    copy.zipcode === "" ? copy.zipcode = null : copy.zipcode = copy.zipcode
                                    copy.details === "" ? copy.details = null : copy.details = copy.details
                                    copy.city === "" ? copy.city = null : copy.city = copy.city
                                    // console.log(copy)
                                    createNewClub(copy)
                                }
                            }}>create new club</button>
                            <button className="buttonStyleReject" onClick={() => {
                                setPasswordModal.style.display = 'none'
                            }}>cancel</button>
                        </div>
                    </div>
                    <div className="formInput">
                        <label className="setCustomFont newClubFormLabel">Club Name</label>
                        <input id="name" type="text" placeholder="new club name" onChange={(evt) => handleFormChange(evt)} />
                    </div>
                    <div className="formInput">
                        <label className="setCustomFont newClubFormLabel">Address</label>
                        <input id="address" type="text" placeholder="street address (optional)" onChange={(evt) => handleFormChange(evt)} />
                    </div>
                    <div className="formInput">
                        <label className="setCustomFont newClubFormLabel">City</label>
                        <input id="city" type="text" placeholder="city (optional)" onChange={(evt) => handleFormChange(evt)} />
                    </div>
                    <div className="formInput">
                        <label className="setCustomFont newClubFormLabel">State</label>
                        <input id="state" type="text" placeholder="abbreviation (optional)" onChange={(evt) => handleFormChange(evt)} />
                    </div>
                    <div className="formInput">
                        <label className="setCustomFont newClubFormLabel">ZipCode</label>
                        <input id="zipcode" type="number" placeholder="zipcode (optional)" onChange={(evt) => handleFormChange(evt)} />
                    </div>
                    <div className="formInput">
                        <label className="setCustomFont newClubFormLabel">Details</label>
                        <textarea id="details" type="text" placeholder="Where do you meet? What time? etc (optional)" onChange={(evt) => handleFormChange(evt)}></textarea>
                    </div>
                    <div id="newClubButtonBlock">
                        <button className="buttonStyleApprove" onClick={() => {
                            if (newClub.name) {
                                setPasswordModal.style.display = 'flex'
                            }
                        }}>create new club</button>
                        <button className="buttonStyleReject" onClick={() => setCreateClub(false)}>cancel</button>
                    </div>
                </section>
            )
        }
        else {
            return (
                <button id="createChessClubButton" className="setCustomFont" onClick={() => setCreateClub(true)}>Create Club</button>
            )
        }
    }
    const editClubForm = () => {
        if (selectedClubToEdit) {
            return (
                <EditClub clubId={selectedClubToEdit} clubObj={selectedClubObj} setClub={setSelectedClubToEdit} />
            )
        }
        else {
            return 
        }
    }
    return <>
        <main id="chessClubsContainer">
            <article id="myChessClubsArticle">
                <section id="editClubModal">
                    {editClubForm()}
                </section>
                <ul id="myClubsList">
                    {
                        myChessClubs.map(club => {
                            if (club.manager.id === localVillagerObj.userId) {
                                return (
                                    <div key={club.id} className="managedClubsListItem setCustomFont">
                                        <li>{club.name}</li>
                                        <button className="buttonStyleReject" onClick={() => setSelectedClubToEdit(club.id)}>edit</button>
                                    </div>
                                )
                            }
                            else if (club.members.find(m => m.id === localVillagerObj.userId) && club.manager.id !== localVillagerObj.userId) {
                                return (
                                    <div key={club.id} className="managedClubsListItem setCustomFont">
                                        <li>{club.name}</li>
                                        <button className="buttonStyleApprove">join</button>
                                    </div>
                                )
                            }
                            return (
                                <div key={club.id} className="unmanagedClubListItem setCustomFont">
                                    <li>{club.name}</li>
                                </div>
                            )
                        })
                    }
                </ul>
                {createClubForm()}
            </article>
        </main>
    </>
}