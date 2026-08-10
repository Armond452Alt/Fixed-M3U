import * as cheerio from 'cheerio'
import fs from 'fs'

const channels = [
  {
    stationId: '237',
    site_id: 'cartoon-network-usa-east/237',
    xmltv_id: 'CartoonNetworkEast.us',
    name: 'Cartoon Network East'
  },
  {
    stationId: '3089',
    site_id: 'adult-swim-east/3089',
    xmltv_id: 'AdultSwimEast.us',
    name: 'Adult Swim East'
  }
]

function formatXmlDate(date) {
  const pad = (n) => String(n).padStart(2, '0')
  const yyyy = date.getUTCFullYear()
  const mm = pad(date.getUTCMonth() + 1)
  const dd = pad(date.getUTCDate())
  const hh = pad(date.getUTCHours())
  const min = pad(date.getUTCMinutes())
  const ss = pad(date.getUTCSeconds())
  return `${yyyy}${mm}${dd}${hh}${min}${ss} +0000`
}

async function scrapeChannel(channel) {
  const today = new Date().toISOString().split('T')[0]
  const url = `https://www.tvpassport.com/tv-listings/stations/${channel.site_id}?date=${today}`
  console.log(`Fetching ${channel.name} from ${url}...`)

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${channel.name}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)
  const programs = []

  $('.station-listing, .live-item, .st-row, div.listing').each((_, el) => {
    const title = $(el).find('.title, .show-title, a[href*="/tv-shows/"]').text().trim()
    const desc = $(el).find('.description, .show-description, .sub-title').text().trim()
    const timeText = $(el).find('.time, .show-time').text().trim()

    if (title) {
      programs.push({ title, desc, timeText })
    }
  })

  // Fallback selector for main TV listings matrix if custom rows are empty
  if (programs.length === 0) {
    $('a[href*="/tv-shows/"]').each((_, el) => {
      const title = $(el).text().trim()
      const container = $(el).closest('div, td, li')
      const desc = container.find('.description, .sub-title').text().trim()
      if (title && !programs.some((p) => p.title === title)) {
        programs.push({ title, desc })
      }
    })
  }

  console.log(`Found ${programs.length} programs for ${channel.name}`)
  return programs
}

async function run() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<tv>'

  for (const channel of channels) {
    xml += `\n  <channel id="${channel.xmltv_id}">\n    <display-name>${channel.name}</display-name>\n  </channel>`
  }

  const now = new Date()

  for (const channel of channels) {
    try {
      const programs = await scrapeChannel(channel)

      programs.forEach((prog, i) => {
        const startTime = new Date(now.getTime() + i * 30 * 60 * 1000)
        const stopTime = new Date(now.getTime() + (i + 1) * 30 * 60 * 1000)

        const startStr = formatXmlDate(startTime)
        const stopStr = formatXmlDate(stopTime)

        const cleanTitle = prog.title.replace(/&/g, '&amp;').replace(/</g, '&lt;')
        const cleanDesc = prog.desc ? prog.desc.replace(/&/g, '&amp;').replace(/</g, '&lt;') : ''

        xml += `\n  <programme start="${startStr}" stop="${stopStr}" channel="${channel.xmltv_id}">`
        xml += `\n    <title lang="en">${cleanTitle}</title>`
        if (cleanDesc) {
          xml += `\n    <desc lang="en">${cleanDesc}</desc>`
        }
        xml += `\n  </programme>`
      })
    } catch (err) {
      console.error(`Failed scraping ${channel.name}:`, err.message)
    }
  }

  xml += '\n</tv>\n'

  fs.mkdirSync('CN', { recursive: true })
  fs.writeFileSync('CN/AS.xml', xml)
  console.log('CN/AS.xml generated successfully!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
