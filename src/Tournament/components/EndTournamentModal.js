import { useContext } from "react"
import { endTournament } from "../../ServerManager"
import { TournamentContext } from "./TournamentProvider"

export const EndTournamentModal = ({ setShowEndTournament, setShowResults}) => {
    const { resetTournaments, selectedTournament, setSelectedTournament } = useContext(TournamentContext)

    return (
        <div id="endTournamentModal" className="setCustomFont">
            End Tournament?
            <div id="endTournamentBtnBlock">
                <button
                    className="buttonStyleApprove"
                    onClick={() => {
                        endTournament(selectedTournament)
                            .then(() => {
                                resetTournaments()
                                setSelectedTournament(0)
                            })
                    }
                    }>confirm</button>
                <button
                    className="buttonStyleReject"
                    onClick={() => {
                        setShowResults(true)
                        setShowEndTournament(false)
                    }}>cancel</button>
            </div>
        </div>
    )
}