import React, { useRef, useState } from 'react'
import { z } from 'zod'

const trendsSchema = z.object({
  title: z.string(),
  url: z.string(),
  views_per_hour: z.coerce.number(),
  total_views: z.coerce.number(),
})

type Trends = z.infer<typeof trendsSchema>

const home = () => {
  const [results, setResults] = useState<Array<Trends>>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string>('')

  const url = 'https://yttrend-server.onrender.com/search'
  const resultsUrl = 'https://yttrend-server.onrender.com/results'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const query = inputRef.current?.value
    if (!query) {
      throw new Error('Please enter a valid input')
    }
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: query }),
      })
      const data = await response.json()
      if (data.results_count && data.results_count > 0) {
        setError('')
        handleResults()
      } else {
        setError(data.message)
        setResults([])
      }
    } catch (error) {
      console.log(`Error ${error}`)
    }
  }

  const handleResults = async () => {
    try {
      const resp = await fetch(resultsUrl)
      const rawData = await resp.json()
      const trends = trendsSchema.array().safeParse(rawData.results)
      if (trends.success) {
        console.log(trends.data)
        setResults(trends.data)
      } else {
        console.error('Validation failed', trends.error)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|v=)([^&/]+)/)
    return match ? match[1] : null
  }
  return (
    <section className='min-h-[100vh] flex flex-col items-center '>
      <h1 className='text-center text-4xl font-bold p-8'>Youtube Trends</h1>
      <form action='pl-[25%]' onSubmit={handleSubmit}>
        <input
          type='text'
          name='text'
          ref={inputRef}
          onChange={(e) => e.target.value}
          className='text-center border border-gray-200 py-1'
        />
        <button className='bg-gray-400 px-3 py-1'>search</button>
      </form>
      <div className='py-14 px-4 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12'>
        {error && <p className='text-red-500 text-center'>{error}</p>}
        {results.map((result, index) => {
          const { title, url, views_per_hour, total_views } = result
          return (
            <div key={index} className=''>
              <div className='bg-gray-400 p-8 text-start rounded-2xl w-full'>
                <h3 className='py-3 font-bold'>{title}</h3>
                <iframe
                  className='w-full h-64 rounded-2xl'
                  src={`https://www.youtube-nocookie.com/embed/${extractVideoId(
                    url
                  )}?autoplay=0&mute=1`}
                  title={title}
                  frameBorder='0'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                />
                <div className='flex gap-4 text-gray-700 py-2'>
                  <p>Views per hour: {views_per_hour}</p>
                  <p>Total views: {total_views}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default home
