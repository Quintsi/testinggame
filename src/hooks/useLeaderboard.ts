import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  where,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from 'firebase/auth';

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  photoURL?: string;
  highScore: number;
  gamesPlayed: number;
  lastPlayed: Date;
}

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const leaderboardRef = collection(db, 'leaderboard');
      const q = query(
        leaderboardRef, 
        orderBy('highScore', 'desc'), 
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const entries: LeaderboardEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          displayName: data.displayName,
          photoURL: data.photoURL,
          highScore: data.highScore,
          gamesPlayed: data.gamesPlayed,
          lastPlayed: data.lastPlayed?.toDate() || new Date()
        });
      });
      
      setLeaderboard(entries);
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      setError(error.message || 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const submitScore = async (user: User, score: number) => {
    try {
      setError(null);
      
      const userRef = doc(db, 'leaderboard', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentHighScore = userData.highScore || 0;
        const currentGamesPlayed = userData.gamesPlayed || 0;
        
        // Only update if new score is higher
        if (score > currentHighScore) {
          await updateDoc(userRef, {
            highScore: score,
            gamesPlayed: currentGamesPlayed + 1,
            lastPlayed: new Date(),
            displayName: user.displayName || 'Anonymous',
            photoURL: user.photoURL || ''
          });
        } else {
          // Just update games played and last played
          await updateDoc(userRef, {
            gamesPlayed: currentGamesPlayed + 1,
            lastPlayed: new Date()
          });
        }
      } else {
        // Create new entry
        await setDoc(userRef, {
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || '',
          highScore: score,
          gamesPlayed: 1,
          lastPlayed: new Date()
        });
      }
      
      // Refresh leaderboard after submitting score
      await fetchLeaderboard();
    } catch (error: any) {
      console.error('Error submitting score:', error);
      setError(error.message || 'Failed to submit score');
    }
  };

  const getUserHighScore = async (user: User): Promise<number> => {
    try {
      const userRef = doc(db, 'leaderboard', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data().highScore || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching user high score:', error);
      return 0;
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return {
    leaderboard,
    loading,
    error,
    fetchLeaderboard,
    submitScore,
    getUserHighScore
  };
};