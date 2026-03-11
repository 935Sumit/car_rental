import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCarContext } from '../context/CarContext'
import './SearchBar.css'

const SearchBar = () => {
  const [query, setQuery] = useState('')
  const { setSearchQuery } = useCarContext()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchQuery(query)
      navigate('/rent')
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search for rental cars, brands, models..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      <button type="submit" className="search-button">
        Search
      </button>
    </form>
  )
}

export default SearchBar
