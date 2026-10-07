/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_DATA_PROVIDER_MODE?: string
	readonly VITE_OPS_DATA_SOURCE?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

interface Window {
	__NORDIC_OPS_CONFIG__?: { dataProviderMode?: string }
}
