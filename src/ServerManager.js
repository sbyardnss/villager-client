const getToken = () => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    return localVillagerObj
}
// const apiKey = process.env.REACT_APP_API;
const apiKey = "http://localhost:8000"

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