import { sites } from 'epg-grabber'
import fs from 'fs'

async function run() {
  console.log('Fetching EPG data...')

  const site = sites['tvpassport.com']

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

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<tv>'

  for (const channel of channels) {
    console.log(`Grabbing ${channel.name}...`)
    try {
      const url = site.url({ channel, date: new Date() })
      const res = await fetch(url)
      const buffer = await res.arrayBuffer()
      const programs = await site.parser({ buffer, channel, date: new Date() })

      xml += `\n  <channel id="${channel.xmltv_id}">\n    <display-name>${channel.name}</display-name>\n  </channel>`

      for (const prog of programs) {
        xml += `\n  <programme start="${prog.start}" stop="${prog.stop}" channel="${channel.xmltv_id}">`
        xml += `\n    <title lang="${channel.lang}">${prog.title}</title>`
        if (prog.description) xml += `\n    <desc lang="${channel.lang}">${prog.description}</desc>`
        xml += `\n  </programme>`
      }
    } catch (e) {
      console.error(`Failed to grab ${channel.name}:`, e.message)
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
