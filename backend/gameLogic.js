function checkWinner(turn, cellData) {
  // return false for not yet decided
  // return true for the current turn winner
  const current = turn;

  // check rows
  if (
    cellData[0] == current &&
    cellData[0] == cellData[1] &&
    cellData[0] == cellData[2]
  ) {
    // draw first row
    return true;
  }

  if (
    cellData[3] == current &&
    cellData[3] == cellData[4] &&
    cellData[3] == cellData[5]
  ) {
    // draw second row
    return true;
  }

  if (
    cellData[6] == current &&
    cellData[6] == cellData[7] &&
    cellData[6] == cellData[8]
  ) {
    // draw third row
    return true;
  }

  // check columns
  if (
    cellData[0] == current &&
    cellData[0] == cellData[3] &&
    cellData[0] == cellData[6]
  ) {
    //1 row
    return true;
  }
  if (
    cellData[1] == current &&
    cellData[1] == cellData[4] &&
    cellData[1] == cellData[7]
  ) {
    //2 row
    return true;
  }

  if (
    cellData[2] == current &&
    cellData[2] == cellData[5] &&
    cellData[2] == cellData[8]
  ) {
    // 3 row
    return true;
  }

  // check diagonals
  if (
    cellData[0] == current &&
    cellData[0] == cellData[4] &&
    cellData[0] == cellData[8]
  ) {
    // main
    return true;
  }

  if (
    cellData[2] == current &&
    cellData[2] == cellData[4] &&
    cellData[2] == cellData[6]
  ) {
    // second diag
    return true;
  }

  return false;
}

module.exports = {
  checkWinner,
};
