# cjs-indexing-hash
**lightweight key-value store with support for auto-updating indexes** *( indices? you know what i mean ... )*

---

### install
`npm i cjs-indexing-hash`

---

### how to use

#### create new instance (empty)
```js
var create_indexing_hash = require('cjs-indexing-hash'),
    indexing_hash = create_indexing_hash();
```

### create new instance from existing data
#### > objects
```js
var users = {
    batman: { is_cool: true },
    superman: { is_cool: false }
  },
  indexable_users = create_indexing_hash( users );
```
#### > arrays
```js
var users = [
    { id: batman, is_cool: true },
    { id: superman, is_cool: false }
  ],
  indexable_users = create_indexing_hash( users );
```
#### > strings
```js
var indexable_string = create_indexing_hash( 'why would you want to do this? who cares! it works!!!' );
```

### get entry
```js
// from object
var batman = indexable_users.get( 'batman' );

// from array
var batman = indexable_users.get( 0 );

// from string
var y = indexable_string.get( '2' );
```
### add entry
```js
indexable_users.add( 'wonder_woman', { is_cool: true });
```

### create index
```js
    indexable_users.add_index( 'is-cool', function( entry, add_to_index ){
      if(  entry.is_cool == true ) add_to_index();
    });
```

### get keys in index
```js
var cool_users = indexable_users.index_get( 'is-cool' );
```

### get keys in multiple indexes (indices)
```js
var cool_users_with_capes = indexable_users.intersect_indexes([ 'is-cool', 'has-cape' ]);
```
