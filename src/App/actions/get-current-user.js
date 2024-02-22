
export function GetLoggedInUser() {
  return JSON.parse(localStorage.getItem("villager"));
}