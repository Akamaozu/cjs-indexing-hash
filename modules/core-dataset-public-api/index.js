module.exports = load_core_dataset_public_api

function load_core_dataset_public_api( internal_state ) {
  const { public_api } = internal_state ?? {}
  const { hooks } = public_api ?? {}

  if (!public_api) throw new Error( 'public api not found' )
  if (!hooks) throw new Error( '"hooks" property not found in public api' )

  public_api.keys = get_dataset_keys
  public_api.get = get_dataset_entry_by_key
  public_api.add = add_dataset_entry_by_key
  public_api.del = delete_dataset_entry_by_key
  public_api.update = update_dataset_entry_by_key

  function get_dataset_keys() {
    return Object.keys( internal_state.dataset )
  }

  function get_dataset_entry_by_key( key ) {
    if (!internal_state.dataset.hasOwnProperty( key )) throw new Error( `dataset key "${ key }" not found` )
    return internal_state.dataset[ key ]
  }

  function add_dataset_entry_by_key( key, val ) {
    if (internal_state.dataset.hasOwnProperty( key )) throw new Error( `key "${ key }" already exists in the dataset` )

    internal_state.dataset[ key ] = val

    hooks.run( 'key-created', { key, val })
  }

  function delete_dataset_entry_by_key( key ) {
    if (!internal_state.dataset.hasOwnProperty( key )) throw new Error( `dataset key "${ key }" does not exist` )

    const value_to_delete = internal_state.dataset[ key ]

    delete internal_state.dataset[ key ]

    hooks.run( 'key-deleted', { key, val: value_to_delete })
  }

  function update_dataset_entry_by_key( key, current_value, next_value ) {
    if (!internal_state.dataset.hasOwnProperty( key )) throw new Error( `dataset key "${ key }" not found` )

    if (arguments.length === 2) {
      next_value = current_value
      current_value = internal_state.dataset[ key ]
    }

    if (current_value !== internal_state.dataset[ key ]) throw new Error( `expected value for key "${ key }" does not match current value` )

    internal_state.dataset[ key ] = next_value

    hooks.run( 'key-updated', { key, val: next_value })
  }
}
