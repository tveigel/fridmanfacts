// src/lib/types/validation.ts
// Create this new file

export interface ValidationRule {
    type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
    value?: any;
    message: string;
    validator?: (value: any) => boolean;
  }
  
  export interface ValidationError {
    field: string;
    message: string;
  }
  
  export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
  }
  
  export interface FieldValidation {
    [fieldName: string]: ValidationRule[];
  }