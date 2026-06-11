import { initializeApp, getApps } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Household, PantryItem, UserProfile } from '../types';

// ─────────────────────────────────────────────
// Firebase config — from your GoogleService-Info.plist
// ─────────────────────────────────────────────

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Prevent re-initialising on hot reload
const isNewApp = getApps().length === 0;
const app = isNewApp ? initializeApp(firebaseConfig) : getApps()[0];
const auth = isNewApp
  ? initializeAuth(app, { persistence: getReactNativePersistence(ReactNativeAsyncStorage) })
  : getAuth(app);
const db = getFirestore(app);

// ─────────────────────────────────────────────
// Google Sign In
// ─────────────────────────────────────────────

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '815639717206-0qpbus5qfk5u05kmcnhm844vc0hea28v.apps.googleusercontent.com',
    iosClientId: '815639717206-0qpbus5qfk5u05kmcnhm844vc0hea28v.apps.googleusercontent.com',
  });
};

export const signInWithGoogle = async () => {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const { data } = await GoogleSignin.signIn();
  const googleCredential = GoogleAuthProvider.credential(data!.idToken);
  const userCred = await signInWithCredential(auth, googleCredential);

  await createUserProfile(userCred.user.uid, {
    email: userCred.user.email ?? '',
    displayName: userCred.user.displayName ?? 'Family Member',
    photoURL: userCred.user.photoURL ?? undefined,
  });

  return userCred;
};

export const signOut = async () => {
  await GoogleSignin.signOut();
  await firebaseSignOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

export const currentUser = () => auth.currentUser;

// ─────────────────────────────────────────────
// User profiles
// ─────────────────────────────────────────────

export const createUserProfile = (uid: string, data: Partial<UserProfile>) =>
  setDoc(doc(db, 'users', uid), {
    ...data,
    uid,
    createdAt: serverTimestamp(),
  }, { merge: true });

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
};

// ─────────────────────────────────────────────
// Households
// ─────────────────────────────────────────────

const generateInviteCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

export const createHousehold = async (name: string, userId: string): Promise<string> => {
  const inviteCode = generateInviteCode();
  const ref = doc(collection(db, 'households'));
  await setDoc(ref, {
    id: ref.id,
    name,
    inviteCode,
    memberIds: [userId],
    createdByUserId: userId,
    createdAt: serverTimestamp(),
    settings: {
      expiryWarningDays: 3,
      notificationsEnabled: true,
      notificationTime: '08:00',
    },
  });
  await updateDoc(doc(db, 'users', userId), { householdId: ref.id });
  return ref.id;
};

export const joinHousehold = async (inviteCode: string, userId: string): Promise<string | null> => {
  // Query for matching invite code
  const { getDocs } = await import('firebase/firestore');
  const q = query(
    collection(db, 'households'),
    where('inviteCode', '==', inviteCode.toUpperCase())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;

  const householdDoc = snap.docs[0];
  await updateDoc(householdDoc.ref, { memberIds: arrayUnion(userId) });
  await updateDoc(doc(db, 'users', userId), { householdId: householdDoc.id });
  return householdDoc.id;
};

export const getHousehold = async (householdId: string): Promise<Household | null> => {
  const snap = await getDoc(doc(db, 'households', householdId));
  return snap.exists() ? (snap.data() as Household) : null;
};

export const updateHouseholdSettings = (
  householdId: string,
  settings: Partial<Household['settings']>
) => updateDoc(doc(db, 'households', householdId), { settings });

// ─────────────────────────────────────────────
// Pantry Items
// ─────────────────────────────────────────────

const itemsCol = (householdId: string) =>
  collection(db, 'households', householdId, 'items');

const toDate = (val: any): Date =>
  val instanceof Timestamp ? val.toDate() : val instanceof Date ? val : new Date(val);

const hydrateItem = (data: any): PantryItem => ({
  ...data,
  expiryDate: toDate(data.expiryDate),
  purchaseDate: toDate(data.purchaseDate),
  openedDate: data.openedDate ? toDate(data.openedDate) : undefined,
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
});

export const addItem = async (
  householdId: string,
  item: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const ref = doc(itemsCol(householdId));
  await setDoc(ref, {
    ...item,
    id: ref.id,
    isConsumed: false,
    isExpired: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateItem = (
  householdId: string,
  itemId: string,
  data: Partial<PantryItem>
) =>
  updateDoc(doc(itemsCol(householdId), itemId), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const markConsumed = (householdId: string, itemId: string) =>
  updateItem(householdId, itemId, { isConsumed: true });

export const deleteItem = (householdId: string, itemId: string) =>
  deleteDoc(doc(itemsCol(householdId), itemId));

export const subscribeToItems = (
  householdId: string,
  onUpdate: (items: PantryItem[]) => void
) => {
  const q = query(
    itemsCol(householdId),
    where('isConsumed', '==', false),
    orderBy('expiryDate', 'asc')
  );
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map((d) => hydrateItem(d.data())));
  });
};
