function generateWebSocketPayload(eventName, payload) {
  return JSON.stringify({
    event: eventName,
    data: payload,
  });
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (char) {
      const randChar = (Math.random() * 16) | 0,
        v = char === "x" ? randChar : (randChar & 0x3) | 0x8;
      return v.toString(16);
    }
  );
}

// Check if a UUID exists in local storage, if not, generate and store one
function getUserId() {
  let userId = sessionStorage.getItem("userId");
  if (!userId) {
    userId = generateUUID();
    sessionStorage.setItem("userId", userId);
  }
  return userId;
}
