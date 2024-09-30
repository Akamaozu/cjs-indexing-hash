const types = {
  string: {
    id: 'string',
    test: subject => typeof subject === 'string' 
  },
  object: {
    id: 'object',
    test: subject => Object.prototype.toString.call( subject ) === '[object Object]'
  },
  function: {
    id: 'function',
    test: subject => typeof subject === 'function'
  },
  array: {
    id: 'array',
    test: subject => Object.prototype.toString.call( subject ) === '[object Array]'
  }
}

module.exports = types
