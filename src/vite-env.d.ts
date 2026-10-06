/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_OPS_DATA_SOURCE?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
