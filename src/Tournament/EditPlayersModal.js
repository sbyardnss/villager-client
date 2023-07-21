import { useContext, useEffect, useState } from "react"
import { TournamentContext } from "./TournamentProvider"
import "./Tournament.css"
import { createNewGuest, getChessClub } from "../ServerManager"
import { RoundRobin, Swiss } from "tournament-pairings"


export const EditPlayersModal = ({ activeTournamentObj, setEdit, playedRounds }) => {
    const { localVillagerObj, players, guests, playersAndGuests, setPlayersAndGuests, selectedClubObj, selectedClub, resetGuests } = useContext(TournamentContext)
    const [potentialCompetitors, setPotentialCompetitors] = useState([])
    const [search, setSearch] = useState("")
    const [showGuests, setShowGuests] = useState(false)
    const [clubPlayers, setClubPlayers] = useState([])
    const [clubGuests, setClubGuests] = useState([])
    const [initialPlayersAndGuests, setInitialPlayersAndGuests] = useState([])
    const [newGuest, updateNewGuest] = useState({
        full_name: "",
        club: 0
    })
    const [tournamentClub, setTournamentClub] = useState({})
    const [tournamentObj, updatedTournamentObj] = useState({
        title: "",
        creator: localVillagerObj.userId,
        competitors: [],
        guest_competitors: [],
        timeSetting: 0,
        rounds: 1,
        in_person: true,
        pairings: [],
        club: 0
    })
    useEffect(
        () => {
            const tourneyCopy = { ...activeTournamentObj }
            updatedTournamentObj(tourneyCopy)
            const initPlayers = [...activeTournamentObj.competitors]
            const initGuests = [...activeTournamentObj.guest_competitors]
            setInitialPlayersAndGuests(initPlayers.concat(initGuests))
        }, [activeTournamentObj]
    )
    useEffect(
        () => {
            if (tournamentObj.club) {
                const clubId = tournamentObj.club.id
                getChessClub(clubId)
                    .then(data => setTournamentClub(data))
            }
        }, [tournamentObj]
    )
    useEffect(
        () => {
            if (tournamentClub) {
                const clubsPlayers = players?.filter(p => tournamentClub.members?.find(m => m.id === p.id))
                setClubPlayers(clubsPlayers)
                const clubsGuests = guests?.filter(g => tournamentClub.guest_members?.find(gm => gm.id === g.id))
                setClubGuests(clubsGuests)
                const allPlayersAndGuests = clubsPlayers.concat(clubsGuests)
                setPlayersAndGuests(allPlayersAndGuests)
            }
        }, [players, guests, tournamentClub]//adding selectedClub to this dependency array causes players to entirely disappear
    )

    useEffect(
        () => {
            if (search !== "") {
                const filteredUsers = playersAndGuests.filter(pc => {
                    return pc.full_name.toLowerCase().includes(search.toLowerCase()) && !tournamentObj.competitors?.find(member => member.id === pc.id) && !tournamentObj.guest_competitors?.find(member => member.id === pc.id)
                })
                setPotentialCompetitors(filteredUsers)
            }
            else {
                const unselectedPlayers = [...clubPlayers]?.filter(p => !tournamentObj.competitors.find(c => c.id === p.id))
                let unselectedGuests = []
                if (showGuests) {
                    unselectedGuests = [...clubGuests]?.filter(g => !tournamentObj.guest_competitors.find(gc => gc.id === g.id))
                }
                setPotentialCompetitors(unselectedPlayers.concat(unselectedGuests))
            }
        }, [search, showGuests, playersAndGuests, players, guests, clubGuests, clubPlayers]
    )
    // console.log(tournamentObj.pairings)
    const outputMatchups = []
    const createNewPairings = () => {
        //get old pairings
        const oldPairings = tournamentObj.pairings.filter(p => {
            if (p.round <= playedRounds) {
                return p
            }
        })
        // const oldPairingsSimplified = oldPairings.map(op => {
        //     return [op.player1, op.player2]
        // })
        //create full player arr for new player list
        const registeredPlayerIdArr = tournamentObj.competitors.map(c => { return c.id })
        const guestPlayerIdArr = tournamentObj.guest_competitors.map(gc => { return gc.guest_id })
        const allPlayers = registeredPlayerIdArr.concat(guestPlayerIdArr)
        //create new pairings
        const newPairings = RoundRobin(registeredPlayerIdArr.concat(guestPlayerIdArr))
        //this line removes duplicates from new pairings
        const removeDupPairings = newPairings.filter(np => {
            const pair = [np.player1, np.player2]
            return !oldPairings.find(op => op?.player1 === pair[0] && op.player2 === pair[1]) && !oldPairings.find(op => op?.player1 === pair[1] && op.player2 === pair[0])
        })
        const gamesPerRound = allPlayers.length % 2 === 0 ? allPlayers.length / 2 : (allPlayers.length + 1) / 2
        let numberOfPotentialCartesianMatchups = removeDupPairings.length
        let playerReference = [...allPlayers]
        
        const playerOpponentsReferenceObj = {}
        for (const playerId of allPlayers) {
            playerOpponentsReferenceObj[playerId] = []
        }
        //reference max possibility of game matchups
        while (numberOfPotentialCartesianMatchups > gamesPerRound){
            let count = 0
            //matchup arr for round matchups
            const roundMatchups = []
            //random number generator for length
            const randomNumberFromArrLength = () => {
                return Math.floor(Math.random()*playerReference.length)
            }
            //create random pairing
            const createRandomMatchup = () => {
                //splicing players from player reference arr
                const targetPlayer1Id = playerReference.splice(randomNumberFromArrLength(),1)[0]
                const targetPlayer2Id = playerReference.splice(randomNumberFromArrLength(),1)[0]
                return [targetPlayer1Id, targetPlayer2Id]
            }
            const runCreateMatchUpsAndAddToRoundArr = () => {
                const newMatchup = createRandomMatchup()
                const matchupPlayer1 = newMatchup[0]
                const matchupPlayer2 = newMatchup[1]
                if (oldPairings.find(op => (op.player1 === matchupPlayer1 && op.player2 === matchupPlayer2) ||(op.player1 === matchupPlayer2 && op.player2 === matchupPlayer1))){
                    if (count < 11) {
                        count++
                        return runCreateMatchUpsAndAddToRoundArr()
                    }
                }
                else {
                    roundMatchups.concat(newMatchup)
                    //check for one player left and add to round matchups if so
                    if (playerReference.length === 1) {
                        const byePlayerId = playerReference.splice(0,1)[0]
                        roundMatchups.concat([byePlayerId, null])
                        outputMatchups.concat(roundMatchups)
                        console.log(outputMatchups)
                        if (numberOfPotentialCartesianMatchups > gamesPerRound && count < 11){
                            playerReference = [...allPlayers]
                            count++
                            runCreateMatchUpsAndAddToRoundArr()
                        }
                    }
                    //remove number of matchups created via games per round on each iteration and reset playersReference
                    if(playerReference.length === 0){
                        outputMatchups.concat(roundMatchups)
                        if (numberOfPotentialCartesianMatchups > gamesPerRound  && count < 11){
                            playerReference = [...allPlayers]
                            count++
                            runCreateMatchUpsAndAddToRoundArr()
                        }
                    }
                    numberOfPotentialCartesianMatchups=numberOfPotentialCartesianMatchups-gamesPerRound
                }
            }
            if (playerReference.length >=2 && count < 11){
                runCreateMatchUpsAndAddToRoundArr()
            }
            console.log(outputMatchups)
        }
        const newPairingsSansDuplicatesSimplified = removeDupPairings.map(rdp => {
            if (rdp.player1 === null) {
                return [rdp.player2, rdp.player1]
            }
            return [rdp.player1, rdp.player2]
        })
        //ripped code from online. FIGURE OUT WHY THIS WORKS
        // const gamesPerRound = allPlayers.length % 2 === 0 ? allPlayers.length / 2 : (allPlayers.length + 1) / 2
        //CARTESIAN ATTEMPT CODE FOR INITIAL MATCHUPS
        // const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
        // const cartesian = (a, b, ...c) => (b ? cartesian(f(a, b), ...c) : a);
        // const cartesianMatchups = cartesian(newPairingsSansDuplicatesSimplified)
        // const orderedMatchupOutput = []
        // let cartesianReference = [...cartesianMatchups]
        // console.log(cartesianReference)
        
   


        //code from her to below for recreating matchup object format
        //DONT TOUCH FROM HER TO END OF FUNCTION YET
        const nextRound = oldPairings[oldPairings.length - 1]?.round + 1 //add to round numbers on new objects after creation
        // let gamesPerRound = 0
        // if (allPlayers.length %2 === 0) {
        //     gamesPerRound = allPlayers.length /2
        // }
        // else {
        //     gamesPerRound =( allPlayers.length +1) / 2
        // }
        // // console.log(gamesPerRound)
        // let gamesPerRoundStart = 1
        // let assignedRound = nextRound
        // const outputPairings = []
        // // 
        // for (let i=0; i< newPairingsSansDuplicatesSimplified.length; i++){
        //     // format for output matchups {round: 1, match: 1, player1: 1, player2: 2}
        //     //these five lines below plus the gamesPerRoundStart ++ at end makes a loop of rounds and matches per round. 
        //     // console.log added for reference
        //     if (gamesPerRoundStart === gamesPerRound + 1) {
        //         gamesPerRoundStart = 1
        //         assignedRound ++
        //     }
        //     // console.log(`round ${assignedRound} -- match ${gamesPerRoundStart}`)

        //     //building new output objects and pushing into finalOutput array
        //     const newOutputPairing = {round: assignedRound, match: gamesPerRoundStart, player1: newPairingsSansDuplicatesSimplified[i][0], player2: newPairingsSansDuplicatesSimplified[i][1]}
        //     outputPairings.push(newOutputPairing)

        //     gamesPerRoundStart ++
        // }
        // console.log(oldPairings)
        // console.log(newPairings)
    }
    console.log(outputMatchups)
    // createNewPairings()
    return (
        <article id="editPlayersContainer">
            <div id="editPlayersHeader">
                <h3>Edit Players</h3>
                <button className="buttonStyleReject" onClick={() => {
                    setEdit(false)
                    updatedTournamentObj(activeTournamentObj)
                }}>cancel</button>
            </div>
            <div id="tournamentPlayerSelectionSection">
                <div id="competitorSelectionSplit">
                    <div id="potentialLabel" className="setColor setCustomFont">Potential:</div>
                    <div id="tournamentPotentialCompetitorSelection">
                        {
                            potentialCompetitors?.map((p, index) => {
                                return (
                                    <li key={p.guest_id ? p.guest_id + '-- potentialCompetitor' : p.id + '-- potentialCompetitor'}
                                        className="newTournamentPlayerListItem"
                                        onClick={() => {
                                            const copy = [...potentialCompetitors]
                                            copy.splice(index, 1)
                                            setPotentialCompetitors(copy)
                                            const tournamentCopy = { ...tournamentObj }
                                            if (p.guest_id) {
                                                tournamentCopy.guest_competitors.push(p)
                                            }
                                            else {
                                                tournamentCopy.competitors.push(p)
                                            }
                                            updatedTournamentObj(tournamentCopy)
                                            setSearch("")
                                        }}>
                                        {p?.full_name}
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
                            tournamentObj.competitors?.map((competitor, index) => {
                                const player = playersAndGuests.find(p => p.id === competitor.id)
                                return (
                                    <li key={competitor.id + '-- competitor'}
                                        className="newTournamentPlayerListItem"
                                        onClick={() => {
                                            const tournamentCopy = { ...tournamentObj }
                                            tournamentCopy.competitors.splice(index, 1)
                                            updatedTournamentObj(tournamentCopy)
                                            const copy = [...potentialCompetitors]
                                            copy.push(competitor)
                                            setPotentialCompetitors(copy)

                                        }}>
                                        {player?.full_name}
                                    </li>
                                )
                            })
                        }
                        {
                            tournamentObj.guest_competitors?.map((competitor, index) => {
                                const player = playersAndGuests.find(p => p.guest_id === competitor.guest_id)
                                return (
                                    <li key={competitor.guest_id + '-- competitor'}
                                        className="newTournamentPlayerListItem"
                                        onClick={() => {
                                            const tournamentCopy = { ...tournamentObj }
                                            tournamentCopy.guest_competitors.splice(index, 1)
                                            updatedTournamentObj(tournamentCopy)
                                            const copy = [...potentialCompetitors]
                                            copy.push(competitor)
                                            setPotentialCompetitors(copy)
                                        }}>
                                        {player?.full_name}
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
                        }
                    }}
                >Create Guest</button>
            </div>
            <div id="editPlayersToggleAndSubmitBtnBlock">
                <button className="buttonStyleApprove" onClick={() => setShowGuests(!showGuests)}>toggle guests</button>
                <button id="submitNewPlayersBtn" className="buttonStyleApprove">Submit</button>
            </div>
        </article>
    )
}