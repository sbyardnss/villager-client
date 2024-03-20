import "../../styles/HomePage.css"
// import { React, useContext, useState, useEffect, useRef, KeyboardEvent, ChangeEventHandler } from "react"
import { useState, useEffect, KeyboardEvent } from "react"
import { Chessboard } from "react-chessboard"
// import Chess from "chess.js"
import { getMyClubsCommunityPosts, getOpenChallenges, acceptChallenge, deleteChallengeGame, deleteCommunityPost, getAllCommunityPosts, getTournament, sendNewGame, submitNewPostToAPI } from "../../ServerManager"
// import { PlayContext } from "../../Play/PlayProvider"
import { useNavigate } from "react-router-dom"
import trophyIcon from "../../images/small_trophy_with_background.png";
import { useAppContext } from "../App/AppProvider";
import type { CommunityPost } from "../../Types/CommunityPost";
import type { DigitalGame, Game, OutgoingGame } from "../../Types/Game";
import type { ChessClub } from "../../Types/ChessClub";

import type { PlayerRelated } from "../../Types/Player";
import type { Tournament } from "../../Types/Tournament";
import type { ChallengeCreated, ChallengeEditing, ChallengeNew } from "../../Types/Challenge";
import type { Puzzle } from "../../Types/Puzzle";
import { usePlayContext } from "../Play/PlayController";
import { showAlertModal } from "../../shared/AlertModal/alert-modal"
import { findByIdentifier } from "../Tournament/actions/find-by-identifier"

