import grabber from 'epg-grabber'
import fs from 'fs'

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
  
  // High-level grabber method handles Channel instantiation internally
  const xml = await grabber.grab({ channels })
  
  fs.writeFileSync('CN/AS.xml', xml)
  console.log('CN/AS.xml successfully updated!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
