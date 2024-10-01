module.exports = load_dataset

function load_dataset({ internal_state, dataset } = {}) {
  const dataset_type = Object.prototype.toString.call( dataset )
  let dataset_to_import

  switch( dataset_type ){
    case '[object Object]':
      dataset_to_import = dataset
    break

    case '[object String]':
    case '[object Array]':
      dataset_to_import = {}

      for( var key in dataset ){
        dataset_to_import[ key ] = dataset[ key ]
      }
    break

    default:
      throw new Error( 'unknown dataset type: "'+ dataset_type + '". expected array, object or string' )
  }

  internal_state.dataset = dataset_to_import
}
