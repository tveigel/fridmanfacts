// src/lib/firebase/types.ts


import { 
    DocumentData, 
    QueryDocumentSnapshot,
    DocumentReference,
    CollectionReference
  } from 'firebase/firestore';
  import { ValidationStatus, ServiceResponse } from '../types/core-types';
  
  export interface FirebaseServiceConfig {
    collection: string;
    subCollections?: string[];
  }
  
  export interface FirebaseDocumentReference<T = DocumentData> extends DocumentReference<T> {
    id: string;
  }
  
  export interface FirebaseQueryOptions {
    limit?: number;
    orderBy?: {
      field: string;
      direction: 'asc' | 'desc'
    };
    where?: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  }
  
  export interface FirebaseServiceOperations<T> {
    create: (data: Partial<T>) => Promise<ServiceResponse<T>>;
    update: (id: string, data: Partial<T>) => Promise<ServiceResponse<T>>;
    delete: (id: string) => Promise<ServiceResponse<void>>;
    get: (id: string) => Promise<ServiceResponse<T>>;
    query: (options: FirebaseQueryOptions) => Promise<ServiceResponse<T[]>>;
  }
  
  export type FirebaseDocumentSnapshot<T> = QueryDocumentSnapshot<T>;
  
  export interface FirebaseServiceHooks<T> {
    useDocument: (id: string) => {
      data: T | null;
      loading: boolean;
      error: Error | null;
    };
    useCollection: (options?: FirebaseQueryOptions) => {
      data: T[];
      loading: boolean;
      error: Error | null;
    };
  }