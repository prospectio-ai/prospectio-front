import { useHandleSignInCallback } from '@logto/react';

const Callback = () => {
  const { isLoading } = useHandleSignInCallback(() => {
    // Navigate to root path when finished
    window.location.href = '/';
  });

  return null;
};

export default Callback;