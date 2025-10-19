import { useHandleSignInCallback } from '@logto/react';

const Callback = () => {
  useHandleSignInCallback(() => {
    // Navigate to root path when finished
    window.location.href = '/';
  });

  return null;
};

export default Callback;