

export const TournamentTable = ({ activeTournamentRounds, currentRound, scoreObj, allPlayersArr, scoreCard, byePlayer}) => {

    console.log(byePlayer)
    //sorting table players by score    
    const sortAllPlayersArr = (playersArr) => {
        return playersArr.sort((a, b) => {
            const aIdentifier = a.guest_id ? a.guest_id : a.id
            const bIdentifier = b.guest_id ? b.guest_id : b.id
            return scoreObj[bIdentifier] - scoreObj[aIdentifier]
        })
    }
    //number population for table
    const roundPopulation = () => {
        let roundNumber = activeTournamentRounds;

        let tableHtml = [];
        while (roundNumber > 0) {
            if (roundNumber === currentRound) {
                tableHtml.push(<th key={roundNumber} className="currentRoundHeader">{roundNumber}</th>)

            }
            else {
                tableHtml.push(<th key={roundNumber} className="roundHeader">{roundNumber}</th>)
            }
            roundNumber--;
        }
        return tableHtml.reverse()
    }
    const roundHtml = roundPopulation()

    //currentRound
    //allPlayersArr
    //scoreCard
    // 
    return (
        <section id="tournamentTableContainer">
            <table id="tournamentTable">
                <thead>
                    <tr key={0} className="tableHeaderRow">
                        <th className="sticky-col first-col">player</th>
                        {
                            roundHtml.map(round => {
                                return round
                            })
                        }
                        {currentRound < 6 ? <th ></th> : ""}
                        <th>score</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        sortAllPlayersArr(allPlayersArr).map(p => {
                            let score = 0
                            const guestIdOrId = p.guest_id ? p.guest_id : p.id
                            const tourneyPlayerScores = scoreCard[guestIdOrId]
                            return (
                                <tr key={guestIdOrId} id={guestIdOrId + "--tourneyRow"} className="tablePlayerRow">
                                    <td key={p.full_name + '--row'} className="tablePlayerCell sticky-col first-col">{p.full_name}</td>
                                    {
                                        tourneyPlayerScores?.map((s, index) => {
                                            if (typeof s === 'number') {
                                                score += s
                                            }
                                            if (s === 'bye') {
                                                score += 1
                                                
                                            }
                                            if (s !== 'none') {
                                                return (
                                                    <td key={guestIdOrId + '--' + index + '--' + p.full_name} className="scoreCell">{s}</td>
                                                )
                                            }
                                            else if (s === 'none' && byePlayer === guestIdOrId && index + 1 === currentRound) {
                                                return (
                                                    <td key={guestIdOrId + '--' + index + '--' + p.full_name} className="scoreCell">bye</td>
                                                )
                                            }
                                            else {
                                                return (
                                                    <td key={guestIdOrId + '--' + index + '--' + p.full_name} className="scoreCell">0</td>
                                                )
                                            }
                                        })
                                    }
                                    {!tourneyPlayerScores ? <td key={guestIdOrId + '-- noGameYet' + '--' + p.full_name} className="scoreCell">0</td> : ""}
                                    {currentRound < 6 ? <td className="scoreCell"></td> : ""}
                                    <td key={guestIdOrId + "-- score" + p.full_name} id={guestIdOrId + "-- score"} className="totalScoreCell" value={scoreObj[guestIdOrId]}>
                                        {score}
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </section>
    )
}