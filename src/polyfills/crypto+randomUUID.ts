if (!("randomUUID" in crypto)) {
  (crypto as Crypto).randomUUID = () => {
    return (String(1e7) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        Number(c) ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))
      ).toString(16)
    ) as `${string}-${string}-${string}-${string}-${string}`;
  };
}
