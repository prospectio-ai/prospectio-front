import { useHandleSignInCallback } from '@logto/react';

const Callback = () => {
  useHandleSignInCallback(() => {
    // Navigate to root path when finished
    globalThis.location.href = '/';
  });

  return null;
};

export default Callback;