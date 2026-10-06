/// <reference types="vite/client" />
/// <reference types="google.maps" />

interface ImportMetaEnv {
	readonly VITE_TRAFIKLAB_GTFS_RT_KEY?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
