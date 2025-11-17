export const generateAccountNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 900000 + 100000).toString();
  return `BA-${timestamp}-${random}`;
};

