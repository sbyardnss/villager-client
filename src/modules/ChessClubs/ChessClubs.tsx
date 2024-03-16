import "../../styles/ChessClubs.css";
import { useContext, useEffect, useState } from "react";
import { addMemberToClub, getClubsUserNotJoined, leaveClub } from "../../ServerManager"
import { EditClub } from "./components/EditClub";
import { AppContext } from "../App/AppProvider";
import { JoinClubModal } from "./components/JoinClubModal";
import { CreateClubForm } from "./components/CreateClub";

// import type { ChessClub } from "../App/types";
import type { ChessClubCreate, ChessClub } from "../../Types/ChessClub";
export const ChessClubs = () => {
  const { localVillagerUser, myChessClubs, resetChessClubs } = useContext(AppContext);
  const [unjoinedChessClubs, setUnjoinedClubs] = useState([]);
  const [selectedClubToEdit, setSelectedClubToEdit] = useState(0)
  const [selectedClubObj, setSelectedClubObj] = useState<ChessClub>({} as ChessClub)
  const [joinClub, setJoinClub] = useState(0);
  //TODO: see if this state variable is causing problems
  const [clubToJoin, setClubToJoin] = useState<ChessClub>({} as ChessClub);
  const [createClub, setCreateClub] = useState(false)
  const [newClub, updateNewClub] = useState<Partial<ChessClubCreate | ChessClub>>({
    name: "",
    address: "",
    city: "",
    state: "",
    zipcode: 0,
    details: "",
    // oldPassword: "",
    // newPassword: "",
    // has_password: false,
  })
  const editingModal = document.getElementById("editClubModal");
  //NEED MY CLUBS, OTHERS CLUBS, 
  //GETTING CLUBS USER HAS NOT JOINED
  useEffect(
    () => {
      getClubsUserNotJoined()
        .then(data => setUnjoinedClubs(data))
    }, [myChessClubs]
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



  const editClubForm = () => {
    if (selectedClubToEdit) {
      return (
        <EditClub
          clubId={selectedClubToEdit}
          clubObj={selectedClubObj}
          setClub={setSelectedClubToEdit} 
          resetter={resetChessClubs} />
      );
    }
    else {
      return;
    }
  }
  const createClubForm = () => {
    if (createClub) {
      return <CreateClubForm
                newClub={newClub}
                resetter={resetChessClubs}
                updateClub={updateNewClub}
                setter={setCreateClub} 
                />
    } else {
      return <button id="createChessClubButton" className="setCustomFont" onClick={() => setCreateClub(true)}>Create Club</button>
    }
  }
  const joinClubModal = document.getElementById('joinClubModal');
  return <>
    <main id="chessClubsContainer">
      <article id="myChessClubsArticle">
        <section id="editClubModal">
          {editClubForm()}
        </section>
        {<JoinClubModal 
          clubToJoin={clubToJoin}
          setJoinClub={setJoinClub}
          resetter={resetChessClubs} />}
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