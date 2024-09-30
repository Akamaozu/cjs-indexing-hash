const assert = require('node:assert')
const { describe, it } = require('node:test')

const INDEXING_HASH_PROPERTIES = require('../data/indexing-hash-properties')
const types = require('../data/types')

const superheroes_dataset = require('./data/superheroes')

const create_indexing_hash = require('../index')

describe( 'main export - "create_indexing_hash"', () => {
	it( 'is a function', () => {
		assert.equal( is_property_type({ type: 'function', subject: create_indexing_hash }), true, 'main export is not a function' )
	})

  describe( 'create_indexing_hash()', () => {
    it( 'returns an indexing hash instance', () => {
      const indexing_hash = create_indexing_hash()
      assert.equal( is_indexing_hash_instance( indexing_hash ), true )
    })

    it( 'executes if first argument type is none, string, array or object', () => {
      const execution_errors = executes_with_type({
        subject: create_indexing_hash,
        types_map: {
          none: { success: true, args: [] },
          string: { success: true, args: [ 'hello world' ] },
          object: { success: true, args: [ { type: 'greeting', message: 'hello world' } ] },
          array: { success: true, args: [ [ 'hello', 'world' ] ] },
          function: { success: false, args: [ () => 'hello world' ] },
          number: { success: false, args: [ 1001 ] },
        },
        expected_success: type => `main export threw an error when first argument type is "${ type }"`,
        expected_error: type => `main export executed when first argument type is "${ type }"`,
      })

      assert.equal( execution_errors.length, 0, `execution errors:\n - ${ execution_errors.join( '\n - ' ) }` )
    })
  })
})

describe( 'indexing_hash.keys', () => {
  const indexing_hash = create_indexing_hash()

  it( 'is a function', () => {
    assert.equal( is_property_type({ type: 'function', subject: indexing_hash.keys }), true, '"keys" is not a function' )
  })

  describe( 'indexing_hash.keys()', () => {
    it( 'returns an array of valid keys in the dataset', () => {
      const dataset_keys = Object.keys( superheroes_dataset )

      const indexing_hash = create_indexing_hash( superheroes_dataset )
      const indexing_hash_keys = indexing_hash.keys()

      dataset_keys.forEach( key => {
        let key_exists = indexing_hash_keys.indexOf( key ) > -1
          ? true
          : false

        assert.equal( key_exists, true, `key "${ key }" not found` )
      })

      const invalid_keys = indexing_hash_keys
        .filter( key => !superheroes_dataset.hasOwnProperty( key ) )

      assert.equal( invalid_keys.length, 0, `found ${ invalid_keys.length } invalid keys: "${ invalid_keys.join('", "') }"` )
    })

    it( 'executes with no arguments given', () => {
      assert.equal( executes_without_error({ subject: indexing_hash.keys }), true, 'did not execute when given no arguments' )
    })
  })
})

describe( 'indexing_hash.get', () => {
  const indexing_hash = create_indexing_hash()

  it( 'is a function', () => {
    assert.equal( is_property_type({ type: 'function', subject: indexing_hash.get }), true, `"indexing_hash.get" is not a function` )
  })

  describe( 'indexing_hash.get()', () => {
    it( 'returns the value associated with entry key given', () => {
      const seed_dataset = { apple: 'red', orange: 'orange' }
      const indexing_hash = create_indexing_hash( seed_dataset )

      const valid_keys = indexing_hash.keys()
      if (valid_keys.length < 1) throw new Error( 'no valid keys for dataset found' )

      const key_to_get = valid_keys[ 0 ]
      const returned_value = indexing_hash.get( key_to_get )

      assert.equal( returned_value, seed_dataset[ key_to_get ], 'returned value is not the expected value' )
    })

    it( 'does not execute successfully if no argument is passed', () => {
      assert.equal( executes_without_error({ subject: indexing_hash.get }), false, '"indexing_hash.get" executed with no errors' )
    })

    it( 'does not execute if the first argument is not a valid dataset key', () => {
      const seed_dataset = {
        apple: { sweet: true },
        grape: { sweet: true },
        lemon: { sweet: false },
      }

      const valid_dataset_keys = Object.keys( seed_dataset )
      const indexing_hash = create_indexing_hash( seed_dataset )

      const invalid_dataset_keys = [
        'banana',
        'guava',
        'pear',
        null,
        undefined,
        {},
        true,
      ]

      const keys_to_check = [
        ...valid_dataset_keys,
        ...invalid_dataset_keys,
      ]
        .sort()
        .forEach( key_to_check => {
          const is_valid_key = valid_dataset_keys.indexOf( key_to_check ) > -1

          assert.equal(
            executes_without_error({ subject: indexing_hash.get, args: [ key_to_check ] }),
            is_valid_key,
            is_valid_key
              ? `"indexing_hash.get" did not execute when given a valid dataset key "${ key_to_check }"`
              : `"indexing_hash.get" executed when given an invalid dataset key "${ key_to_check }"`
          )
        })
    })
  })
})

describe( 'indexing_hash.add', () => {
  const indexing_hash = create_indexing_hash()

  it( 'is a function', () => {
    assert.equal( is_property_type({ type: 'function', subject: indexing_hash.add }), true, '"indexing_hash.add" is not a function' )
  })

  describe( 'indexing_hash.add()', () => {
    it( 'adds a new entry to the dataset', () => {
      const indexing_hash = create_indexing_hash()
      const entry_to_add = {
        key: 'greeting',
        value: 'hello world',
      }

      indexing_hash.add( entry_to_add.key, entry_to_add.value )

      const valid_keys = indexing_hash.keys()

      assert.equal( valid_keys.indexOf( entry_to_add.key ) > -1, true, 'entry was not added to indexing_hash' )
    })

    it( 'throws an error if the first argument is a valid dataset key', () => {
      const seed_dataset = {
        red: 'hot',
        yellow: 'warm',
        blue: 'cool',
      }

      let dataset_entry_created = false

      const indexing_hash = create_indexing_hash( seed_dataset )
      const valid_keys = Object.keys( seed_dataset )
      const random_valid_key_index = Math.floor( Math.random() * valid_keys.length )
      const random_valid_key = valid_keys[ random_valid_key_index ]

      assert.equal( executes_without_error({ subject: indexing_hash.add, args: [ random_valid_key, 'cold' ] }), false, '"indexing_hash.add" created entry even though key already existed in dataset' )
    })
  })
})

