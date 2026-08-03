import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Heading, Input, TextArea } from '@dittolive/anvil'
import { useAddMovie } from '../hooks/useAddMovie'

// Create screen (route: /movies/new), mirroring rn-expo's Add Movie layout:
// a top bar (Cancel / title / Save) over two sections — "Basic Information"
// (title, year, plot) and "Additional Details" (poster URL, full plot,
// countries). Wired to useAddMovie (INSERT); the hook hardcodes rated: 'G'
// so new movies land inside the app's own G/PG sync subscription.
export function AddMovieScreen() {
  const navigate = useNavigate()
  const { addMovie } = useAddMovie()
  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [plot, setPlot] = useState('')
  const [poster, setPoster] = useState('')
  const [fullplot, setFullplot] = useState('')
  const [countries, setCountries] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const save = async () => {
    if (!title.trim()) return
    setIsSaving(true)
    setSaveError(null)
    try {
      const result = await addMovie({
        title: title.trim(),
        year: year.trim(),
        plot: plot.trim(),
        poster: poster.trim(),
        fullplot: fullplot.trim(),
        // Same convention as rn-expo: comma-separated text -> string array.
        countries: countries
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
      })
      // The insert result carries the generated document id — land the
      // user on their new movie's detail page.
      const newId = String(result.mutatedDocumentIDsV2()[0])
      navigate(`/movies/${encodeURIComponent(newId)}`)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to add movie')
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/')}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Heading level={2} className="!mb-0">
          Add Movie
        </Heading>
        <Button
          type="button"
          variant="primary"
          onClick={save}
          disabled={isSaving || !title.trim()}
        >
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      <Card>
        <Card.Header>
          <Heading level={4} className="!mb-0">
            Basic Information
          </Heading>
        </Card.Header>
        <Card.Body className="flex flex-col gap-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Required"
          />
          <Input
            label="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 2026"
          />
          <TextArea
            label="Plot"
            rows={3}
            value={plot}
            onChange={(e) => setPlot(e.target.value)}
          />
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <Heading level={4} className="!mb-0">
            Additional Details
          </Heading>
        </Card.Header>
        <Card.Body className="flex flex-col gap-4">
          <Input
            label="Poster URL"
            value={poster}
            onChange={(e) => setPoster(e.target.value)}
            placeholder="https://…"
          />
          <TextArea
            label="Full Plot"
            rows={4}
            value={fullplot}
            onChange={(e) => setFullplot(e.target.value)}
          />
          <Input
            label="Countries (comma-separated)"
            value={countries}
            onChange={(e) => setCountries(e.target.value)}
            placeholder="USA, Canada"
            errorMessage={saveError ?? undefined}
          />
          <p className="text-foreground-subtle text-xs">
            New movies are rated G automatically so they stay inside this
            demo's kid-friendly sync subscription.
          </p>
        </Card.Body>
      </Card>
    </div>
  )
}
