package types

type MetadataProvider int
type SoundProvider int

const (
	MetaProviderSpotify MetadataProvider = iota
	MetaProviderSoundCloud
	MetaProviderKonami
	MetaProviderBandLab
)
const (
	SoundProviderYouTube SoundProvider = iota
	SoundProviderSoundCloud
)
