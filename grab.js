import { EPGGrabber } from 'epg-grabber'
import fs from 'fs'

const grabber = new EPGGrabber()

const channels = [
  {
    site: 'tvpassport.com',
    site_id: 'tv-listings/stations/cartoon-network-usa-east/237',
    xmltv_id: 'CartoonNetworkEast.us',
    name: 'Cartoon Network East',
    lang: 'en'
  },
  {
    site: 'tvpassport.com',
    site_id: 'tv-listings/stations/adult-swim-east/3089',
    xmltv_id: 'AdultSwimEast.us',
    name: 'Adult Swim East',
    lang: 'en'
  }
]

async function run() {
  console.log('Fetching EPG data...')
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<tv>'
  
  for (const channel of channels) {
    console.log(`Grabbing ${channel.name}...`)
    const result = await grabber.fetch(channel)
    if (result && result.xml) {
      xml += result.xml
    }
  }
  
  xml += '\n</tv>'
  
  fs.mkdirSync('CN', { recursive: true })
  fs.writeFileSync('CN/AS.xml', xml)
  console.log('CN/AS.xml successfully updated!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
