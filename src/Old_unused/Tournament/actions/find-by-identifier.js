export const findByIdentifier = (identifier, playerArr) => {
  if (isNaN(parseInt(identifier))) {
    return playerArr.find(p => p.guest_id === identifier);
  } else {
    return playerArr.find(p => p.id === parseInt(identifier));
  }
}