const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let scriptPromise = null;

function loadScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load Google Identity Services script"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Renders the official "Sign in with Google" button into `container`.
 * `onCredential` receives the raw JWT credential string on success.
 */
export async function renderGoogleButton(container, onCredential) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("Missing VITE_GOOGLE_CLIENT_ID - set it in your .env file. See README.md.");
  }
  await loadScript();
  /* global google */
  google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => onCredential(response.credential),
  });
  google.accounts.id.renderButton(container, {
    theme: "outline",
    size: "large",
    width: 320,
    text: "signin_with",
    shape: "pill",
  });
}

export function googleSignOut() {
  try {
    /* global google */
    google.accounts.id.disableAutoSelect();
  } catch {
    /* no-op if script never loaded */
  }
}