describe( 'indexing_hash.del', () => {
  const indexing_hash = create_indexing_hash()

  it( 'is a function', () => {
    assert.equal( is_property_type({ type: 'function', subject: indexing_hash.del }), true, '"indexing_hash.del" is not a function' )
  })

  describe( 'indexing_hash.del()', () => {
    it( 'removes an entry from dataset', () => {
      const indexing_hash = create_indexing_hash({ apple: 'red', orange: 'orange' })
      const valid_keys = indexing_hash.keys()

      if (valid_keys.length < 1) throw new Error( 'no valid keys in dataset' )

      const valid_key_to_delete = valid_keys[ 0 ]
      indexing_hash.del( valid_key_to_delete )

      const post_del_keys = indexing_hash.keys()
      assert.equal( post_del_keys.indexOf( valid_key_to_delete ) === -1, true, 'key to delete found in dataset after "indexing_hash.del"' )
    })

    it( 'throws an error if first argument is not a valid entry key', () => {
      const indexing_hash = create_indexing_hash()
      assert.equal( executes_without_error({ subject: indexing_hash.del, args: [ 'hello' ] }), false, '"indexing_hash.del" tried to remove a key that does not exist and no error was thrown' )
    })
  })
})

describe( 'indexing_hash.update', () => {
  const indexing_hash = create_indexing_hash()

  it( 'is a function', () => {
    assert.equal( is_property_type({ type: 'function', subject: indexing_hash.update }), true, '"indexing_hash.update" is not a function' )
  })

  describe( 'indexing_hash.update()', () => {
    it( 'updates the value associated with an existing dataset entry key', () => {
      const seed_dataset = { apple: 'red' }
      const indexing_hash = create_indexing_hash( seed_dataset )

      const valid_keys = indexing_hash.keys()
      if (valid_keys.length < 1) throw new Error( 'no entries in dataset' )

      const key_to_update = valid_keys[ 0 ]

      const initial_key_value = indexing_hash.get( key_to_update )
      const next_key_value = 'green'
      if (initial_key_value === next_key_value) throw new Error( 'different values needed for "indexing_hash.update" to test updating an entry' )

      indexing_hash.update( key_to_update, next_key_value )

      const updated_key_value = indexing_hash.get( key_to_update )
      
      assert.equal( initial_key_value !== updated_key_value, true, '"indexing_hash.update" did not update' )
      assert.equal( updated_key_value === next_key_value, true )
    })

    it( 'throws an error if the first argument is not a valid key', () => {
      const indexing_hash = create_indexing_hash()
      const valid_keys = indexing_hash.keys()
      const key_to_update = 'greeting'

      assert.equal( valid_keys.indexOf( key_to_update ), -1, 'key to update exists in dataset, expected it should not' )
      assert.equal( executes_without_error({ subject: indexing_hash.update, args: [ 'greeting', 'hi world' ] }), false, '"indexing_hash.update" successfully executed even though first argument is not a valid key' )
    })

    it( 'ensures specified key\'s current value equals second argument if third argument is specified', () => {
      const seed_dataset = { a: 'apple', b: 'ball', c: 'cat' }
      const indexing_hash = create_indexing_hash( seed_dataset )

      const specified_key = 'a'
      const next_value = 'avocado'

      assert.equal(
        executes_without_error({ subject: indexing_hash.update, args: [ specified_key, 'not expected value for key', next_value ] }),
        false,
        '"indexing_hash.update" did nto throw an error when given three arguments and the second arg did not match expected value'
      )

      indexing_hash.update( specified_key, seed_dataset[ specified_key ], next_value )

      const updated_value = indexing_hash.get( specified_key )

      assert.equal( updated_value, next_value )
    })
  })
})

describe( 'indexing_hash.indexes', () => {
  const indexing_hash = create_indexing_hash()

  it( 'is a function', () => {
    assert.equal( is_property_type({ type: 'function', subject: indexing_hash.indexes }), true, '"indexing_hash.indexes" is not a function' )
  })

  describe( 'indexing_hash.indexes()', () => {
    it( 'returns an array of all valid index ids', () => {
      const indexing_hash = create_indexing_hash()
      const indexes = indexing_hash.indexes()

      assert.equal( is_property_type({ type: 'array', subject: indexes }), true, 'return value from "indexing_hash.indexes" is not an array' )
    })
  })
})

