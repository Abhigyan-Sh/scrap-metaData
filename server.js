import express from 'express'
import fetch from 'node-fetch'
import cheerio from 'cheerio'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

async function fetchHtml(url) {
    try {
        const response = await fetch(url)
        return await response.text()
    } catch (error) {
        console.error('Error fetching HTML:', error)
        throw error
    }
}

function extractYouTubeMetadata(html) {
    const $ = cheerio.load(html)
    const title = $('meta[property="og:title"]').attr('content')
    const description = $('meta[property="og:description"]').attr('content')
    const thumbnail = $('meta[property="og:image"]').attr('content')

    return { title, description, thumbnail }
}

app.post('/scrape-metadata', async (req, res) => {
    try {
        const { url } = req.body
        if (!url) {
            return res.status(400).json({ error: 'URL is required' })
        }

        const html = await fetchHtml(url)
        const metadata = extractYouTubeMetadata(html)
        res.json(metadata)
    } catch (error) {
        console.error('Error scraping metadata:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
