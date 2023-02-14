package types

type DownloadableAuthor struct {
	Name string `json:"name"`
	Icon string `json:"icon"`
	URL  string `json:"url"`
}
type Downloadable struct {
	Title      string             `json:"title"`
	Duration   int                `json:"duration"`
	UploadedAt int                `json:"uploadedAt"`
	Views      int                `json:"views"`
	Thumbnail  string             `json:"thumbnail"`
	Author     DownloadableAuthor `json:"author"`
	URL        string             `json:"url"`
	Embed      string             `json:"embed"`
}
