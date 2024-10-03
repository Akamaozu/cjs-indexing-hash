module.exports = populate_new_indexes

function populate_new_indexes( internal_state ) {
  if (!internal_state.public_api.hooks) throw new Error( 'hooks public api not found' )

  internal_state.public_api.hooks.add( 'index-created', 'populate-created-index', full_reindex_by_index_key )

  function full_reindex_by_index_key({ name: index_key }) {
    internal_state.public_api.reindex({ index: index_key })
  }
}