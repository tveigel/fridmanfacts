// src/services/index.ts
export * from '../types/types';
export { factCheckService } from './factCheckService';
export { voteService } from './voteService';
export { roleService } from './roleService';
export { notificationService } from './notificationService'; 
export { auth, db } from '../firebase/firebaseConfig';
export { commentService } from './commentService';