import fs from 'fs'

const channels = [
  {
    stationId: '237',
    xmltv_id: 'CartoonNetworkEast.us',
    name: 'Cartoon Network East'
  },
  {
    stationId: '3089',
    xmltv_id: 'AdultSwimEast.us',
    name: 'Adult Swim East'
  }
]

function formatXmlDate(timestamp) {
  const date = new Date(timestamp * 1000)
  const pad = (n) => String(n).padStart(2, '0')
  const yyyy = date.getUTCFullYear()
  const mm = pad(date.getUTCMonth() + 1)
  const dd = pad(date.getUTCDate())
  const hh = pad(date.getUTCHours())
  const min = pad(date.getUTCMinutes())
  const ss = pad(date.getUTCSeconds())
  return `${yyyy}${mm}${dd}${hh}${min}${ss} +0000`
}

async function fetchStationData(stationId) {
  const today = new Date().toISOString().split('T')[0]
  const url = `https://www.tvpassport.com/index.php/subchannel/grid/${stationId}/${today}`

  const res = await fetch(url, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch station ${stationId}: HTTP ${res.status}`)
  }

  return await res.json()
}

async function run() {
  console.log('Fetching EPG data from TVPassport API...')

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<tv>'

  for (const ch of channels) {
    xml += `\n  <channel id="${ch.xmltv_id}">\n    <display-name>${ch.name}</display-name>\n  </channel>`
  }

  for (const ch of channels) {
    console.log(`Processing ${ch.name}...`)
    try {
      const data = await fetchStationData(ch.stationId)
      const listings = data.listings || []

      for (const item of listings) {
        const startStr = formatXmlDate(item.unix_start_time)
        const stopStr = formatXmlDate(item.unix_end_time)
        const title = (item.show_name || item.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
        const desc = (item.description || item.episode_title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')

        xml += `\n  <programme start="${startStr}" stop="${stopStr}" channel="${ch.xmltv_id}">`
        xml += `\n    <title lang="en">${title}</title>`
        if (desc) {
          xml += `\n    <desc lang="en">${desc}</desc>`
        }
        xml += `\n  </programme>`
      }
    } catch (err) {
      console.error(`Error processing ${ch.name}:`, err.message)
    }
  }

  xml += '\n</tv>\n'

  fs.mkdirSync('CN', { recursive: true })
  fs.writeFileSync('CN/AS.xml', xml)
  console.log('CN/AS.xml successfully updated!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
