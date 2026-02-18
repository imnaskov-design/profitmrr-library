import "server-only";

const INVITE_TOKEN_PREFIX = "pmrr_";

function randomHex(bytesLength = 24) {
  const bytes = new Uint8Array(bytesLength);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) {
    out += b.toString(16).padStart(2, "0");
  }
  return out;
}

export function createRegisterInviteToken() {
  return `${INVITE_TOKEN_PREFIX}${randomHex(24)}`;
}

