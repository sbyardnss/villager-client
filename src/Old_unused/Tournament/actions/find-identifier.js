export const findIdentifier = (playerObj) => {
  return playerObj?.guest_id ? playerObj?.guest_id : playerObj?.id
}