describe( 'indexing_hash.add_index', () => {
  const indexing_hash = create_indexing_hash()

  it( 'is a function', () => {
    assert.equal( is_property_type({ type: 'function', subject: indexing_hash.add_index }), true, '"indexing_hash.add_index" is not a function' )
  })

  describe( 'indexing_hash.add_index()', () => {
    it( 'creates a new index on dataset', () => {
      const initial_indexes = indexing_hash.indexes()
      const index_to_create = {
        id: 'senior-citizen',
        indexer: ( entry, add_to_index ) => {
          if (entry?.age >= 65) add_to_index()
        }
      }

      if (initial_indexes.indexOf( index_to_create.id ) > -1) throw new Error( `index "${ index_to_create.id }" already exists` )

      indexing_hash.add_index( index_to_create.id, index_to_create.indexer )

      const updated_indexes = indexing_hash.indexes()

      assert.equal( updated_indexes.indexOf( index_to_create.id ) > -1, true )
    })

    it( 'throws an error if no arguments are provided', () => {
      assert.equal( executes_without_error({ subject: indexing_hash.add_index }), false, '"indexing_hash.add_index" executed with no errors when no arguments were given' )
    })

    it( 'throws an error if the first argument given is not a string', () => {
      const indexing_hash = create_indexing_hash()

      const even_numbers_indexer = ( entry, add_to_index ) => {
        if (entry % 2 === 0) add_to_index()
      }

      const argument_types = {
        none: { args: [ undefined, even_numbers_indexer ], success: false },
        string: { args: [ 'even-numbers', even_numbers_indexer ], success: true },
        object: {
          args: [ { message: 'even-numbers' }, even_numbers_indexer ],
          success: false,
        },
        array: { args: [ [ 'even-numbers' ], even_numbers_indexer ], success: false },
        number: { args: [ 1001, even_numbers_indexer ], success: false },
      }

      const execution_errors = executes_with_type({
        subject: indexing_hash.add_index,
        types_map: argument_types,
        expected_success: type => `"indexing_hash.add_index" did not execute when first argument type is "${ type }"`,
        expected_error: type => `"indexing_hash.add_index" executed when first argument type is "${ type }"`,
      })

      assert.equal( execution_errors.length, 0, `execution errors: \n- ${ execution_errors.join('\n- ') }` )
    })

    it( 'throws an error if the first argument is an existing index name', () => {
      const indexing_hash = create_indexing_hash()
      const index_to_create = {
        name: 'even-numbers',
        indexer: ( entry, add_to_index ) => {
          if (entry % 2 === 0) add_to_index()
        }
      }

      indexing_hash.add_index( index_to_create.name, index_to_create.indexer )

      const existing_indexes = indexing_hash.indexes()
      const index_exists = existing_indexes.indexOf( index_to_create.name ) > -1
      assert.equal( index_exists, true )

      assert.equal(
        executes_without_error({ subject: indexing_hash.add_index, args: [ index_to_create.name, index_to_create.indexer ] }),
        false,
        '"indexing_hash.add_index" executed with no errors despite being given an existing index name as first argument'
      )
    })

    it( 'throws an error if the second argument is not a function', () => {
      const execution_errors = executes_with_type({
        subject: indexing_hash.add_index,
        types_map: {
          none: { success: false, args: [ 'even-numbers', null ] },
          array: { success: false, args: [ 'even-numbers', [ 'invalid-array' ] ] },
          string: { success: false, args: [ 'even-numbers', 'invalid-string' ] },
          object: { success: false, args: [ 'even-numbers', { key: 'invalid-object' } ] },
          number: { success: false, args: [ 'even-numbers', 1001 ] },
          function: { success: true, args: [ 'even-numbers', () => 'valid-function' ] },
        },
        expected_success: type => `"indexing_hash.add_index" did execute even though the second argument type is "${ type }"`,
        expected_error: type => `"indexing_hash.add_index" executed even though the second argument type is "${ type }" not "function"`,
      })

      assert.equal( execution_errors.length, 0, `execution errors:\n - ${ execution_errors.join( '\n - ' ) }` )
    })
  })
})

describe( 'indexing_hash.index_exists', () => {
  it( 'is a function', () => {
    const indexing_hash = create_indexing_hash()
    assert.equal( is_property_type({ type: 'function', subject: indexing_hash.index_exists }), true, '"indexing_hash.index_exists" is not a function' )
  })

  describe( 'indexing_hash.index_exists()', () => {
    it( 'returns true if first argument is an existing index name', () => {
      const indexing_hash = create_indexing_hash()
      const index_to_create = {
        name: 'even-numbers',
        indexer: ( entry, add_to_index ) => {
          if (entry % 2 === 0) add_to_index()
        }
      }

      indexing_hash.add_index( index_to_create.name, index_to_create.indexer )

      const existing_indexes = indexing_hash.indexes()
      const index_to_create_exists = existing_indexes.indexOf( index_to_create.name ) > -1

      assert.equal( index_to_create_exists, true, 'index to create not found in array of existing indexes'  )

      assert.equal( indexing_hash.index_exists( index_to_create.name ), true, 'did not return true when an existing index name was passed as first argument' )
    })

    it( 'returns false if first argument is not an existing index name', () => {
      const indexing_hash = create_indexing_hash()
      const index_name = 'odd-numbers'

      const existing_indexes = indexing_hash.indexes()
      const index_name_exists = existing_indexes.indexOf( index_name ) > -1

      assert.equal( index_name_exists, false, 'expected index name to not exist, but it exists' )
      assert.equal( indexing_hash.index_exists( index_name ), false, '"indexing_hash.index_exists" did not return false when first argument given is not an existing index name' )
    })

    it( 'throws an error if no argument is given', () => {
      const indexing_hash = create_indexing_hash()
      assert.equal( executes_without_error({ subject: indexing_hash.index_get }), false, '"indexing_hash.index_get" executed without error when no arguments were given' )
    })

    it( 'throws an error if the first argument given is not a string', () => {
      const indexing_hash = create_indexing_hash()

      indexing_hash.add_index( 'even-numbers', ( entry, add_to_index ) => {
        if (entry % 2 === 0) add_to_index()
      })

      const execution_errors = executes_with_type({
        subject: indexing_hash.index_exists,
        types_map: {
          none: { success: false, args: [] },
          string: { success: true, args: [ 'even-numbers' ] },
          object: { success: false, args: [ { message: 'even-numbers' } ] },
          array: { success: false, args: [ [ 'even-numbers' ] ] },
          number: { success: false, args: [ 1001 ] },          
          function: { success: false, args: [ () => 'even-numbers' ] },          
        },
        expected_success: type => `"indexing_hash.index_exists" did not execute when argument type is "${ type }"`,
        expected_error: type => `"indexing_hash.index_exists" executed when given argument type is "${ type }"`,
      })

      assert.equal( execution_errors.length, 0, `execution errors:\n - ${ execution_errors.join( '\n - ' ) }` )
    })

    it( 'throws an error if first argument given is not a valid index name', () => {
      const indexing_hash = create_indexing_hash()
      assert.equal( executes_without_error({ subject: indexing_hash.index_get, args: [ 'non-existent-index-name' ] }), false, '"indexing_hash.index_get" executed without error when first argument given is not a valid index name' )
    })
  })
})

