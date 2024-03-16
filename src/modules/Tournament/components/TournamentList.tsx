import type { Tournament } from "../../../Types/Tournament";
import { useEffect, useState } from "react";

interface TournamentListProps {
  tournaments: Tournament[],
  currentOrPast: 'current' | 'past',
  selectTournament: React.Dispatch<React.SetStateAction<Tournament>>;
}
export const TournamentList: React.FC<TournamentListProps> = ({
  tournaments,
  currentOrPast,
  selectTournament,
}) => {
  const [listClass, setListClass] = useState('');

  useEffect(
    () => {
      if (currentOrPast === 'current') {
        setListClass('activeTournamentsList');
      } else {
        setListClass('pastTournamentList')
      }
    }, [currentOrPast]
  )
  return <>
    <section id={listClass} className="setCustomFont">
      {
        !tournaments.length ?
          <div>...loading</div>
          :
          tournaments?.map((t: Tournament) => {
            const dateFormat = new Date(t.date).toLocaleDateString('en-us');
            return (
              <li key={t.id}
                className="tournamentListItem"
                data-cy={`tournament--${t.id}`}
                value={t.id}
                onClick={() => {
                  selectTournament(t);
                }}>
                {t.title}
                {currentOrPast === 'current'
                  ?
                  <span style={{ fontSize: "small" }}>{dateFormat}</span>
                  :
                  <span style={{ fontSize: "small", marginLeft: "auto" }}>{dateFormat}</span>
                }

              </li>
            )
          })
      }
    </section>
  </>
}