try {
  navigator.registerProtocolHandler(
    "bitcoin-req",
    "https://bitsent.net/bip275.html?req=%s",
    "BitSent"
  );
} catch (error) {
  console.error(error);
}
