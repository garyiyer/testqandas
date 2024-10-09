export const auth = {
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
};

export const firestore = jest.fn();
export const functions = jest.fn();
export const storage = jest.fn();

export default {
  auth,
  firestore,
  functions,
  storage,
};
