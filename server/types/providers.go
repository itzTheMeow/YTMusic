package types

type MetadataProvider string
type SoundProvider string

const (
	MetaProviderSpotify    MetadataProvider = "spotify"
	MetaProviderSoundCloud MetadataProvider = "soundcloud"
	MetaProviderKonami     MetadataProvider = "konami"
	MetaProviderBandLab    MetadataProvider = "bandlab"
)
const (
	SoundProviderYouTube    SoundProvider = "youtube"
	SoundProviderSoundCloud SoundProvider = "soundcloud"
)
