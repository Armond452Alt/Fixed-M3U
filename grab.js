import { EPGGrabber, Channel } from 'epg-grabber'
import fs from 'fs'

const grabber = new EPGGrabber()

// Use Channel.from() to create valid Channel instances that match the internal validation
const channels = [
  Channel.from({
    site: 'tvpassport.com',
    site_id: 'tv-listings/stations/cartoon-network-usa-east/237',
    xmltv_id: 'CartoonNetworkEast.us',
    name: 'Cartoon Network East',
    lang: 'en'
  }),
  Channel.from({
    site: 'tvpassport.com',
    site_id: 'tv-listings/stations/adult-swim-east/3089',
    xmltv_id: 'AdultSwimEast.us',
    name: 'Adult Swim East',
    lang: 'en'
  })
]

async function run() {
  console.log('Fetching EPG data...')
  
  // Pass the channels inside the config object expected by EPGGrabber
  const xml = await grabber.grab({ channels })
  
  fs.mkdirSync('CN', { recursive: true })
  fs.writeFileSync('CN/AS.xml', xml)
  console.log('CN/AS.xml successfully updated!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
