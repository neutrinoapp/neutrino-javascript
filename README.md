# Neutrino JavaScript SDK

## API

### Initialize

```javascript
let app = Neutrino.app('{applicationId}');
```

### Get collection

```javascript
let collection = app.collection('cars');
```

### Create object

```javascript
let realtimeObject = collection.create({
  color: 'red',
  year: 2016
});

let simpleObject = collection.createSimple({
  color: 'blue',
  year: 2015
});
```

### Get single object

```javascript
let realtimeObject = collection.get('{object-id}');
```

or get simple object

```javascript
let simpleObject = collection.getSimple('{object-id}');
```

### Get array of objects

```javascript
let allObjects = collection.get();
```

or with filter

```javascript
let filteredObjects = collection.get({year: 2016});
```

Same goes for `getSimple` here too.

### Object updates

Realtime objects are updated automatically with updates from the server and local ones.

```javascript
let realtimeObject = collection.get('{object-id}');
realtimeObject.year = 2014;
```

Simple objects must be updated manually

```javascript
let simpleObject = collection.getSimple('{object-id}');
simpleObject.year = 2014;
simpleObject.update();
```

Simple objects must also manually fetch updates from the server

```javascript
let simpleObject = collection.getSimple('{object-id}');
console.log(simpleObject.year); //2015
//updated on the server to 2014
simpleObject.get();
console.log(simpleObject.year); //2014
```

### Deleting objects

The `delete` method works the same for both `realtime` and `simple` objects.

```javascript
let object = collection.get('{object-id}');
object.delete();
```

### Deleting all items from collection

```javascript
let realtimeArray = collection.get();
realtimeArray.forEach(object => object.delete());
```
