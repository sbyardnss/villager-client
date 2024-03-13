import { isPlayerOrGuest } from "../../../utils/is-player-or-guest";
import { getPlayerType } from "../../../utils/player-guest-typing";
import { useEffect, useState } from "react";
import { createNewGuest } from "../../../ServerManager";
import type { PlayerRelated } from "../../../Types/Player";
import type { Guest } from "../../../Types/Guest";
import type { NewTournament, Tournament } from "../../../Types/Tournament";
import { type ChessClub, chessClubDefaults } from "../../../Types/ChessClub";
import { findIdentifier } from "../actions/find-identifier";

interface PlayerSelectionProps {
  editOrNew: 'new' | 'edit';
  players: PlayerRelated[];
  guests: Guest[];
  updatePlayersSelected: React.Dispatch<React.SetStateAction<boolean>>;
  tournamentObj: NewTournament;
  updateTournamentObj: React.Dispatch<React.SetStateAction<NewTournament | Tournament>>;
  selectedClub: ChessClub;
  resetGuests: () => void;
  selectClub?: React.Dispatch<React.SetStateAction<ChessClub>>;
  setCreate?: React.Dispatch<React.SetStateAction<boolean>>;
}
export const PlayerSelection: React.FC<PlayerSelectionProps> = ({
  editOrNew,
  players,
  guests,
  updatePlayersSelected,
  tournamentObj,
  updateTournamentObj,
  setCreate,
  selectClub,
  selectedClub,
  resetGuests,
}) => {
  const [showGuests, setShowGuests] = useState(false);
  const [search, setSearch] = useState("");
  const [availableCompetitors, setAvailableCompetitors] = useState<(PlayerRelated | Guest)[]>([]);
  const [displayedCompetitors, setDisplayedCompetitors] = useState<(PlayerRelated | Guest)[]>([]);
  const [newGuest, updateNewGuest] = useState({
    full_name: "",
    club: selectedClub.id,
  });

  useEffect(
    () => {
      if (players) {
        const filteredPlayers = players.filter(player => !tournamentObj.competitors.find(c => c.id === player.id));
        const filteredGuests = guests.filter(guest => !tournamentObj.guest_competitors.find(c => c.id === guest.id));
        if (showGuests)
          setAvailableCompetitors(filteredPlayers.concat(filteredGuests));
        else
          setAvailableCompetitors(filteredPlayers);
      }
    }, [players, guests, showGuests, tournamentObj, tournamentObj.competitors, tournamentObj.guest_competitors]
  )
  useEffect(
    () => {
      if (search !== "") {
        const searchedPlayers = availableCompetitors.filter(competitor => competitor.full_name.toLowerCase().includes(search.toLowerCase()));
        setDisplayedCompetitors(searchedPlayers);
      } else {
        setDisplayedCompetitors(availableCompetitors)
      }
    }, [availableCompetitors, search]
  )
  return (
    <section>
      <div className="controlSpread">
        <h3 className="setTournamentFontSize setColor">select players</h3>
        {editOrNew === 'new' ?
          <button className="buttonStyleReject" onClick={() => {
            if (setCreate) {
              setCreate(false)
            }
            if (selectClub) {
              selectClub(chessClubDefaults);
            }
            const newTournamentDefaults = {
              ...tournamentObj,
              competitors: [],
              guest_competitors: [],
            };
            updateTournamentObj(newTournamentDefaults);
          }}>cancel</button>
          : ""}
      </div>
      <div id="tournamentPlayerSelectionSection">
        <div id="competitorSelectionSplit">
          <div id="potentialLabel" className="setColor setCustomFont">Potential:</div>
          <div id="tournamentPotentialCompetitorSelection">
            {
              displayedCompetitors.map((p: (PlayerRelated | Guest), index) => {
                const playerType = getPlayerType(p);
                return (
                  <li key={!isPlayerOrGuest(p) ? (p as Guest).guest_id + '-- potentialCompetitor' : p.id + '-- potentialCompetitor'}
                    className="newTournamentPlayerListItem"
                    onClick={() => {
                      const tournamentCopy = { ...tournamentObj }
                      if (playerType === 'Guest') {
                        tournamentCopy.guest_competitors.push(p as Guest);
                      }
                      else {
                        tournamentCopy.competitors.push(p as PlayerRelated);
                      }
                      updateTournamentObj(tournamentCopy)
                      setSearch("");
                    }}>
                    {/* TODO: REMOVE FINDIDENTIFIER HERE */}
                    {p.full_name} {findIdentifier(p)}
                  </li>
                )
              })
            }
          </div>
        </div>
        <div id="competitorSelectionSplit">
          <div id="selectedLabel" className="setColor setCustomFont">Selected:</div>
          <div id="tournamentSelectedCompetitors">
            {
              tournamentObj.competitors.map((competitor, index) => {
                return (
                  <li key={competitor.id + '-- competitor'}
                    className="newTournamentPlayerListItem"
                    onClick={() => {
                      const tournamentCopy = { ...tournamentObj }
                      tournamentCopy.competitors.splice(index, 1)
                      updateTournamentObj(tournamentCopy)
                    }}>
                    {competitor?.full_name}  {findIdentifier(competitor)}
                  </li>
                )
              })
            }
            {
              tournamentObj.guest_competitors.map((competitor, index) => {
                return (
                  <li key={competitor.guest_id + '-- competitor'}
                    className="newTournamentPlayerListItem"
                    onClick={() => {
                      const tournamentCopy = { ...tournamentObj }
                      tournamentCopy.guest_competitors.splice(index, 1)
                      updateTournamentObj(tournamentCopy)
                    }}>
                    {competitor?.full_name}  {findIdentifier(competitor)}
                  </li>
                )
              })
            }

          </div>
        </div>
      </div>
      <div id="playerSearch" className="setCustomFont">
        <input
          id="playerSearchInput"
          className="text-input"
          type="text"
          placeholder="search for player or guest"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          id="resetPlayerSearchBtn"
          className="buttonStyleReject"
          onClick={() => setSearch("")}
        >reset</button>
      </div>
      <div id="createGuestDiv">
        <input
          className="text-input"
          id="newGuestInput"
          type="text"
          placeholder="new guest name"
          value={newGuest.full_name}
          onChange={(e) => {
            const copy = { ...newGuest }
            copy.full_name = e.target.value
            updateNewGuest(copy)
          }}
        />
        <button
          id="newGuestSubmitBtn"
          className="setCustomFont"
          onClick={() => {
            if (newGuest.full_name !== "" && selectedClub) {
              createNewGuest(newGuest)
                .then(() => resetGuests())
              updateNewGuest({ full_name: "", club: selectedClub.id })
            }
          }}
        >Create Guest</button>
      </div>
      <div className="controlSpread">

        <button className="buttonStyleApprove" onClick={() => setShowGuests(!showGuests)}>toggle guests</button>
        <button className="buttonStyleReject" onClick={() => {
          setShowGuests(false)
          updatePlayersSelected(true)
        }}>confirm</button>
      </div>
    </section>
  )
}