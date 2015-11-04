//READ THE COMMENTS!

var app = Neutrino.app('86ae2c23452d43398068d99d1a4ae721'); //neutrino application
//applications have data collections, e.g. Cars, Roads, etc. each collection has items
//the items do not enforce any rules on the fields, they are absolutely dynamic

var col = 'test';
var id = 'ba8b67afcf7d4ff59095e7184d51fd29';

var u = new Date().valueOf() + '';

//auth api
app.auth.register(u, u)
    .then(function () {
        return app.auth.login(u, u);
    })
    .then(function (res) {
        console.log(res.data)
        console.log(app.token)
    })
    .then(doStuff)

function doStuff() {
    // realtime objects (returned from the realtime api) are special, they have methods and their properties are observed
    // when a property changes it is automatically updated using websockets on the servers and all clients

    // http objects are plain javascript objects with no special methods or functions, they are just the response from an AJAX call

    // ------------------ Variant 1

    var d = app.use(col) //realtime mode by default
    var d2 = app.useSimple(col) // simple (http) mode, no realtime updates, only AJAX calls
    console.log(d);

    //usage - realtime - default

    //var realtimeObj = d.object('id');
    //realtimeObj.pesho = 'pesho'; //immediately updated on the server
    //delete realtimeObj.pesho //immediately updated
    //same for arrays

    //realtimeObj.remove(); //removes the object from the app's cars collection
    //realtimeObj.raw(); //raw json


    //usage - http - simple

    var jsonObject = d2.get(id)
        .then(function (data) {
            console.log(data);
        })

    var allData = d2.get()
        .then(function (data) {
            console.log(data)
        })

//     var filtered = d2.get({
//         pesho: 'pesho'
//     }) //with filter

    // partially update object's specific fields
//     d2.update('id', {
//         pesho: 'pesho'
//     })

    //set an object straight away, overriding anything else
    //if an id is not provided the object should have an _id field
//     jsonObject.pesho = 'pesho';
//     d2.set('id', jsonObject)
//     d2.set(jsonObject)

//     d2.remove('id')
//     d2.remove(jsonObject) // if the object has _id property it can be passed
}