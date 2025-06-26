import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  limit,
  addDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from 'firebase/auth';

export interface ScoreHistoryEntry {
  id: string;
  score: number;
  date: Date;
  gameMode: 'pest-control' | 'desktop-destroyer';
  duration?: number; // in seconds
  bugsKilled?: number;
  accuracy?: number;
}

export type SortField = 'date' | 'score';
export type SortOrder = 'asc' | 'desc';

export const useUserScoreHistory = (user: User | null) => {
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const fetchUserScoreHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const historyRef = collection(db, 'scoreHistory');
      const q = query(
        historyRef,
        where('userId', '==', user.uid),
        orderBy(sortField, sortOrder),
        limit(50) // Limit to last 50 games
      );
      
      const querySnapshot = await getDocs(q);
      const entries: ScoreHistoryEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          score: data.score,
          date: data.date?.toDate() || new Date(),
          gameMode: data.gameMode || 'pest-control',
          duration: data.duration,
          bugsKilled: data.bugsKilled,
          accuracy: data.accuracy
        });
      });
      
      setScoreHistory(entries);
    } catch (error: any) {
      console.error('Error fetching user score history:', error);
      setError(error.message || 'Failed to fetch score history');
    } finally {
      setLoading(false);
    }
  };

  const addScoreToHistory = async (score: number, gameMode: 'pest-control' | 'desktop-destroyer', additionalData?: {
    duration?: number;
    bugsKilled?: number;
    accuracy?: number;
  }) => {
    if (!user) return;

    try {
      const historyRef = collection(db, 'scoreHistory');
      const newEntry = {
        userId: user.uid,
        score,
        date: new Date(),
        gameMode,
        ...additionalData
      };
      
      // Add to Firestore
      const docRef = await addDoc(historyRef, newEntry);
      
      // Update local state with the new entry
      const newHistoryEntry: ScoreHistoryEntry = {
        id: docRef.id,
        score,
        date: new Date(),
        gameMode,
        ...additionalData
      };
      
      setScoreHistory(prev => [newHistoryEntry, ...prev].slice(0, 50));
    } catch (error: any) {
      console.error('Error adding score to history:', error);
      setError(error.message || 'Failed to add score to history');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to desc for new fields
    }
  };

  useEffect(() => {
    fetchUserScoreHistory();
  }, [user, sortField, sortOrder]);

  return {
    scoreHistory,
    loading,
    error,
    sortField,
    sortOrder,
    handleSort,
    addScoreToHistory,
    fetchUserScoreHistory
  };
}; 