import fs from 'fs'

// Verified feed URL for US channels from iptv-org
const EPG_URL = 'https://iptv-org.github.io/epg/guides/us.xml'

async function run() {
  console.log('Fetching live US EPG XML feed...')

  const res = await fetch(EPG_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  })

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status} while fetching EPG feed`)
  }

  const fullXml = await res.text()

  // Ensure output directory exists
  fs.mkdirSync('CN', { recursive: true })
  
  // Write full EPG data so IPTV players can parse all valid channel listings
  fs.writeFileSync('CN/AS.xml', fullXml)
  console.log('CN/AS.xml successfully updated with live guide data!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
