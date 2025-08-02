import { useState } from 'react';

export function useSuccessState() {
  const [success, setSuccess] = useState(false);

  const resetSuccess = () => setSuccess(false);
  const setSuccessState = () => setSuccess(true);

  return {
    success,
    setSuccess: setSuccessState,
    resetSuccess,
  };
} 