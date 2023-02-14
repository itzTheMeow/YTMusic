package queue

type QueueAction int

const (
	QALibraryScan QueueAction = iota
)

type QueueItem struct {
	Type QueueAction `json:"type"`
}
