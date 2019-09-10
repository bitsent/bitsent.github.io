try {
  navigator.registerProtocolHandler(
    "bitcoin",
    "https://bitsent.net/bitcoin-uri.html?req=%s",
    "BitSent"
  );
} catch (error) {
  console.error(error);
}