var create_hooks = require('cjs-sync-hooks');

module.exports = function( given_collection ){
  if( given_collection ){
    var collection_to_import = {},
        given_collection_type;

    given_collection_type = Object.prototype.toString.call( given_collection );

    switch( given_collection_type ){
      case '[object Object]':
        collection_to_import = given_collection;
      break;

      case '[object String]':
      case '[object Array]':
        for( var key in given_collection ){
          collection_to_import[ key ] = given_collection[ key ];
        }
      break;

      default:
        throw new Error( 'unknown collection type: "'+ given_collection_type + '". expected array, object or string' );
    }
  }

  var collection = given_collection ? collection_to_import : {},
      collection_keys = Object.keys( collection ),
      hooks = create_hooks(),
      indexes = {},
      api = {};

  api.keys = list_keys;
  api.get = get_entry_by_key;
  api.add = add_entry_by_key;
  api.del = remove_entry_by_key;
  api.update = update_entry_by_key;
  api.add_index = add_index;
  api.del_index = remove_index;
  api.indexes = list_indexes;
  api.index_exists = index_exists;
  api.index_get = get_entries_by_index;
  api.intersect_indexes = intersect_indexes;
  api.hooks = hooks;

  hooks.add( 'key-created', 'update-collection-keys-cache', function( details ){
    collection_keys.push( details.key );
  });

  hooks.add( 'key-deleted', 'update-collection-keys-cache', function( details ){
    var index_to_delete = collection_keys.indexOf( details.key );
    collection_keys.splice( index_to_delete, 1 );
  });

  hooks.add( 'key-created', 'index-new-entry', function( details ){
    var indexers = Object.keys( indexes ),
        entry_key = details.key,
        entry = details.val;

    indexers.forEach( function( name ){
      var index = indexes[ name ],
          indexer = index.indexer,
          matches = index.keys;

      indexer( entry, function index_entry_if_new(){
        if( matches.indexOf( entry_key ) === -1 ) matches.push( entry_key );
      });
    });
  });

  hooks.add( 'key-deleted', 'remove-from-indexes', function( details ){
    var indexers = Object.keys( indexes ),
        entry_key = details.key;

    indexers.forEach( function delete_entry_if_exists( name ){
      var index = indexes[ name ],
          indexer = index.indexer,
          matches = index.keys,
          entry_index = matches.indexOf( entry_key );

      if( entry_index > -1 ) matches.splice( entry_index, 1 );
    });
  });

  hooks.add( 'key-updated', 'update-indexes', function( details ){
    var indexers = Object.keys( indexes ),
        entry_key = details.key,
        entry = details.val;

    indexers.forEach( function( name ){
      var index = indexes[ name ],
          indexer = index.indexer,
          matches = index.keys,
          entry_index = matches.indexOf( entry_key );

      indexer( entry, function delete_entry_if_exists(){
        if( matches.indexOf( entry_key ) > -1 ) matches.splice( entry_index, 1 );
      });
    });
  });

  hooks.add( 'index-created', 'populate-created-index', function( details ){
    var index_to_populate = indexes[ details.name ],
        indexer = index_to_populate.indexer,
        matches = index_to_populate.keys;

    collection_keys.forEach( function( entry_key ){
      var entry = collection[ entry_key ];

      indexer( entry, function index_entry_if_new(){
        if( matches.indexOf( entry_key ) === -1 ) matches.push( entry_key );
      });
    });
  });

  return api;

  function list_keys(){
    return collection_keys;
  };

  function list_indexes(){
    return Object.keys( indexes );
  };

  function get_entry_by_key( key ){
    if( ! collection.hasOwnProperty( key ) ) throw new Error( 'key "'+ key + '" not defined' );
    else return collection[ key ];
  };

  function add_entry_by_key( key, val ){
    if( collection.hasOwnProperty( key ) ) throw new Error( 'key "'+ key +'" already exists' );
    collection[ key ] = val;

    hooks.run( 'key-created', { key: key, val: val });
  };

  function remove_entry_by_key( key ){
    if( ! collection.hasOwnProperty( key ) ) throw new Error( 'key "'+ key +'" does not exist' );

    var value_on_deletion = collection[ key ];

    delete collection[ key ];

    hooks.run( 'key-deleted', { key: key, val: value_on_deletion });
  };

  function update_entry_by_key( key, current_val, next_val ){
    if( ! collection.hasOwnProperty( key ) ) throw new Error( 'key "'+ key +'" does not exist' );

    if( arguments.length == 2 ){
      next_val = current_val;
      current_val = collection[ key ];
    }

    if( collection[ key ] != current_val ) throw new Error( 'expected value for key "'+ key +'" is not current value' );

    collection[ key ] = next_val;

    hooks.run( 'key-updated', { key: key, val: collection[ key ] });
  };

  function add_index( name, indexer ){
    if( ! name || typeof name !== 'string' ) throw new Error( 'name is required and must be a string' );
    if( ! indexer || typeof indexer !== 'function' ) throw new Error( 'indexer is required and must be a function' );

    if( indexes.hasOwnProperty( name ) ) throw new Error( 'index "'+ name + '" is already registered' );

    indexes[ name ] = { indexer: indexer, keys: [] };

    hooks.run( 'index-created', { name: name });
  };

  function index_exists( name ){
    if( ! name || typeof name !== 'string' ) throw new Error( 'name is required and must be a string' );
    return indexes.hasOwnProperty( name );
  };

  function remove_index( name ){
    if( ! name || typeof name !== 'string' ) throw new Error( 'name is required and must be a string' );
    if( ! indexes.hasOwnProperty( name ) ) throw new Error( 'index "'+ name + '" does not exist' );

    var index_to_delete = indexes[ name ];

    index_to_delete.name = name;

    delete indexes[ name ];

    hooks.run( 'index-deleted', index_to_delete );
  };

  function get_entries_by_index( name ){
    if( ! name || typeof name !== 'string' ) throw new Error( 'name is required and must be a string' );
    if( ! indexes.hasOwnProperty( name ) ) throw new Error( 'index "'+ name + '" does not exist' );

    return indexes[ name ].keys;
  };

  function intersect_indexes( indexes_to_intersect ){
    if( ! indexes_to_intersect ) throw new Error( 'no indexes to intersect specified' );
    if( Object.prototype.toString.call( indexes_to_intersect ) !== '[object Array]' ) throw new Error( 'expected array of indexes to intersect' );
    if( indexes_to_intersect.length < 2 ) throw new Error( 'need at least two indexes to perform intersection' );

    var index_cache = {},
        shortest_list,
        results = [];

    indexes_to_intersect.forEach( function( name ){
      index_cache[ name ] = api.index_get( name );

      if( ! shortest_list ) shortest_list = name;
      else if( shortest_list.length > index_cache[ name ].length ) shortest_list = name;
    });

    index_cache[ shortest_list ].forEach( function( entry ){
      var found = 0;

      indexes_to_intersect.forEach( function( name ){
        if( name == shortest_list ) return;
        if( index_cache[ name ].indexOf( entry ) > -1 ) found += 1;
      });

      if( found == ( indexes_to_intersect.length - 1 ) ) results.push( entry );
    });

    return results;
  }
}