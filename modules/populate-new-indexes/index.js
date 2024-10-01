module.exports = populate_new_indexes

function populate_new_indexes( internal_state ) {
  const { public_api } = internal_state ?? {}
  const { hooks } = public_api ?? {}

  if (!hooks) throw new Error( 'hooks public api not found' )

  hooks.add( 'index-created', 'populate-created-index', full_reindex_by_index_key )

  function full_reindex_by_index_key({ name: index_key }) {
    public_api.reindex({ index: index_key })
  }
}