describe( 'indexing_hash.index_get', () => {
  it( 'is a function', () => {
    const indexing_hash = create_indexing_hash()
    assert.equal( is_property_type({ type: 'function', subject: indexing_hash.index_get }), true, '"indexing_hash.index_get" is not a function' )
  })

  describe( 'indexing_hash.index_get()', () => {
    it( 'returns an array of entry keys in a specific index', () => {
      const indexing_hash = create_indexing_hash([ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ])

      indexing_hash.add_index( 'even-numbers', ( entry, add_index ) => {
        if (entry % 2 === 0) add_index()
      })

      const expected_indexed_entry_keys = indexing_hash
        .keys()
        .filter( entry_key => indexing_hash.get( entry_key ) % 2 === 0 )

      const indexed_entry_keys = indexing_hash.index_get( 'even-numbers' )

      indexed_entry_keys.forEach( entry_key => {
        assert.equal( expected_indexed_entry_keys.indexOf( entry_key ) > -1, true )
      })
 
      assert.equal( indexed_entry_keys.sort().toString(), expected_indexed_entry_keys.sort().toString(), 'keys returned by "indexing_hash.index_get" did not match expectations' )
    })

    it( 'throws an error if first argument is not a valid index name', () => {
      const indexing_hash = create_indexing_hash()
      assert.equal( executes_without_error({ subject: indexing_hash.index_get, args: [ 'invalid-index-name' ] }), false, '"indexing_hash.index_get" did not throw an error when first argument is not a valid index name' )
    })
  })
})

describe( 'indexing_hash.del_index', () => {
  it( 'is a function', () => {
    const indexing_hash = create_indexing_hash()
    assert.equal( is_property_type({ type: 'function', subject: indexing_hash.del_index }), true, '"indexing_hash.del_index" is not a function' )
  })

  describe( 'indexing_hash.del_index()', () => {
    it( 'removes an existing index from dataset', () => {
      const indexing_hash = create_indexing_hash()
      const index_to_create = {
        name: 'odd-numbers',
        indexer: (entry, add_to_index) => {
          if (entry % 2 === 1) add_to_index()
        }
      }

      indexing_hash.add_index( index_to_create.name, index_to_create.indexer )
      assert.equal( indexing_hash.index_exists( index_to_create.name ), true, '"indexing_hash.index_exists" did not return true for an existing index name' )

      indexing_hash.del_index( index_to_create.name )
      assert.equal( indexing_hash.index_exists( index_to_create.name ), false, '"indexing_hash.index_exists" did not return false for deleted index name' )
    })

    it( 'throws an error if the first argument given is not a string', () => {
      const indexing_hash = create_indexing_hash()

      indexing_hash.add_index( 'even-numbers', ( entry, add_to_index ) => {
        if (entry % 2 === 0) add_to_index()
      })

      const execution_errors = executes_with_type({
        subject: indexing_hash.del_index,
        types_map: {
          none: { success: false, args: [] },
          string: { success: true, args: [ 'even-numbers' ] },
          object: { success: false, args: [ { key: 'even-numbers' } ] },
          array: { success: false, args: [ [ 'even-numbers' ] ] },
          number: { success: false, args: [ 1001 ] },
          function: { success: false, args: [ () => 'even-numbers' ] },
        },
        expected_success: type => `"indexing_hash.del_index" did not execute when first argument type is "${ type }"`,
        expected_error: type => `"indexing_hash.del_index" executed when first argument type is "${ type }"`,
      })

      assert.equal( execution_errors.length, 0, `execution errors:\n - ${ execution_errors.join( '\n - ' ) }` )
    })

    it( 'throws an error if the first argument is not a valid index name', () => {
      const indexing_hash = create_indexing_hash()
      assert.equal( executes_without_error({ subject: indexing_hash.del_index, args: [ 'odd-numbers' ] }), false, '"indexing_hash.del_index" did not throw an error when the first argument given is not a valid index name' )
    })
  })
})

