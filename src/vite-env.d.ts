/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Hub URL — used only for the "Go to the Hub" link on the launch page. */
  readonly VITE_HUB_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
