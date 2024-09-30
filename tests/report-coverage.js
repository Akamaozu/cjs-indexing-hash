const dotenv = require('dotenv')
const path = require('node:path')
const child_process = require('node:child_process')

dotenv.config({ path: path.join( __dirname, '../.env' ) })

child_process.exec( 'npm run test:coverage && nyc report --reporter=text-lcov | coveralls', ( error, stdout, stderr ) => {
  if (error) console.log({ stderr: typeof stderr }, stderr )
  else console.log({ stdout: typeof stdout }, stdout )
})