describe( 'indexing_hash.reindex', () => {
  it( 'is a function', () => {
    const indexing_hash = create_indexing_hash()
    assert.equal( is_property_type({ type: 'function', subject: indexing_hash.reindex }), true, '"indexing_hash.reindex" is not a function' )
  })

  describe( 'indexing_hash.reindex()', () => {
    it( 'recalculates all indexes for a specified entry', () => {
      const indexing_hash = create_indexing_hash( JSON.parse( JSON.stringify( superheroes_dataset )) )

      indexing_hash.add_index( 'has-super-strength', ( entry, add_to_index ) => {
        if (entry.has_super_strength) add_to_index()
      })

      indexing_hash.add_index( 'has-jet', ( entry, add_to_index ) => {
        if (entry.has_jet) add_to_index()
      })

      const pre_update_has_super_strength = indexing_hash.index_get( 'has-super-strength' ) 
      const pre_update_has_jet = indexing_hash.index_get( 'has-jet' )

      assert.equal( pre_update_has_super_strength.indexOf( 'batman' ) > -1, false ) 
      assert.equal( pre_update_has_jet.indexOf( 'batman' ) > -1, true )

      const batman = indexing_hash.get( 'batman' )
      batman.has_super_strength = true
      batman.has_jet = false

      const post_update_has_super_strength = indexing_hash.index_get( 'has-super-strength' ) 
      const post_update_has_jet = indexing_hash.index_get( 'has-jet' )

      assert.equal( post_update_has_super_strength.indexOf( 'batman' ) > -1, false ) 
      assert.equal( post_update_has_jet.indexOf( 'batman' ) > -1, true )

      indexing_hash.reindex({ key: 'batman' })

      const post_reindex_has_super_strength = indexing_hash.index_get( 'has-super-strength' ) 
      const post_reindex_has_jet = indexing_hash.index_get( 'has-jet' )

      assert.equal( post_reindex_has_super_strength.indexOf( 'batman' ) > -1, true ) 
      assert.equal( post_reindex_has_jet.indexOf( 'batman' ) > -1, false )
    })

    it( 'recalculates all indexes for multiple entries', () => {
      const indexing_hash = create_indexing_hash( JSON.parse( JSON.stringify( superheroes_dataset )) )

      indexing_hash.add_index( 'has-super-strength', ( entry, add_to_index ) => {
        if (entry.has_super_strength) add_to_index()
      })

      indexing_hash.add_index( 'has-jet', ( entry, add_to_index ) => {
        if (entry.has_jet) add_to_index()
      })

      const pre_update_has_super_strength = [ ...indexing_hash.index_get( 'has-super-strength' ) ]
      const pre_update_has_jet = [ ...indexing_hash.index_get( 'has-jet' ) ]

      assert.equal( pre_update_has_super_strength.indexOf( 'batman' ) > -1, false )
      assert.equal( pre_update_has_jet.indexOf( 'batman' ) > -1, true )
      assert.equal( pre_update_has_super_strength.indexOf( 'wonder_woman' ) > -1, true )
      assert.equal( pre_update_has_jet.indexOf( 'wonder_woman' ) > -1, true )

      const batman = indexing_hash.get( 'batman' )
      batman.has_super_strength = true
      batman.has_jet = false

      const wonder_woman = indexing_hash.get( 'wonder_woman' )
      wonder_woman.has_super_strength = false
      wonder_woman.has_jet = false

      const post_update_has_super_strength = [ ...indexing_hash.index_get( 'has-super-strength' ) ] 
      const post_update_has_jet = [ ...indexing_hash.index_get( 'has-jet' ) ]

      assert.equal( post_update_has_super_strength.indexOf( 'batman' ) > -1, false ) 
      assert.equal( post_update_has_jet.indexOf( 'batman' ) > -1, true )
      assert.equal( post_update_has_super_strength.indexOf( 'wonder_woman' ) > -1, true )
      assert.equal( post_update_has_jet.indexOf( 'wonder_woman' ) > -1, true )

      indexing_hash.reindex({ keys: [ 'batman', 'wonder_woman' ] })

      const post_reindex_has_super_strength = [ ...indexing_hash.index_get( 'has-super-strength' ) ]
      const post_reindex_has_jet = [ ...indexing_hash.index_get( 'has-jet' ) ]

      assert.equal( post_reindex_has_super_strength.indexOf( 'batman' ) > -1, true ) 
      assert.equal( post_reindex_has_jet.indexOf( 'batman' ) > -1, false )
      assert.equal( post_reindex_has_super_strength.indexOf( 'wonder_woman' ) > -1, false ) 
      assert.equal( post_reindex_has_jet.indexOf( 'wonder_woman' ) > -1, false )
    })

    it( 'recalculates a specified index for all entries', () => {
      const indexing_hash = create_indexing_hash( JSON.parse( JSON.stringify( superheroes_dataset )) )

      indexing_hash.add_index( 'has-super-strength', ( entry, add_to_index ) => {
        if (entry.has_super_strength) add_to_index()
      })

      indexing_hash.add_index( 'has-jet', ( entry, add_to_index ) => {
        if (entry.has_jet) add_to_index()
      })

      const pre_update_has_super_strength = indexing_hash.index_get( 'has-super-strength' ) 
      
      assert.equal( pre_update_has_super_strength.indexOf( 'batman' ) > -1, false )
      assert.equal( pre_update_has_super_strength.indexOf( 'superman' ) > -1, true )
      assert.equal( pre_update_has_super_strength.indexOf( 'wonder_woman' ) > -1, true )

      const batman = indexing_hash.get( 'batman' )
      batman.has_super_strength = true

      const wonder_woman = indexing_hash.get( 'wonder_woman' )
      wonder_woman.has_super_strength = false

      const superman = indexing_hash.get( 'superman' )
      superman.has_super_strength = false

      const post_update_has_super_strength = indexing_hash.index_get( 'has-super-strength' )

      assert.equal( post_update_has_super_strength.indexOf( 'batman' ) > -1, false )
      assert.equal( post_update_has_super_strength.indexOf( 'superman' ) > -1, true )
      assert.equal( post_update_has_super_strength.indexOf( 'wonder_woman' ) > -1, true )

      indexing_hash.reindex({ index: 'has-super-strength' })

      const post_reindex_has_super_strength = indexing_hash.index_get( 'has-super-strength' )

      assert.equal( post_reindex_has_super_strength.indexOf( 'batman' ) > -1, true )
      assert.equal( post_reindex_has_super_strength.indexOf( 'superman' ) > -1, false )
      assert.equal( post_reindex_has_super_strength.indexOf( 'wonder_woman' ) > -1, false )
    })

    it( 'recalculates multiple indexes for all entries', () => {
      const indexing_hash = create_indexing_hash( JSON.parse( JSON.stringify( superheroes_dataset )) )

      indexing_hash.add_index( 'has-super-strength', ( entry, add_to_index ) => {
        if (entry.has_super_strength) add_to_index()
      })

      indexing_hash.add_index( 'has-jet', ( entry, add_to_index ) => {
        if (entry.has_jet) add_to_index()
      })

      const pre_update_has_super_strength = indexing_hash.index_get( 'has-super-strength' ) 
      const pre_update_has_jet = indexing_hash.index_get( 'has-jet' )

      assert.equal( pre_update_has_super_strength.indexOf( 'batman' ) > -1, false )
      assert.equal( pre_update_has_jet.indexOf( 'batman' ) > -1, true )

      assert.equal( pre_update_has_super_strength.indexOf( 'superman' ) > -1, true )
      assert.equal( pre_update_has_jet.indexOf( 'superman' ) > -1, false )

      assert.equal( pre_update_has_super_strength.indexOf( 'wonder_woman' ) > -1, true )
      assert.equal( pre_update_has_jet.indexOf( 'wonder_woman' ) > -1, true )

      const batman = indexing_hash.get( 'batman' )
      batman.has_super_strength = true
      batman.has_jet = false

      const wonder_woman = indexing_hash.get( 'wonder_woman' )
      wonder_woman.has_super_strength = false
      wonder_woman.has_jet = false

      const superman = indexing_hash.get( 'superman' )
      superman.has_super_strength = false
      superman.has_jet = true

      const post_update_has_super_strength = indexing_hash.index_get( 'has-super-strength' )
      const post_update_has_jet = indexing_hash.index_get( 'has-jet' )

      assert.equal( post_update_has_super_strength.indexOf( 'batman' ) > -1, false )
      assert.equal( post_update_has_jet.indexOf( 'batman' ) > -1, true )

      assert.equal( post_update_has_super_strength.indexOf( 'superman' ) > -1, true )
      assert.equal( post_update_has_jet.indexOf( 'superman' ) > -1, false )

      assert.equal( post_update_has_super_strength.indexOf( 'wonder_woman' ) > -1, true )
      assert.equal( post_update_has_jet.indexOf( 'wonder_woman' ) > -1, true )

      indexing_hash.reindex({ indexes: [ 'has-jet', 'has-super-strength' ] })

      const post_reindex_has_super_strength = indexing_hash.index_get( 'has-super-strength' )
      const post_reindex_has_jet = indexing_hash.index_get( 'has-jet' )

      assert.equal( post_reindex_has_super_strength.indexOf( 'batman' ) > -1, true )
      assert.equal( post_reindex_has_jet.indexOf( 'batman' ) > -1, false )

      assert.equal( post_reindex_has_super_strength.indexOf( 'superman' ) > -1, false )
      assert.equal( post_reindex_has_jet.indexOf( 'superman' ) > -1, true )

      assert.equal( post_reindex_has_super_strength.indexOf( 'wonder_woman' ) > -1, false )
      assert.equal( post_reindex_has_jet.indexOf( 'wonder_woman' ) > -1, false )
    })

    it( 'recalculates all indexes for all entries', () => {
      const indexing_hash = create_indexing_hash( JSON.parse( JSON.stringify( superheroes_dataset )) )

      indexing_hash.add_index( 'has-super-strength', ( entry, add_to_index ) => {
        if (entry.has_super_strength) add_to_index()
      })

      indexing_hash.add_index( 'has-jet', ( entry, add_to_index ) => {
        if (entry.has_jet) add_to_index()
      })

      const pre_update_has_super_strength = indexing_hash.index_get( 'has-super-strength' ) 
      const pre_update_has_jet = indexing_hash.index_get( 'has-jet' )

      assert.equal( pre_update_has_super_strength.indexOf( 'batman' ) > -1, false )
      assert.equal( pre_update_has_jet.indexOf( 'batman' ) > -1, true )

      assert.equal( pre_update_has_super_strength.indexOf( 'superman' ) > -1, true )
      assert.equal( pre_update_has_jet.indexOf( 'superman' ) > -1, false )

      assert.equal( pre_update_has_super_strength.indexOf( 'wonder_woman' ) > -1, true )
      assert.equal( pre_update_has_jet.indexOf( 'wonder_woman' ) > -1, true )

      const batman = indexing_hash.get( 'batman' )
      batman.has_super_strength = true
      batman.has_jet = false

      const wonder_woman = indexing_hash.get( 'wonder_woman' )
      wonder_woman.has_super_strength = false
      wonder_woman.has_jet = false

      const superman = indexing_hash.get( 'superman' )
      superman.has_super_strength = false
      superman.has_jet = true

      const post_update_has_super_strength = indexing_hash.index_get( 'has-super-strength' )
      const post_update_has_jet = indexing_hash.index_get( 'has-jet' )

      assert.equal( post_update_has_super_strength.indexOf( 'batman' ) > -1, false )
      assert.equal( post_update_has_jet.indexOf( 'batman' ) > -1, true )

      assert.equal( post_update_has_super_strength.indexOf( 'superman' ) > -1, true )
      assert.equal( post_update_has_jet.indexOf( 'superman' ) > -1, false )

      assert.equal( post_update_has_super_strength.indexOf( 'wonder_woman' ) > -1, true )
      assert.equal( post_update_has_jet.indexOf( 'wonder_woman' ) > -1, true )

      indexing_hash.reindex()

      const post_reindex_has_super_strength = indexing_hash.index_get( 'has-super-strength' )
      const post_reindex_has_jet = indexing_hash.index_get( 'has-jet' )

      assert.equal( post_reindex_has_super_strength.indexOf( 'batman' ) > -1, true )
      assert.equal( post_reindex_has_jet.indexOf( 'batman' ) > -1, false )

      assert.equal( post_reindex_has_super_strength.indexOf( 'superman' ) > -1, false )
      assert.equal( post_reindex_has_jet.indexOf( 'superman' ) > -1, true )

      assert.equal( post_reindex_has_super_strength.indexOf( 'wonder_woman' ) > -1, false )
      assert.equal( post_reindex_has_jet.indexOf( 'wonder_woman' ) > -1, false )
    })

    it( 'throws an error if the first argument has a "keys" property and "keys" is not an array', () => {
      const indexing_hash = create_indexing_hash( JSON.parse( JSON.stringify( superheroes_dataset )))
      const valid_keys = indexing_hash.keys()
      const random_valid_key = valid_keys[ Math.floor( Math.random() * valid_keys.length ) ]

      indexing_hash.add_index( 'has-jet', ( entry, add_to_index ) => {
        if (entry.has_jet) add_to_index()
      })

      const execution_errors = executes_with_type({
        subject: indexing_hash.reindex,
        types_map: {
          number: { success: false, args: [ { keys: 1001 } ] },
          string: { success: false, args: [ { keys: `example=${ random_valid_key }` } ] },
          object: { success: false, args: [ { keys: { example: random_valid_key } } ] },
          function: { success: false, args: [ { keys: () => random_valid_key } ] },
          array: { success: true, args: [ { keys: [ random_valid_key ] } ] },
        },
        expected_success: type => `"indexing_hash.reindex" did not execute when argument type is "${ type }"`,
        expected_error: type => `"indexing_hash.reindex" executed when given argument type "${ type }"`,
      })

      assert.equal( execution_errors.length, 0, `execution errors:\n - ${ execution_errors.join( '\n - ' ) }` )
    })

    it( 'throws an error if the first argument has an "indexes" property and "indexes" is not an array', () => {
      const indexing_hash = create_indexing_hash( JSON.parse( JSON.stringify( superheroes_dataset )))

      indexing_hash.add_index( 'has-jet', ( entry, add_to_index ) => {
        if (entry.has_jet) add_to_index()
      })

      indexing_hash.add_index( 'has-super-strength', ( entry, add_to_index ) => {
        if (entry.has_super_strength) add_to_index()
      })

      const valid_indexes = indexing_hash.indexes()
      const random_valid_index = valid_indexes[ Math.floor( Math.random() * valid_indexes.length ) ]

      const execution_errors = executes_with_type({
        subject: indexing_hash.reindex,
        types_map: {
          number: { success: false, args: [ { indexes: 1001 } ] },
          string: { success: false, args: [ { indexes: `example=${ random_valid_index }` } ] },
          object: { success: false, args: [ { indexes: { example: random_valid_index } } ] },
          function: { success: false, args: [ { indexes: () => random_valid_index } ] },
          array: { success: true, args: [ { indexes: [ random_valid_index ] } ] },          
        },
        expected_success: type => `"indexing_hash.reindex" did not execute when first argument property "indexes" type is "${ type }"`,
        expected_error: type => `"indexing_hash.reindex" executed when first argument has property "indexes" and its type is "${ type }"`,
      })

      assert.equal( execution_errors.length, 0, `execution errors:\n - ${ execution_errors.join( '\n - ' ) }` )
    })
  })
})

