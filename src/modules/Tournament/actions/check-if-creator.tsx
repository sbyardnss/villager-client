import { GetLoggedInUser } from "../../App/actions/get-current-user";

export const checkIfUserIsAppCreator = () => {
  const loggedInUser = GetLoggedInUser();
  if (loggedInUser.userId === 1) {
    return true;
  } else {
    return false;
  }
} 