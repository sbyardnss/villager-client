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