describe( 'indexing_hash.intersect_indexes', () => {
  it( 'is a function', () => {
    const indexing_hash = create_indexing_hash()
    assert.equal( is_property_type({ type: 'function', subject: indexing_hash.intersect_indexes }), true, '"indexing_hash.intersect_indexes" is not a function' )
  })

  describe( 'indexing_hash.intersect_indexes()', () => {
    it( 'returns an array of entry keys that exist in all specified indexes', () => {
      const indexing_hash = create_indexing_hash( superheroes_dataset )

      indexing_hash.add_index( 'has-jet', ( entry, add_to_index ) => {
        if (entry?.has_jet) add_to_index()
      })

      indexing_hash.add_index( 'has-super-strength', ( entry, add_to_index ) => {
        if (entry?.has_super_strength) add_to_index()
      })

      const entry_has_jet = indexing_hash.index_get( 'has-jet' )
      const entry_has_super_strength = indexing_hash.index_get( 'has-super-strength' )
      const expected_intersected_indexes = entry_has_jet.filter( entry_key => entry_has_super_strength.indexOf( entry_key ) > -1 )
      const intersected_indexes = indexing_hash.intersect_indexes([ 'has-jet', 'has-super-strength' ])

      assert.equal( intersected_indexes.sort().toString(), expected_intersected_indexes.sort().toString() )
    })

    it( 'throws an error if first argument is not an array', () => {
      const indexing_hash = create_indexing_hash()

      indexing_hash.add_index( 'even-numbers', ( entry, add_to_index ) => {
        if (entry % 2 === 0) add_to_index()
      })

      indexing_hash.add_index( 'odd-numbers', ( entry, add_to_index ) => {
        if (entry % 2 === 1) add_to_index()
      })

      const execution_errors = executes_with_type({
        subject: indexing_hash.intersect_indexes,
        types_map: {
          none: { success: false, args: [] },
          string: { success: false, args: [ 'even-numbers, odd-numbers' ] },
          object: { success: false, args: [ { even_numbers: true, odd_numbers: true } ] },
          array: { success: true, args: [ [ 'even-numbers', 'odd-numbers' ] ] },
          number: { success: false, args: [ 1001 ] },
          function: { success: false, args: [ () => 'even-numbers, odd-numbers' ] },
        },
        expected_success: type => `"indexing_hash.intersect_indexes" did not execute when argument type is "${ type }"`,
        expected_error: type => `"indexing_hash.intersect_indexes" executed when given argument type "${ type }"`,
      })

      assert.equal( execution_errors.length, 0, `execution errors:\n - ${ execution_errors.join( '\n - ' ) }` )
    })

    it( 'throws an error if the array passed as first argument is an array that has less than two items', () => {
      const indexing_hash = create_indexing_hash()

      indexing_hash.add_index( 'even-numbers', ( entry, add_to_index ) => {
        if (entry % 2 === 0) add_to_index()
      })

      indexing_hash.add_index( 'odd-numbers', ( entry, add_to_index ) => {
        if (entry % 2 === 1) add_to_index()
      })

      assert.equal(
        executes_without_error({ subject: indexing_hash.intersect_indexes, args: [ [ 'even-numbers' ] ] }),
        false,
        '"indexing_hash.intersect_indexes" executed when first argument array has less than two items'
      )
    })
  })
})

