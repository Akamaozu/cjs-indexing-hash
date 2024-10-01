module.exports = load_core_index_public_api

function load_core_index_public_api( internal_state ) {
	const { dataset, indexes, public_api } = internal_state ?? {}
  const { hooks } = public_api ?? {}

  if (!internal_state?.public_api) throw new Error( 'public api not found' )
  if (!internal_state.public_api.hooks) throw new Error( '"hooks" property not found in public api' )

  internal_state.public_api.indexes = get_index_keys
  internal_state.public_api.index_exists = index_exists
  internal_state.public_api.index_get = get_index_entries_by_key
  internal_state.public_api.add_index = add_index_by_key
  internal_state.public_api.del_index = delete_index_by_key
  internal_state.public_api.reindex = index_entries
  internal_state.public_api.intersect_indexes = intersect_indexes

  function get_index_keys() {
    return Object.keys( internal_state.indexes )
  }

  function index_exists( key ) {
    if (!key) throw new Error( 'index key not specified' )
    if (typeof key !== 'string') throw new Error( 'index key must be a string' )

    return internal_state.indexes.hasOwnProperty( key )
      ? true
      : false
  }

  function get_index_entries_by_key( key ) {
    if (!key) throw new Error( 'index key not specified' )
    if (typeof key !== 'string') throw new Error( 'index key must be a string' )
    if (!internal_state.public_api.index_exists( key )) throw new Error( `index "${ key }" not found` )

    return internal_state.indexes[ key ].keys
  }

  function add_index_by_key( key, indexer ) {
    if (!key) throw new Error( 'index key not specified' )
    if (typeof key !== 'string') throw new Error( 'index key must be a string' )
    if (!indexer) throw new Error( `indexer function for "${ key }" not specified` )
    if (typeof indexer !== 'function') throw new Error( 'expected indexer to be a function' )
    if (internal_state.indexes.hasOwnProperty( key )) throw new Error( `index "${ key }" already exists` )

    internal_state.indexes[ key ] = {
      indexer,
      keys: [],
    }

    internal_state.public_api.hooks.run( 'index-created', { name: key })
  }

  function delete_index_by_key( key ) {
    if (!key) throw new Error( 'index key not specified' )
    if (typeof key !== 'string') throw new Error( 'index key must be a string' )
    if (!internal_state.indexes.hasOwnProperty( key )) throw new Error( `index key "${ key }" does not exist` )

    const index_to_delete = {
      name: key,
      ...internal_state.indexes[ key ],
    }

    delete internal_state.indexes[ key ]

    hooks.run( 'index-deleted', index_to_delete )
  }

  function index_entries({
    key: target_key,
    keys: target_keys,
    index: target_index,
    indexes: target_indexes
  } = {}) {
    let indexes_to_run
    let keys_to_index

    if (target_indexes) indexes_to_run = target_indexes
    else if (target_index) indexes_to_run = [ target_index ]
    else indexes_to_run = internal_state.public_api.indexes()

    if (target_keys) keys_to_index = target_keys
    else if (target_key) keys_to_index = [ target_key ]
    else keys_to_index = internal_state.public_api.keys()

    indexes_to_run.forEach( index_key => {
      const index = internal_state.indexes[ index_key ]
      const { indexer } = index

      const indexed_entries_map = index.keys.reduce(( map, dataset_key, i ) => {
        map[ dataset_key ] = true
        return map
      }, {})

      keys_to_index.forEach( dataset_key => {
        const entry = internal_state.dataset[ dataset_key ]
        const is_indexed = indexed_entries_map.hasOwnProperty( dataset_key )
        let should_be_indexed = false

        indexer( entry, () => {
          should_be_indexed = true
        })

        if (should_be_indexed && !is_indexed) index.keys.push( dataset_key )
        else if (!should_be_indexed && is_indexed) index.keys.splice( index.keys.indexOf( dataset_key ), 1 )
      })
    })
  }

  function intersect_indexes( indexes_to_intersect ) {
    if (!indexes_to_intersect) throw new Error( 'no indexes to intersect specified' )
    if (Object.prototype.toString.call( indexes_to_intersect ) !== '[object Array]') throw new Error( 'expected array of indexes to intersect' )
    if (indexes_to_intersect.length < 2) throw new Error( 'need at least two indexes to perform intersection' )

    const index_cache = {}
    const results = []
    let shortest_list

    indexes_to_intersect.forEach( key => {
      index_cache[ key ] = internal_state.public_api.index_get( key )

      if (!shortest_list) shortest_list = key
      else if (index_cache[ shortest_list ].length > index_cache[ key ].length) shortest_list = key
    })

    index_cache[ shortest_list ].forEach( entry => {
      let found = 0

      indexes_to_intersect.forEach( index_key => {
        if( index_key == shortest_list ) return
        if( index_cache[ index_key ].indexOf( entry ) > -1) found += 1
      })

      if( found == ( indexes_to_intersect.length - 1 ) ) results.push( entry )
    })

    return results
  }
}
