import { useRef } from "react";
import { addMemberToClub } from "../../ServerManager"
import type { ChessClub } from "../App/types";
// import { ChessClubEdit } from "./types/ChessClub";

interface JoinClubModalProps {
  clubToJoin: ChessClub;
  setJoinClub: React.Dispatch<React.SetStateAction<number>>;
  resetter: () => Promise<void>;
}
export const JoinClubModal: React.FC<JoinClubModalProps> = ({
  clubToJoin, 
  setJoinClub,
  resetter
}) => {
  const joinRequestPassword = useRef<HTMLInputElement>(null);
  const joinClubModal = document.getElementById('joinClubModal');

  return <>
    <section id="joinClubModal" className="setCustomFont">
      <h4>Enter password for {clubToJoin?.name}</h4>
      <div id="joinClubInputAndBtn">
        <input type="text" ref={joinRequestPassword} />
        <button className="buttonStyleReject" onClick={() => {
          if (joinRequestPassword.current)
            addMemberToClub(clubToJoin.id, { submittedPassword: joinRequestPassword.current.value })
              // .then(res => window.alert(res['message']))
              .then(res => {
                if (res.status === 400) {
                  return window.alert('incorrect password')
                }
                if (res.status === 201) {
                  // resetChessClubs()
                  resetter()
                  setJoinClub(0)
                  if (joinClubModal)
                    joinClubModal.style.display = 'none'
                }
              })
              .then(() => {
                if (joinRequestPassword.current)
                  joinRequestPassword.current.value = ""
              })
        }}>submit</button>
        <button className="buttonStyleReject" onClick={() => {
          setJoinClub(0)
          if (joinClubModal)
            joinClubModal.style.display = 'none'
          if (joinRequestPassword.current)
            joinRequestPassword.current.value = ""
        }}>cancel</button>
      </div>

    </section>
  </>
}