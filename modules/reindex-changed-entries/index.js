module.exports = reindex_changed_entries

function reindex_changed_entries( internal_state ) {
  if (!internal_state.public_api.hooks) throw new Error( 'hooks public api not found' )

  internal_state.public_api.hooks.add( 'key-created', 'index-new-entry', reindex_entry_by_key )
  internal_state.public_api.hooks.add( 'key-updated', 'index-updated-entry', reindex_entry_by_key )
  internal_state.public_api.hooks.add( 'key-deleted', 'remove-deleted-entry-from-indexes', reindex_entry_by_key )

  function reindex_entry_by_key({ key }) {
    internal_state.public_api.reindex({ key })
  }
}