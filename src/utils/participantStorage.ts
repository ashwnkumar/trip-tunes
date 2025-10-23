export const PARTICIPANT_KEY = "participants_by_room";

export const getStoredParticipants = () => {
  try {
    return JSON.parse(localStorage.getItem(PARTICIPANT_KEY) || "{}");
  } catch (error) {
    console.error("Error getting stored participants:", error);
    return {};
  }
};

export const storeParticipant = (roomCode: string, participant: any) => {
  const all = getStoredParticipants();
  all[roomCode] = participant;
  localStorage.setItem(PARTICIPANT_KEY, JSON.stringify(all));
};

export const getParticipantForRoom = (roomCode: string) => {
  const all = getStoredParticipants();
  return all[roomCode] || null;
};

export const clearParticipantFromRoom = (roomCode: string) => {
  const all = getStoredParticipants();
  delete all[roomCode];
  localStorage.setItem(PARTICIPANT_KEY, JSON.stringify(all));
};

export const clearAllParticipants = () => {
  localStorage.removeItem(PARTICIPANT_KEY);
};
