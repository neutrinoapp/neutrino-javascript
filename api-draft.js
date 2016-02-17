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
        console.log(res.data);
        console.log(app.token);
    })
    .then(doStuff);

function doStuff() {
    var cars = app.use('car');

    //args:

    //id: the object id. If there is such item from the server, its data will be into the returned object
    //if an id is not passed simply an empty object is created on the server
    //if an object instead of id is passed, the data will be created on the server

    //realtime: a boolean defining whether the returned object will be updated in realtime, automatically
    cars.object('carId', true|false)
        .then((car) => {
            car.make = 'Fiat';
            car.model = 'Stilo';
            delete car.year; //the field will be removed when updated
            //if realtime the data will be updated automatically

            //if the item is ajax we must commit the changes manually:
            car.update();

            //other operations:
            car.get(); //gets the item from the server
            car.remove(); //removes the item from the server

            //all of the ops return promises
        });

    cars.remove('someId');

}