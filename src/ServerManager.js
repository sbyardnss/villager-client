const getToken = () => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    return localVillagerObj
}
const apiKey = process.env.REACT_APP_API;
// const apiKey = "http://localhost:8000"

//LIST FETCHES
export const getAllPlayers = () => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/players`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}
export const getAllChessClubs = () => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/clubs`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}
export const getMyChessClubs = () => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/clubs/my_clubs`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}
export const getAllGames = () => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/games`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}
export const getAllTournaments = () => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/tournaments`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}
export const getAllMessages = () => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/messages`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}
export const getAllTimeSettings = () => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/timesettings`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}
export const getAllCommunityPosts = () => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/communityposts`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}
export const getMyGames = () => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/games/my_games`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}
export const getMyTournaments = () => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/tournaments/my_tournaments`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}
export const getMyOpenTournaments = () => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/tournaments/my_open_tournaments`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}
export const getMyPastTournaments = () => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/tournaments/my_past_tournaments`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}
export const getTournamentGames = (tournamentId) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/games/${tournamentId}/get_selected_tournament_games`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}
export const getAllGuestPlayers = () => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/guests`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}
//pulling from rapidAPI
export const getPuzzles = (rating) => {
    return fetch(`https://chess-puzzles.p.rapidapi.com/?themes=%5B%22middlegame%22%2C%22advantage%22%5D&rating=${rating}&themesType=ALL&playerMoves=4&count=25`, {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '079986b141msha5cf549e0f6360dp14dfcbjsn97a2d3b076a8',
            'X-RapidAPI-Host': 'chess-puzzles.p.rapidapi.com'
        }
    }).then(res => res.json())
}

//RETRIEVE FETCHES
export const getProfile = () => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/players/profile`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}
export const getTournament = (tournamentId) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/tournaments/${tournamentId}`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}
export const getGuest = (guestId) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/guests/${guestId}`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}
export const getChessClub = (clubId) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/clubs/${clubId}`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}
export const getScoreCard = (tournamentId) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/tournaments/${tournamentId}/score_card`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}





//POST FETCHES
export const submitNewPostToAPI = (newPostObj) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/communityposts`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newPostObj)
    })
        .then(res => res.json())
}
export const addFriend = (friendId) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/players/${friendId}/add_friend`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
}
export const sendDirectMessage = (msgObj) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/messages`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(msgObj)
    })
}
export const sendNewTournament = (tournamentObj) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/tournaments`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(tournamentObj)
    })
}
export const sendNewGame = (gameObj) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/games`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(gameObj)
    })
}
export const sendTournamentRoundOutcomes = (outcomeArr) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/games/outcomes`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(outcomeArr)
    })
}
export const getAIMove = (objForAi) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/ai_response`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(objForAi)
    })
        .then(res => res.json())
}
export const createNewGuest = (guestObj) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/guests/create_guest`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(guestObj)
    })
}
//OLD CREATE GUEST
// export const createNewGuest = (guestObj) => {
//     const localVillagerObj = getToken()
//     return fetch(`${apiKey}/guests`, {
//         method: "POST",
//         headers: {
//             "Authorization": `Token ${localVillagerObj.token}`,
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(guestObj)
//     })
// }
export const createNewClub = (clubObj) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/clubs`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(clubObj)
    })
}
export const addMemberToClub = (clubId, request) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/clubs/${clubId}/join_club`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
    })
    // .then(res => res.json())
}
//PUT FETCHES
export const updateProfile = (userId, profileObj) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/players/${userId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(profileObj)
    })
        .then(res => res.json())
}
export const updateTournament = (tournamentObj) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/tournaments/${tournamentObj.id}`, {
        method: "PUT",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(tournamentObj)
    })
}
export const sendUpdatedGames = (outcomeArr) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/games/tournament_update`, {
        method: "PUT",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(outcomeArr)
    })
}
export const alterGame = (gameObj) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/games/${gameObj.id}`, {
        method: "PUT",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(gameObj)
    })
}
export const acceptChallenge = (gameObj) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/games/${gameObj.id}/accept_challenge`, {
        method: "PUT",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(gameObj)
    })
}
export const endTournament = (tournamentId) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/tournaments/${tournamentId}/end_tournament`, {
        method: "PUT",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
}
export const updateClub = (clubId, clubObj) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/clubs/${clubId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(clubObj)
    })
    // .then(res => {
    //     if (res) {
    //         res = res.json()
    //     }
    // })
}

//DELETE FETCHES
export const deleteCommunityPost = (postId) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/communityposts/${postId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
}
export const removeFriend = (friendId) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/players/${friendId}/remove_friend`, {
        method: "DELETE",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
}
export const deleteGuest = (guestIdObj) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/guests`, {
        method: "DELETE",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(guestIdObj)
    })
}
export const leaveClub = (clubId) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/clubs/${clubId}/leave_club`, {
        method: "DELETE",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
}
export const deleteChallengeGame = (gameId) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/games/${gameId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
}


//auth
export const loginUser = (user) => {
    return fetch(`${apiKey}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(user)
    })
        .then(res => res.json())
}

export const registerUser = (user) => {
    return fetch(`${apiKey}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(user)
    })
        .then(res => res.json())
}

//BELOW ADDED FOR REFACTOR
export const getClubMatesAndGuests = () => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/players/club_mates`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    })
        .then(res => res.json())
}

export const getOpenChallenges = () => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/games/get_open_challenges`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    })
        .then(res => res.json())
}

export const getActiveUserGames = () => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/games/get_active_user_games`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    })
        .then(res => res.json())
}

export const getMyClubsCommunityPosts = (clubIdArr) => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/communityposts/get_my_clubs_posts`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(clubIdArr)
    })
        .then(res => res.json())
} 

export const getClubsUserNotJoined = () => {
    const localVillagerObj = getToken()
    return fetch(`${apiKey}/clubs/clubs_user_has_not_joined`, {
        headers: {
            "Authorization": `Token ${localVillagerObj.token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
}