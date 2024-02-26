import React, { useContext, useState } from "react";
import { Swiss } from "tournament-pairings";
import type { ChessClub } from "../../App/types";
import type { PlayerOnTournament, Guest, NewTournament, Tournament} from "../Types";
interface TournamentFormProps {
  clubs: ChessClub[];
  selectedClub: number;
  selectClub: React.Dispatch<React.SetStateAction<number>>;
  playersAndGuests: (PlayerOnTournament | Guest)[];
  resetTourneys: () => void;
  setCreateTournament: React.Dispatch<React.SetStateAction<boolean>>;
  updater: React.Dispatch<React.SetStateAction<NewTournament>>;

}

export const TournamentForm: React.FC<TournamentFormProps> = ({
  clubs,
  selectedClub,
  selectClub,
  playersAndGuests,
  resetTourneys,
  setCreateTournament,
}) => {
  const [showGuest, setShowGuests] = useState(false);
  if (!selectedClub) {
    return (
      <section id="newTournamentForm">

      </section>
    );
  }
  return <>
  
  </>
}