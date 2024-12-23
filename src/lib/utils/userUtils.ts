// src/utils/userUtils.ts
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const adjectives = [
    "Greasy", "Sleepy", "Conflicted", "Awkward", "Cringe", "Cursed", "Moist", "Sticky", "Hangry",
    "Sketchy", "Spicy", "Salty", "Rowdy", "Janky", "Unhinged", "Rusty", "Beta", "Quantum", 
    "Recursive", "Overfitted", "Underfitted", "Optimized", "Buggy", "Deprecated", "Frozen", 
    "Malicious", "Sweaty", "Floppy", "Numb", "Radioactive", "Broke", "Bankrupt", "Spooky", 
    "Sinister", "Trashy", "Overcooked", "Cheeky", "Wobbly", "Evil", "Mysterious", "Hyper", 
    "Anxious", "Whiny", "Petty", "Deranged", "Synthetic"
];

const nouns = [
    "Musk", "Bezos", "Gates", "Zuck", "Altman", "Sutskever", "Karpathy", "Hinton", "Ng", "Thrun", 
    "Schmidhuber", "LeCun", "Hassabis", "OpenAI", "Stability", "Sam_Bankman", "Madoff", "Theranos", 
    "Zuckerberg", "Balaji", "Palantir", "Snowden", "Assange", "Trump", "Kanye", "Rogan", "Nietzsche",
    "Newton", "Curie", "Turing", "Hawking", "Tesla", "Einstein", "Archimedes", "Darwin", "Mendel", 
    "Descartes", "Plato", "Hobbes", "Genghis", "Caesar", "Rasputin", "Napoleon", "Churchill", "Cleopatra", "Shakespeare", "Attila", "Vlad", "Joan_of_Arc", "DaVinci", "Fibonacci", 
    "Jobs", "Wozniak", "Pascal", "Euler", "Lovelace", "Hopper", "Socrates", "Aristotle"
];

export async function generateUsername() {
  let attempts = 0;
  const maxAttempts = 10;
  let useNumbers = false;  // Start without using numbers
   while (attempts < maxAttempts) {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    // Only add random number after half the attempts
    const randomNum = useNumbers ? Math.floor(Math.random() * 1000) : '';
    const username = `${adjective}${noun}${randomNum}`;
     // Check if username exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
     if (querySnapshot.empty) {
      return username;
    }
     attempts++;
    // Start using numbers after half the attempts
    if (attempts >= maxAttempts / 2) {
      useNumbers = true;
    }
  }
   // If all attempts fail, use timestamp to ensure uniqueness
  const timestamp = Date.now();
  return `User${timestamp}`;
 
}