//TODO: MY CHALLENGES NOT SHOWING
export const HomePage = () => {
  const { localVillagerUser, myChessClubs, clubMatesAndGuests } = useAppContext();
  const [communityPosts, setCommunityPosts] = useState([]);
  const [challenges, setChallenges] = useState([]);
  // const [usersActiveGames, setUsersActiveGames] = useState([]);
  const navigate = useNavigate();
  const [newPost, updateNewPost] = useState({
    poster: localVillagerUser,
    message: ""
  });

  const [challengeForApi, updateChallengeForApi] = useState<DigitalGame>({
    id: undefined,
    player_w: null,
    player_w_model_type: "player",
    player_b: null,
    player_b_model_type: "player",
    tournament: null,
    time_setting: 1,
    date_time: "",
    win_style: '',
    accepted: false,
    tournament_round: null,
    winner: null,
    winner_model_type: null,
    bye: false,
    pgn: "",
  });
  const [activeUserPlayerObject, setActiveUserPlayerObject] = useState<PlayerRelated>({} as PlayerRelated);

  //POTENTIALLY TEMPORARY BEGIN
  // const { games, resetGames, updateSelectedGameObj, selectedGame, setSelectedGame, setSelectedRange, puzzles } = usePlayContext();
  const { selectedGame, updateSelectedGame, usersActiveGames, resetUserGames, selectedRange, setSelectedRange } = usePlayContext();
  const [myChallenges, setMyChallenges] = useState<ChallengeCreated[]>([]);
  const [displayedPuzzle, setDisplayedPuzzle] = useState<Puzzle>({
    puzzleid: '',
    fen: '',
    rating: 0,
    ratingDeviation: 0,
    moves: [],
    themes: [],
  });
  const [displayedCommunityPosts, setDisplayedCommunityPosts] = useState([]);
  const [selectedClub, setSelectedClub] = useState(0);
  const [challengeAlertVisible, setChallengeAlertVisible] = useState(false);

  //POTENTIALLY TEMPORARY END

  useEffect(
    () => {
      const myCreatedChallenges: ChallengeCreated[] = [];
      const othersChallenges = [];
      getOpenChallenges()
        .then(challengeData => {
          challengeData.forEach((c: ChallengeCreated) => {
            if (c.player_w?.id === localVillagerUser.userId || c.player_b?.id === localVillagerUser.userId) {
              myCreatedChallenges.push(c);
            } else {
              othersChallenges.push(c);
            }
          })
          setMyChallenges(myCreatedChallenges);
          setChallenges(challengeData);
        })
    }, [localVillagerUser]
  )
  useEffect(
    () => {
      const clubIds = myChessClubs.map((club: ChessClub) => club.id);
      getMyClubsCommunityPosts(clubIds)
        .then(postData => {
          setCommunityPosts(postData);
        })

      }, [myChessClubs]
  )

  useEffect(
    () => {
      setSelectedClub(myChessClubs[0]?.id);
    }, [myChessClubs]
  )
  
  useEffect(
    () => {
      const postsForSelectedClub = communityPosts.filter((post: CommunityPost) => post.club === selectedClub);
      setDisplayedCommunityPosts(postsForSelectedClub);
    }, [selectedClub, myChessClubs, communityPosts]
  )
  useEffect(
    () => {
      const playerObject = findByIdentifier(localVillagerUser.userId, clubMatesAndGuests);
      if (playerObject)
        setActiveUserPlayerObject(playerObject);
    }, [clubMatesAndGuests, localVillagerUser.userId]
  )
  /*
  community posts
  chess clubs
  challenges
  my active games

  */


  // const localVillager = localStorage.getItem("villager")
  // const localVillagerObj = JSON.parse(localVillager)
  // const navigate = useNavigate()
  // const { players, games, resetGames, selectedGameObj, updateSelectedGameObj, selectedGame, setSelectedGame, puzzles, selectedPuzzle, setSelectedPuzzle, selectedRange, setSelectedRange } = useContext(PlayContext)
  // const [communityPosts, setCommunityPosts] = useState([])
  // const [displayedCommunityPosts, setDisplayedCommunityPosts] = useState([])
  // const [tournaments, setTournaments] = useState([])
  // const [myTournaments, setMyTournaments] = useState([])
  // const [challenges, setChallenges] = useState([])
  // const [myChallenges, setMyChallenges] = useState([])
  // const [myUnfinishedGames, setMyUnfinishedGames] = useState([])
  // const [displayedPuzzle, setDisplayedPuzzle] = useState({})
  // const [myChessClubs, setMyChessClubs] = useState([])
  // const [selectedClub, setSelectedClub] = useState(0)
  // const [challengeAlertVisible, setChallengeAlertVisible] = useState(false)
  // const [newPost, updateNewPost] = useState({
  //     poster: localVillagerObj.userId,
  //     message: ""
  // })
  //OLD CHALLENGEFOR API
  // const [challengeForApi, updateChallengeForApi] = useState({
  //     player_w: 0,
  //     player_b: 0,
  //     accepted: false,
  //     computer_opponent: false
  // })

  // const [challengeForApi, updateChallengeForApi] = useState({
  //     player_w: 0,
  //     player_w_model_type: 'player',
  //     player_b: 0,
  //     player_b_model_type: 'player',
  //     accepted: false,
  //     computer_opponent: false,
  //     winner: null
  // })
  // useEffect(
  //     () => {
  //         Promise.all([getAllCommunityPosts(), getMyChessClubs()/*, getAllTournaments()*/]).then(([communityPostData, myClubsData/*, tournamentData*/]) => {
  //             setCommunityPosts(communityPostData)
  //             setMyChessClubs(myClubsData)
  //             // setTournaments(tournamentData)
  //         })
  //     }, []
  // )
  // useEffect(
  //     () => {
  //         setSelectedClub(myChessClubs[0]?.id)
  //     }, [myChessClubs]
  // )
  // useEffect(
  //     () => {
  //         if (selectedClub !== 0) {
  //             const filteredCommunityPosts = communityPosts.filter(post => {
  //                 return post.club === selectedClub
  //             })
  //             setDisplayedCommunityPosts(filteredCommunityPosts)
  //         }
  //         else {
  //             setDisplayedCommunityPosts(communityPosts)
  //         }
  //     }, [selectedClub, myChessClubs]
  // )
  // useEffect(
  //     () => {
  //         // const challengeGames = games?.filter(game => game.accepted === false)
  //         const challengeGames = games?.filter(game => {
  //             const challengingPlayerId = game.player_b?.id ? game.player_b.id : game.player_w.id
  //             const allMembersOfClubs = []
  //             myChessClubs.map(club => {
  //                 club.members.map(member => member.id !== localVillagerObj.userId ? allMembersOfClubs.push(member.id) : null)
  //             })
  //             if (game.accepted === false && allMembersOfClubs.find(memberId => memberId === challengingPlayerId)) {
  //                 return game
  //             }
  //         })
  //         setChallenges(challengeGames)
  //         const myCreatedChallenges = games?.filter(game => {
  //             return game.accepted === false && game.player_w?.id === localVillagerObj.userId && !game.player_w?.guest_id || game.accepted === false && game.player_b?.id === localVillagerObj.userId && !game.player_b?.guest_id
  //         })
  //         setMyChallenges(myCreatedChallenges)
  //         const nonGuestGames = games?.filter(game => {
  //             return (!game.player_b?.guest_id && !game.player_w?.guest_id)
  //         })
  //         const unfinishedGames = nonGuestGames?.filter(game => {
  //             return (game.player_b?.id === localVillagerObj.userId || game.player_w?.id === localVillagerObj.userId) && game.winner === null && game.win_style === '' && game.accepted === true
  //         })
  //         setMyUnfinishedGames(unfinishedGames)
  //     }, [games]
  // )
  // useEffect(
  //     () => {
  //         if (selectedPuzzle.fen !== "") {
  //             navigate("/play")
  //         }
  //     }, [selectedPuzzle]
  // )

  // update displayed puzzle
  // useEffect(
  //     () => {
  //         if (puzzles) {

  //             const firstPuzzle = puzzles.puzzles[0]
  //             if (firstPuzzle)
  //             setDisplayedPuzzle(firstPuzzle)
  //         }
  //     },[puzzles]
  // )

  const resetCommunityPosts = () => {
    getAllCommunityPosts()
      .then(data => setCommunityPosts(data))
  }
  const resetChallenges = () => {
    const myCreatedChallenges: ChallengeCreated[] = [];
    const othersChallenges = [];
    getOpenChallenges()
      .then(challengeData => {
        challengeData.forEach((c: ChallengeCreated) => {
          if (c.player_w?.id === localVillagerUser.userId || c.player_b?.id === localVillagerUser.userId) {
            myCreatedChallenges.push(c);
          } else {
            othersChallenges.push(c);
          }
        })
        setMyChallenges(myCreatedChallenges);
        setChallenges(challengeData);
      })
  }
  //SCROLL TO BOTTOM FUNCTIONALITY FROM LINKUP
  const scrollToBottom = () => {
    const communityPostElement = document.getElementById("communityForumMsgs")
    if (communityPostElement)
      communityPostElement.scrollTop = communityPostElement.scrollHeight
  }
  useEffect(() => {
    scrollToBottom()
  }, [communityPosts])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const copy = { ...newPost }
    const target = e.target as HTMLInputElement;
    copy.message = target.value
    updateNewPost(copy)
  }
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitNewPostToAPI(newPost).then(() => {
        const copy = { ...newPost }
        copy.message = ""
        updateNewPost(copy)
        resetCommunityPosts()
      })
    }
  }
  const handleDelete = (id: number) => {
    if (window.confirm("are you sure?")) {
      deleteCommunityPost(id)
        .then(() => {
          resetCommunityPosts()
        })
    }
  }

  // const openChallengesOrMsg = () => {
  //   const othersChallenges = challenges.filter((c: Game) => c.player_b?.id !== localVillagerUser.userId && c.player_w?.id !== localVillagerUser.userId)
  //   if (!othersChallenges.length) {
  //     return (
  //       <div id="noChallengesMsg">
  //         There are currently no open challenges
  //       </div>
  //     )
  //   }
  //   else {
  //     return <>
  //       <section id="openChallengesList">
  //         {
  //           challenges?.map((c: ChallengeCreated) => {
  //             const challengingPlayer = c.player_w ? c.player_w : c.player_b
  //             //TODO: STORY: CHALLENGE TYPE FIX
  //             if ((challengingPlayer as PlayerRelated).id !== localVillagerUser.userId) {
  //               return (
  //                 <div key={c.id} className="challengeListItem">
  //                   <div>

  //                     <div className="openChallengerInfo">
  //                       <div>
  //                         Play <span id={c.player_w ? "blackChallengeSpan" : "whiteChallengeSpan"}>{c.player_w ? "black" : "white"}</span> vs <span id={c.player_w ? "whiteChallengeSpan" : "blackChallengeSpan"}>{challengingPlayer.username}</span>
  //                       </div>
  //                       <button className="challengeBtn buttonStyleAmbiguous"
  //                         onClick={() => {
  //                           const copy = { ...c }
  //                           c.player_w ? copy.player_b = localVillagerUser.userId : copy.player_w = localVillagerUser.userId
  //                           c.player_w ? copy.player_w = c.player_w.id : copy.player_b = c.player_b.id
  //                           copy.accepted = true
  //                           acceptChallenge(copy)
  //                             .then(() => resetGames())
  //                         }}>accept</button>
  //                     </div>
  //                   </div>
  //                 </div>
  //               )
  //             }
  //             return null;
  //           })
  //         }
  //       </section>
  //     </>

  //   }
  // }
  return <>
    <main id="homepageContainer">
      {challengeAlertVisible === true ?
        <div id="challengeCreatedModal">
          <h2 className="setCustomFont">Challenge Created!</h2>
        </div>
        : ""}
      <div id="homepageLayoutDiv">
        <div id="forumAndActiveGames">
          <article id="communityForum">
            <div id="communityForumHeader">
              <h2 className="setCustomFont">Club Chat</h2>
              <div id="forumFilterWithHeader">
                <h5 id="forumFilterHeader" className="setCustomFont">select club</h5>
                <ul id="communityForumClubFilter">
                  {!myChessClubs.length ? <div id="noClubsNotificationTab">join or create a club</div> : ""}
                  {
                    myChessClubs.map((club: ChessClub) => {
                      return (
                        <li key={club.id} className="communityForumFilterTab setCustomFont" onClick={() => setSelectedClub(club.id)}>{club.name}</li>
                      )
                    })
                  }
                </ul>
              </div>
            </div>
            <section id="communityForumMsgs" >
              {!displayedCommunityPosts.length ? <div>no community posts</div> : ""}
              {
                displayedCommunityPosts.map((post: CommunityPost) => {
                  const date_time = new Date(post.date_time)
                  const date = date_time.toLocaleDateString('en-us')
                  const time = date_time.toLocaleTimeString('en-us', { hour: 'numeric', minute: '2-digit' })
                  if (post.poster?.id === localVillagerUser.userId) {
                    return (
                      <li key={post.id} className="communityPost">
                        <h3>
                          {post.poster?.full_name}
                        </h3>
                        <h5>{date} {time}</h5>
                        <div className="communityPostWithDelete">
                          {post.message}
                          <button className="buttonStyleReject" onClick={() => handleDelete(post.id)}>delete</button>
                        </div>
                      </li>
                    )
                  }
                  else {
                    return (
                      <li key={post.id} className="communityPost">
                        <h3>
                          {post.poster?.full_name}
                        </h3>
                        <h5>{date} {time}</h5>
                        {post.message}</li>
                    )
                  }
                })
              }
            </section>
            <section id="communityForumInterface">
              <input id="communityForumInput"
                type="text"
                className="text-input"
                value={newPost.message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
              <button id="communityForumSubmitBtn"
                className="buttonStyleApprove"
                onClick={() => {
                  submitNewPostToAPI(newPost).then(() => {
                    const copy = { ...newPost }
                    copy.message = ""
                    updateNewPost(copy)
                    getAllCommunityPosts().then(data => setCommunityPosts(data))
                    // resetMessages()
                  })
                }}
              >send</button>
            </section>
          </article>
          <article key="activeGames" id="activeGamesArticle">
            <section id="myActiveGames">
              <h2 id="activeGamesHeader" className="setCustomFont">My Games</h2>
              {/* <button id="homepagePlayButton">play</button> */}
              <div id="myUnfinishedGamesScrollWindow">
                <div id="activeGamesUl">
                  {!usersActiveGames.length ? <h3 className="setCustomFont" id="noGamesMsg">you have no active games</h3> : ""}
                  {
                    usersActiveGames?.map((ug: DigitalGame) => {
                      // const opponent = ug.player_w?.id === localVillagerObj.userId ? ug.player_b : ug.player_w
                      let tournament: Partial<Tournament> = {}
                      if (ug.tournament) {
                        // TODO: FIX THIS USE OF ANY
                        const tournamentObj = Promise.resolve(getTournament(ug.tournament)) as any;
                        if (tournamentObj)
                          tournament = tournamentObj;
                      }
                      // const opponent = ug.player_w?.id === localVillagerUser ? players.find(p => p.id === ug.player_b?.id) : players.find(p => p.id === ug.player_w?.id)
                      const opponentObj = ug.player_w?.id === localVillagerUser.userId ? ug.player_b : ug.player_w;
                      const isTournamentGame = () => {
                        return ug.tournament ? "tournamentActiveGameListItem" : "activeGameListItem"
                      }
                      const isSelected = () => {
                        return ug === selectedGame ? "selectedGameListItem" : "gameListItem"
                      }
                      if (opponentObj) {
                        const opponent = opponentObj;
                        return (
                          <div key={ug.id} className={isTournamentGame()} id={isSelected()}>
                            <div><span id={ug.player_w?.id === localVillagerUser.userId ? "whiteChallengeSpan" : "blackChallengeSpan"}>{ug.player_w?.id === localVillagerUser.userId ? "white" : "black"}</span></div>
                            <div className="activeGameInfo">
                              <div className="opponentSectionForListItem">vs {opponent.full_name}</div>
                              <div>{ug.tournament ? <img className="trophyIconHomepage" alt="trophy" src={trophyIcon} /> : ""}</div>
                              <div className="myGamesListLogisticsInfo">
                                <div>{tournament?.title || ""}</div>
                                <div>{new Date(ug.date_time).toLocaleDateString('en-us')}</div>
                              </div>
                            </div>
                            <button className="challengeBtn buttonStyleApprove"
                              onClick={() => {
                                // setSelectedGame(ug.id)
                                const gameObjForPlay = usersActiveGames.find((g: DigitalGame) => g.id === ug.id);
                                if (gameObjForPlay)
                                  updateSelectedGame(gameObjForPlay as DigitalGame);
                                navigate("/play");
                              }}>select</button>
                          </div>
                        )
                      } else {
                        return null;
                      }
                    })
                  }
                </div>
              </div>
            </section>
          </article>
        </div>
        <div id="challengesAndPuzzles">
          <div id="challengesArticle">
            <div className="challengesBackground"></div>
            <section id="createChallengeSection">
              <h3 className="setCustomFont">create challenge</h3>
              <div id="createChallengeDiv">
                <div id="piecesSelectionContainer">
                  <div id="whitePiecesSelect" onClick={() => {
                    const challengeCopy = { ...challengeForApi }
                    challengeCopy.player_w = activeUserPlayerObject;
                    challengeCopy.player_b = null
                    updateChallengeForApi(challengeCopy)
                  }}>white</div>
                  <div id="blackPiecesSelect" onClick={() => {
                    const challengeCopy = { ...challengeForApi }
                    challengeCopy.player_b = activeUserPlayerObject;
                    challengeCopy.player_w = null
                    updateChallengeForApi(challengeCopy)
                  }}>black</div>
                  <div id="randomSelect" onClick={() => {
                    const challengeCopy = { ...challengeForApi }
                    const randomNumber = Math.floor(Math.random() * 2)
                    if (randomNumber === 1) {
                      challengeCopy.player_w = activeUserPlayerObject;
                      challengeCopy.player_b = null
                    }
                    else {
                      challengeCopy.player_b = activeUserPlayerObject;
                      challengeCopy.player_w = null
                    }
                    updateChallengeForApi(challengeCopy)
                  }}>random</div>
                </div>
              </div>
              <button
                id="createChallengeBtn"
                className="buttonStyleAmbiguous"
                onClick={() => {
                  if (window.confirm("create open challenge?")) {
                    sendNewGame(challengeForApi)
                      .then(() => {
                        resetChallenges();
                        setChallengeAlertVisible(true);
                      })

                    setTimeout(() => {
                      setChallengeAlertVisible(false);
                    }, 2000)
                  }
                }}>create</button>
            </section>
            <h2 className="setCustomFont">My Challenges</h2>
            {!myChallenges.length ? <div id="noChallengesMsg" className="setCustomFont">You have no challenges</div> : ""}
            <section id="challengesList">
              {
                myChallenges?.map((c: ChallengeCreated) => {
                  const playingAs = c.player_w ? "whiteChallengeSpan" : "blackChallengeSpan"
                  const playingColor = c.player_w ? "white" : "black"
                  return (
                    <div key={c.id} className="challengeListItem">
                      <div>
                        <div className="challengerInfo">
                          <div>
                            Playing as
                            <span id={playingAs}>{playingColor}</span>
                          </div>
                          <button className="challengeBtn buttonStyleReject"
                            onClick={() => {
                              deleteChallengeGame(c.id)
                                .then(() => resetUserGames());
                            }}>abort</button>
                        </div>
                      </div>
                    </div>
                  )

                })
              }
            </section>
            <h2 className="setCustomFont">Open Challenges</h2>
            {/* {openChallengesOrMsg()} */}
            {!challenges.length ? <div id="noChallengesMsg">There are currently no open challenges</div> : ""}
            <section id="challengesList">
              {
                challenges?.map((c: ChallengeEditing) => {
                  //TODO: STORY: CHALLENGE TYPE FIX
                  const challengingPlayer = (c.player_w ? c.player_w : c.player_b) as PlayerRelated;
                  if (challengingPlayer?.id !== localVillagerUser.userId) {
                    return (
                      <div key={c.id} className="challengeListItem">
                        <div>
                          {/* <div>Challenger:</div> */}
                          <div className="challengerInfo">
                            <div>
                              Play as <span id={c.player_w ? "blackChallengeSpan" : "whiteChallengeSpan"}>{c.player_w ? "black" : "white"}</span> vs <span id={c.player_w ? "whiteChallengeSpan" : "blackChallengeSpan"}>{challengingPlayer.full_name}</span>
                            </div>
                            <button className="challengeBtn buttonStyleAmbiguous"
                              onClick={() => {
                                const copy = { ...c }
                                c.player_w ? copy.player_b = localVillagerUser.userId : copy.player_w = localVillagerUser.userId
                                //TODO: STORY: CHALLENGE TYPE FIX
                                //TODO: CURRENTLY ASSIGNING THIS TO A NUMBER WHICH COMPLICATES TYPE. REQUIRES ADDING BOTH PLAYERRELATED AND NUMBER TO FIELDS
                                c.player_w ? copy.player_w = (c.player_w as PlayerRelated).id : copy.player_b = (c.player_b as PlayerRelated).id
                                copy.accepted = true
                                acceptChallenge(copy)
                                  .then(() => resetUserGames())
                              }}>accept</button>
                          </div>
                        </div>
                      </div>
                    )
                  } else {
                    return null;
                  }
                })
              }
            </section>
          </div>
          <div id="puzzlesArticle">
            <div id="puzzleParamaters">
              {/* <label id="puzzleLabel" htmlFor="puzzleRatingSelect">select puzzle rating</label> */}
              <div id="puzzleSelectAndSubmit">
                <select id="puzzleSelect" onChange={(e) => setSelectedRange(e.target.value)}>
                  <option value={800}>select puzzle rating</option>
                  <option value={800}>800</option>
                  <option value={900}>900</option>
                  <option value={1000}>1000</option>
                  <option value={1100}>1100</option>
                  <option value={1200}>1200</option>
                  <option value={1300}>1300</option>
                  <option value={1400}>1400</option>
                  <option value={1500}>1500</option>
                  <option value={1600}>1600</option>
                  <option value={1700}>1700</option>
                  <option value={1800}>1800</option>
                  <option value={1900}>1900</option>
                  <option value={2000}>2000</option>
                  <option value={2100}>2100</option>
                  <option value={2200}>2200</option>
                </select>
                <button id="submitPuzzleSelectionBtn" className="buttonStyleApprove">submit</button>
              </div>
            </div>
            <div id="chessBoardContainer">
              <Chessboard
                id="chessboardHomepage"
                position={displayedPuzzle?.fen}
                arePiecesDraggable={false} />
            </div>
            <button className="buttonStyleReject">try this puzzle</button>
          </div>
        </div>
      </div>


    </main>
  </>
}
