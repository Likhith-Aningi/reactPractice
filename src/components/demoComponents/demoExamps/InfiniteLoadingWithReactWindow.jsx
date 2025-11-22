import { useState, useEffect, useCallback, useRef } from 'react'
import { List } from 'react-window'

function InfiniteLoadingWithReactWindowComponent() {
  const [items, setItems] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const loadingRef = useRef(false)

  // Simulate fetching data from an API
  const fetchMoreData = useCallback(() => {
    if (loadingRef.current || !hasMore) return

    loadingRef.current = true
    setIsLoading(true)

    // Simulate API delay
    setTimeout(() => {
      const currentLength = items.length
      const newItems = Array.from({ length: 20 }, (_, i) => ({
        id: currentLength + i,
        text: `Item ${currentLength + i + 1}`,
        color: `hsl(${(currentLength + i) * 5}, 70%, 60%)`
      }))

      setItems(prev => [...prev, ...newItems])

      // Stop loading after 500 items for demo purposes
      if (currentLength + 20 >= 500) {
        setHasMore(false)
      }

      setIsLoading(false)
      loadingRef.current = false
    }, 800)
  }, [items.length, hasMore])

  // Load initial data
  useEffect(() => {
    fetchMoreData()
  }, []) // Only run once on mount

  // Row renderer for react-window v2
  const Row = ({ index, style, items, hasMore }) => {
    const item = items[index]

    // Show loading indicator at the end
    if (!item) {
      return (
        <div style={style} className="list-item loading-item">
          <div className="spinner"></div>
          <span>Loading more items...</span>
        </div>
      )
    }

    return (
      <div style={style} className="list-item">
        <div
          className="item-color"
          style={{ backgroundColor: item.color }}
        ></div>
        <span className="item-text">{item.text}</span>
        <span className="item-id">ID: {item.id}</span>
      </div>
    )
  }

  // Handle rows rendered to load more data
  const handleRowsRendered = ({ stopIndex }) => {
    // Load more when we're near the end (within 5 items)
    if (stopIndex >= items.length - 5) {
      if (!isLoading && hasMore) {
        fetchMoreData()
      }
    }
  }

  return (
    <div className="scroller-app">
      <header className="scroller-app-header">
        <h1>React Window + Infinite Loading Demo</h1>
        <div className="stats">
          <span>Total Items: {items.length}</span>
          {isLoading && <span className="loading-badge">Loading...</span>}
          {!hasMore && <span className="complete-badge">All Loaded!</span>}
        </div>
      </header>

      <div className="list-container">
        {items.length > 0 ? (
          <List
            rowCount={items.length + (hasMore ? 1 : 0)} // Add 1 for loading row
            rowHeight={50}
            rowComponent={Row}
            rowProps={{ items, hasMore }}
            onRowsRendered={handleRowsRendered}
            style={{ height: '20rem', width: '100%' }}
          />
        ) : (
          <div className="initial-loading">
            <div className="spinner"></div>
            <p>Loading initial data...</p>
          </div>
        )}
      </div>

      <footer className="scroller-app-footer">
        <p>Scroll down to load more items automatically</p>
        <p>Using <code>react-window</code> for virtualization</p>
      </footer>
    </div>
  )
}

export default InfiniteLoadingWithReactWindowComponent