describe( 'indexing hash behavior', () => {
  it( 'updates indexes when an entry is created using "indexing_hash.add"', () => {
    const indexing_hash = create_indexing_hash()

    indexing_hash.add_index( 'even-numbers', ( entry, add_to_index ) => {
      if (entry % 2 === 0) add_to_index()
    })

    assert.equal( indexing_hash.index_get( 'even-numbers' ).length, 0 )

    indexing_hash.add( '8', 8 )

    assert.equal( indexing_hash.index_get( 'even-numbers' ).length, 1 )
  })

  it( 'updates indexes when an entry is updated using "indexing_hash.update"', () => {
    const indexing_hash = create_indexing_hash({ '8': 8 })

    indexing_hash.add_index( 'odd-numbers', ( entry, add_to_index ) => {
      if (entry % 2 === 1) add_to_index()
    })

    assert.equal( indexing_hash.index_get( 'odd-numbers' ).length, 0 )

    indexing_hash.update( '8', 9 )

    assert.equal( indexing_hash.index_get( 'odd-numbers' ).length, 1 )
  })

  it( 'updates indexes when an entry is deleted using "indexing_hash.del"', () => {
    const indexing_hash = create_indexing_hash({ '8': 8, '9': 9 })

    indexing_hash.add_index( 'even-numbers', ( entry, add_to_index ) => {
      if (entry % 2 === 0) add_to_index()
    })

    assert.equal( indexing_hash.index_get( 'even-numbers' ).length, 1 )
    console.log({ pre_del_even_numbers: indexing_hash.index_get( 'even-numbers' ) })

    indexing_hash.del( '8' )
    indexing_hash.del( '9' )

    assert.equal( indexing_hash.index_get( 'even-numbers' ).length, 0 )
  })

  it( 'populates an index after using "indexing_hash.add_index" to create one', () => {
    const indexing_hash = create_indexing_hash( superheroes_dataset )

    indexing_hash.add_index( 'publisher-dc', ( entry, add_to_index ) => {
      if (entry.publisher === 'dc') add_to_index()
    })

    const expected_indexed_entry_keys = indexing_hash
      .keys()
      .filter( entry_key => indexing_hash.get( entry_key ).publisher === 'dc' )

    assert.equal(
      indexing_hash.index_get( 'publisher-dc' ).sort().toString(),
      expected_indexed_entry_keys.sort().toString()
    )
  })
})

