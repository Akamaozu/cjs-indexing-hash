module.exports = reindex_changed_entries

function reindex_changed_entries( internal_state ) {
  const { public_api } = internal_state ?? {}
  const { hooks } = public_api ?? {}

  if (!hooks) throw new Error( 'hooks public api not found' )

  hooks.add( 'key-created', 'index-new-entry', reindex_entry_by_key )
  hooks.add( 'key-updated', 'index-updated-entry', reindex_entry_by_key )
  hooks.add( 'key-deleted', 'remove-deleted-entry-from-indexes', reindex_entry_by_key )

  function reindex_entry_by_key({ key }) {
    public_api.reindex({ key })
  }
}