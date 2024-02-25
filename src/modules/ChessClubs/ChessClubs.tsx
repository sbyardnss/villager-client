// import { useNavigate } from "react-router-dom";
// import "../styles/ChessClubs.css";
import "../../styles/ChessClubs.css";
import { useContext, useEffect, useRef, useState } from "react";
import { addMemberToClub, createNewClub, getAllChessClubs, getClubsUserNotJoined, leaveClub } from "../../ServerManager"
import { EditClub } from "./EditClub";
import { AppContext } from "../../Context/AppProvider";
import { JoinClubModal } from "./JoinClubModal";
import type { ChessClub, ChessClubCreate } from "../App/types";
import { handleFormChange } from "./actions/handle-form-change";

export const ChessClubs = () => {
  //need
  //my clubs
  //open clubs

  const { localVillagerUser, myChessClubs } = useContext(AppContext);
  const [unjoinedChessClubs, setUnjoinedClubs] = useState([]);
  // const navigate = useNavigate()
  // const [myChessClubs, setMyChessClubs] = useState([])
  // const [unjoinedChessClubs, setUnjoinedChessClubs] = useState([])
  const [selectedClubToEdit, setSelectedClubToEdit] = useState(0)
  const [selectedClubObj, setSelectedClubObj] = useState<ChessClub>({} as ChessClub)
  const [joinClub, setJoinClub] = useState(0);
  //TODO: see if this state variable is causing problems
  const [clubToJoin, setClubToJoin] = useState<ChessClub>({} as ChessClub);
  // const joinRequestPassword = useRef<HTMLInputElement>(null);
  const [createClub, setCreateClub] = useState(false)
  const [newClub, updateNewClub] = useState<Partial<ChessClubCreate>>({
    name: "",
    address: "",
    city: "",
    state: "",
    zipcode: 0,
    details: ""
  })
  const editingModal = document.getElementById("editClubModal");
  //NEED MY CLUBS, OTHERS CLUBS, 
  //GETTING CLUBS USER HAS NOT JOINED
  useEffect(
    () => {
      getClubsUserNotJoined()
        .then(data => setUnjoinedClubs(data))
    }, []
  )

  useEffect(
    () => {
      if (selectedClubToEdit && editingModal) {
        editingModal.style.display = "block"
      }
      //not working
      // else {
      //     editingModal?.style?.display = "none"
      // }
    }, [selectedClubToEdit, editingModal]
  )
  useEffect(
    () => {
      const selectedClub = myChessClubs.find((club: ChessClub) => club.id === selectedClubToEdit)
      setSelectedClubObj(selectedClub)
    }, [selectedClubToEdit, myChessClubs]
  )


  useEffect(
    () => {
      const selectedClubToJoin = unjoinedChessClubs.find((club: ChessClub) => club.id === joinClub)
      if (selectedClubToJoin)
        setClubToJoin(selectedClubToJoin)
    }, [joinClub, unjoinedChessClubs]
  )

  const initPassword = useRef<HTMLInputElement>(null);
  const confirmPassword = useRef<HTMLInputElement>(null);
  const resetChessClubs = (): Promise<void>  => {
    return getAllChessClubs()
      .then(data => setUnjoinedClubs(data))
  }
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
                    .then(() => resetChessClubs())

                  // setPasswordModal.style.display = 'none'
                  setCreateClub(false)

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
            <input id="name" type="text" placeholder="new club name" onChange={(evt) => handleFormChange({evt: evt, handler: updateNewClub, stateObject: newClub })} />
          </div>
          <div className="formInput">
            <label className="setCustomFont newClubFormLabel">Address</label>
            <input id="address" type="text" placeholder="street address (optional)" onChange={(evt) => handleFormChange({evt: evt, handler: updateNewClub, stateObject: newClub })} />
          </div>
          <div className="formInput">
            <label className="setCustomFont newClubFormLabel">City</label>
            <input id="city" type="text" placeholder="city (optional)" onChange={(evt) => handleFormChange({evt: evt, handler: updateNewClub, stateObject: newClub })} />
          </div>
          <div className="formInput">
            <label className="setCustomFont newClubFormLabel">State</label>
            <input id="state" type="text" placeholder="abbreviation (optional)" onChange={(evt) => handleFormChange({evt: evt, handler: updateNewClub, stateObject: newClub })} />
          </div>
          <div className="formInput">
            <label className="setCustomFont newClubFormLabel">ZipCode</label>
            <input id="zipcode" type="number" placeholder="zipcode (optional)" onChange={(evt) => handleFormChange({evt: evt, handler: updateNewClub, stateObject: newClub })} />
          </div>
          <div className="formInput">
            <label className="setCustomFont newClubFormLabel">Details</label>
            <textarea id="details" placeholder="Where do you meet? What time? etc (optional)" onChange={(evt) => handleFormChange({evt: evt, handler: updateNewClub, stateObject: newClub })}></textarea>
          </div>
          <div id="newClubButtonBlock">
            <button className="buttonStyleApprove" onClick={() => {
              if (newClub.name && setPasswordModal) {
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
      );
    }
  }
  const editClubForm = () => {
    if (selectedClubToEdit) {
      return (
        <EditClub
          clubId={selectedClubToEdit}
          clubObj={selectedClubObj}
          setClub={setSelectedClubToEdit} />
      );
    }
    else {
      return;
    }
  }
  const joinClubModal = document.getElementById('joinClubModal');
  return <>
    <main id="chessClubsContainer">
      <article id="myChessClubsArticle">
        <section id="editClubModal">
          {editClubForm()}
        </section>
        {JoinClubModal(clubToJoin, setJoinClub, resetChessClubs)}
        {createClubForm()}
        <section id="myClubsSection">
          <h4 className="setCustomFont">My Clubs</h4>
          <ul id="myClubsList">
            {!myChessClubs.length ? <div className="setCustomFont">you have not joined any clubs</div> : ""}
            {
              myChessClubs.map((club: ChessClub) => {
                if (club.manager.id === localVillagerUser.userId) {
                  return (
                    <div key={club.id} className="managedClubsListItem setCustomFont">
                      <li>{club.name}</li>
                      <button className="buttonStyleReject" onClick={() => setSelectedClubToEdit(club.id)}>edit</button>
                    </div>
                  )
                }
                else if (club.members.find(m => m.id === localVillagerUser.userId) && club.manager.id !== localVillagerUser.userId) {
                  return (
                    <div key={club.id} className="managedClubsListItem setCustomFont">
                      <li>{club.name}</li>
                      <button className="buttonStyleApprove" onClick={() => {
                        if (window.confirm(`leave ${club.name}?`)) {
                          leaveClub(club.id)
                            .then(() => resetChessClubs())
                        }
                      }}>leave</button>
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
        </section>
        <section id="joinableClubsSection">
          <h4 className="setCustomFont">Joinable Clubs</h4>
          <ul id="joinableClubList">
            {!unjoinedChessClubs.length ? <div className="setCustomFont">you have joined all the clubs</div> : ""}
            {
              unjoinedChessClubs.map((club: ChessClub) => {
                return (
                  <div key={club.id} className="joinableClubListItem setCustomFont">
                    <li>{club.name}</li>
                    <button className="buttonStyleApprove" onClick={() => {
                      if (club.has_password) {
                        setJoinClub(club.id)
                        if (joinClubModal)
                          joinClubModal.style.display = "flex"
                      }
                      else {
                        addMemberToClub(club.id)
                          .then(() => resetChessClubs())
                      }
                    }}>join</button>
                  </div>
                )
              })
            }
          </ul>
        </section>
      </article>
    </main>
  </>
}