function is_property_type({ type, subject } = {}) {
  if (!type) throw new Error( 'type is required' )
  if(!types[ type ]) throw new Error( `no model found for type "${ type }"` )

  return types[ type ].test( subject )
}

function is_indexing_hash_instance( subject ) {
  const expected_property_keys = Object.keys( INDEXING_HASH_PROPERTIES )

  let detected_difference_from_indexing_hash = false

  // ensure subject has every expected property, and they are the expected type
  expected_property_keys.forEach( expected_property => {
    // early exit if difference has already been detected
    if (detected_difference_from_indexing_hash) return

    // has expected property
    if (!subject.hasOwnProperty( expected_property )) {
      detected_difference_from_indexing_hash = true
      return
    }

    // property has expected type
    const expected_property_val = subject[ expected_property ]
    const expected_property_type = INDEXING_HASH_PROPERTIES[ expected_property ].type

    if (!types[ expected_property_type ].test( expected_property_val )) {
      detected_difference_from_indexing_hash = true
      return
    }
  })

  if (detected_difference_from_indexing_hash) return false

  // ensure subject has no unexpected properties
  const subject_unexpected_properties = Object
    .keys( subject )
    .filter( property => !INDEXING_HASH_PROPERTIES[ property ] )

  if (subject_unexpected_properties.length > 0) return false

  return true
}

function executes_without_error({ subject, args = [] } = {}) {
  if (typeof subject !== 'function') throw new Error( 'subject must be a function' )

  let executed = false
  try {
    subject.apply( null, args )
    executed = true
  }

  catch (exec_error) {}

  return executed
}

function executes_with_type({
  subject,
  args = [],
  types_map = {},
  expected_success,
  expected_error
} = {}) {
  if (typeof subject !== 'function') throw new Error( 'subject must be a function' )

  const detected_errors = []

  Object
    .keys( types_map )
    .forEach( type => {
      const arg_type_model = types_map[ type ]
      const should_succeed = arg_type_model.success
      const succeeded = executes_without_error({ subject, args: arg_type_model.args })

      if (should_succeed !== succeeded) detected_errors.push(
        should_succeed
          ? expected_success?.( type ) ?? type
          : expected_error?.( type ) ?? type
      )
    })

  return detected_errors
}
