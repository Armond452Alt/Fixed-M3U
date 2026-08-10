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
  const xml = await grabber.grab({ channels })
  fs.writeFileSync('CN/AS.xml', xml)
}

run().catch(console.error)
