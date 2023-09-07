


export const ResultsModal = ({ activeTournament, allPlayersArr, scoreObj, setShowResults, resultsForTieBreak, setShowEndTournament }) => {

    //creating solkoff tie break data
    const solkoffTieBreaker = (playerIdArr) => {
        const solkoffTieBreakerArr = []
        for (const playerId of playerIdArr) {
            let count = 0
            const playerMatchupResults = resultsForTieBreak.filter(result => {
                return result.white === playerId || result.black === playerId
            })
            for (const result of playerMatchupResults) {
                const opponentId = playerId === result.white ? result.black : result.white

                //THIS LINE BELOW WAS CAUSING A NaN ERROR WHERN REFERENCING OPPONENTSCORE
                //REMEMBER THIS
                // const opponentScore = document.getElementById(`${opponentId}-- score`).innerHTML 

                if (opponentId !== undefined && scoreObj[opponentId]) {
                    count += scoreObj[opponentId]
                }
            }
            solkoffTieBreakerArr.push([playerId, count])
        }
        return solkoffTieBreakerArr
    }
    //creating cumulative tie break data
    const cumulativeTieBreaker = (playerIdArr) => {
        const cumulativeArr = []
        for (const playerId of playerIdArr) {
            let count = 0
            const playerMatchupResults = resultsForTieBreak.filter(result => {
                return result.white === playerId || result.black === playerId
            })
            for (const result of playerMatchupResults) {
                const opponentId = result.white === playerId ? result.black : result.white
                // console.log(opponentId)
                // console.log(typeof playerId)
                result.winner === playerId && opponentId !== undefined ? count += (count + 1)
                    : result.win_style === 'draw' ? count += (count + .5)
                        : count = count + count
            }
            cumulativeArr.push([playerId, count])
        }
        return cumulativeArr
    }
    //compiling tie break data
    const tieBreakDisplay = (arrForTie) => {
        const solkoffResultsArr = solkoffTieBreaker(arrForTie).sort((a, b) => { return b[1] - a[1] })
        const cumulativeResultsArr = cumulativeTieBreaker(arrForTie).sort((a, b) => { return b[1] - a[1] })
        return (
            <div id="tieBreakResults">
                <div id="fullResults">
                    <div className="resultsHeader">solkoff</div>
                    <div id="solkoffResults">
                        {
                            solkoffResultsArr.map(playerResult => {
                                const player = typeof playerResult[0] === 'string' ? allPlayersArr.find(player => player.guest_id === playerResult[0])
                                    : allPlayersArr.find(player => player.id === playerResult[0])
                                return (
                                    <div key={playerResult[0] + '--' + playerResult[1]} className="resultsModalListItem">
                                        <div>{player?.full_name}: </div>
                                        <div>{playerResult[1]}</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div id="fullResults">
                    <div className="resultsHeader">cumulative</div>
                    <div id="cumulativeResults">
                        {
                            cumulativeResultsArr.map(playerResult => {
                                const player = typeof playerResult[0] === 'string' ? allPlayersArr.find(player => player.guest_id === playerResult[0])
                                    : allPlayersArr.find(player => player.id === playerResult[0])
                                return (
                                    <div key={playerResult[0] + '--' + playerResult[1]} className="resultsModalListItem">
                                        <div>{player?.full_name}: </div>
                                        <div>{playerResult[1]}</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>

        )
    }

    const resultArr = []
    const arrForTieBreakers = []
    allPlayersArr.map(player => {
        const playerIdentifier = player.guest_id ? player.guest_id : player.id
        if (player.guest_id) {
            resultArr.push([player.full_name, parseFloat(scoreObj[playerIdentifier]), player.guest_id])
            arrForTieBreakers.push(player.guest_id)
        }
        else {
            resultArr.push([player.full_name, parseFloat(scoreObj[playerIdentifier]), player.id])
            arrForTieBreakers.push(player.id)
        }
    })
    resultArr.sort((a, b) => { return b[1] - a[1] })

    return (
        <div id="resultsModal">
            Results
            <section id="fullResults" className="setCustomFont">
                <div id="standardResults" >
                    <div className="resultsHeader">standard</div>
                    {
                        resultArr.map(r => {
                            return (
                                <div key={r[0]} className="resultsModalListItem">
                                    <div>{r[0]}: </div>
                                    <div>{r[1].toString()}</div>
                                </div>
                            )
                        })
                    }
                </div>
                {tieBreakDisplay(arrForTieBreakers)}
            </section>
            <div id="modalBtns">
                {activeTournament?.complete === false ?
                    <button
                        className="buttonStyleApprove"
                        onClick={() => {
                            setShowEndTournament(true)
                            setShowResults(false)
                        }}>End Tournament</button>
                    : ""}
                <button
                    className="buttonStyleReject"
                    onClick={() => {
                        setShowResults(false)
                    }}>cancel</button>
            </div>
        </div>
    )

}