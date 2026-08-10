import fs from 'fs'

const EPG_URL = 'https://iptv-org.github.io/epg/guides/us/tvpassport.com.epg.xml'

async function run() {
  console.log('Fetching live EPG XML feed...')

  const res = await fetch(EPG_URL)
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status} while fetching EPG feed`)
  }

  const fullXml = await res.text()

  // Filter or save the guide data
  fs.mkdirSync('CN', { recursive: true })
  fs.writeFileSync('CN/AS.xml', fullXml)
  console.log('CN/AS.xml successfully updated with live guide data!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
