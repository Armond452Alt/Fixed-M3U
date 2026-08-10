import * as cheerio from 'cheerio'
import fs from 'fs'

const channels = [
  {
    site_id: 'tv-listings/stations/cartoon-network-usa-east/237',
    xmltv_id: 'CartoonNetworkEast.us',
    name: 'Cartoon Network East'
  },
  {
    site_id: 'tv-listings/stations/adult-swim-east/3089',
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
  const url = `https://www.tvpassport.com/${channel.site_id}`
  console.log(`Fetching ${channel.name} from ${url}...`)

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status} when fetching ${channel.name}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)
  const programs = []

  $('.station-listing, .live-item, div[data-st]').each((_, el) => {
    const title = $(el).find('.title, .show-title, a.th-title').text().trim()
    const desc = $(el).find('.description, .show-description').text().trim()
    const startTimeAttr = $(el).attr('data-st') || $(el).data('st')

    if (title && startTimeAttr) {
      const startTime = new Date(parseInt(startTimeAttr, 10) * 1000)
      programs.push({
        title,
        desc,
        start: startTime
      })
    }
  })

  return programs
}

async function run() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<tv>'

  for (const channel of channels) {
    xml += `\n  <channel id="${channel.xmltv_id}">\n    <display-name>${channel.name}</display-name>\n  </channel>`
  }

  for (const channel of channels) {
    try {
      const programs = await scrapeChannel(channel)

      for (let i = 0; i < programs.length; i++) {
        const prog = programs[i]
        const nextProg = programs[i + 1]
        const stopTime = nextProg
          ? nextProg.start
          : new Date(prog.start.getTime() + 30 * 60 * 1000)

        const startStr = formatXmlDate(prog.start)
        const stopStr = formatXmlDate(stopTime)

        xml += `\n  <programme start="${startStr}" stop="${stopStr}" channel="${channel.xmltv_id}">`
        xml += `\n    <title lang="en">${prog.title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</title>`
        if (prog.desc) {
          xml += `\n    <desc lang="en">${prog.desc.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</desc>`
        }
        xml += `\n  </programme>`
      }
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
