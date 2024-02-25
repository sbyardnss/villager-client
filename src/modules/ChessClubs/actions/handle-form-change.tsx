import { ChangeEvent } from "react";
import type { ChessClub } from "../../App/types";
import type { ChessClubEdit } from "../types/ChessClub";
interface handlerInput {
  stateObject: Partial<ChessClub> | ChessClubEdit;
  handler: React.Dispatch<React.SetStateAction<any>>;
  evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
}

export const handleFormChange = (handlerInput: handlerInput) => {
    const copy = { ...handlerInput.stateObject }
    if (handlerInput.evt.target.id === 'zipcode') {
      copy[handlerInput.evt.target.id] = parseInt(handlerInput.evt.target.value)
    }
    else {
      copy[handlerInput.evt.target.id] = handlerInput.evt.target.value
    }
    // updateEditedClub(copy)
    handlerInput.handler(copy);
  }