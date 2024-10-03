module.exports = load_core_dataset_public_api

function load_core_dataset_public_api( internal_state ) {
  if (!internal_state?.public_api) throw new Error( 'public api not found' )
  if (!internal_state.public_api.hooks) throw new Error( '"hooks" property not found in public api' )

  internal_state.public_api.keys = get_dataset_keys
  internal_state.public_api.exists = entry_key_exists
  internal_state.public_api.get = get_dataset_entry_by_key
  internal_state.public_api.add = add_dataset_entry_by_key
  internal_state.public_api.del = delete_dataset_entry_by_key
  internal_state.public_api.update = update_dataset_entry_by_key

  function get_dataset_keys() {
    return Object.keys( internal_state.dataset )
  }

  function entry_key_exists( key ) {
    return internal_state.dataset.hasOwnProperty( key )
  }

  function get_dataset_entry_by_key( key ) {
    if (!internal_state.public_api.exists( key )) throw new Error( `dataset key "${ key }" not found` )
    return internal_state.dataset[ key ]
  }

  function add_dataset_entry_by_key( key, val ) {
    if (internal_state.public_api.exists( key )) throw new Error( `key "${ key }" already exists in the dataset` )

    internal_state.dataset[ key ] = val

    internal_state.public_api.hooks.run( 'key-created', { key, val })
  }

  function delete_dataset_entry_by_key( key ) {
    if (!internal_state.public_api.exists( key )) throw new Error( `dataset key "${ key }" does not exist` )

    const value_to_delete = internal_state.dataset[ key ]

    delete internal_state.dataset[ key ]

    internal_state.public_api.hooks.run( 'key-deleted', { key, val: value_to_delete })
  }

  function update_dataset_entry_by_key( key, current_value, next_value ) {
    if (!internal_state.public_api.exists( key )) throw new Error( `dataset key "${ key }" not found` )

    if (arguments.length === 2) {
      next_value = current_value
      current_value = internal_state.dataset[ key ]
    }

    if (current_value !== internal_state.dataset[ key ]) throw new Error( `expected value for key "${ key }" does not match current value` )

    internal_state.dataset[ key ] = next_value

    internal_state.public_api.hooks.run( 'key-updated', { key, val: next_value })
  }
}
