//READ THE COMMENTS!

var app = Neutrino.app('8139ed1ec39a467b96b0250dcf520749'); //neutrino application
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

    var id;
    var ajaxCar;
    var realtimeCar;

    function print() {
        console.log(ajaxCar);
        console.log(realtimeCar);
    }

    cars.object()
        .then(c => {
            id = c._id;
        })
        .then(() => {
            return Promise.all([
                cars.object(id).then(c => ajaxCar = c),
                cars.object(id, {
                    realtime: true
                }).then(c => realtimeCar = c)
            ]);
        })
        .then(() => {
            ajaxCar.model = 'Mitsubishi';
            return ajaxCar.update();
        })
        .then(() => {
            return new Promise(r => {
                setTimeout(() => {
                    r();
                }, 1000)
            })
        })
        .then(() => {
            return print();
        })
        .then(() => {
            id, ajaxCar, realtimeCar = null;
        });

//     cars.object().
//         then(function (car) {
//             var id = car._id;

//             cars.object(id, {
//                 realtime: true
//             })
//             .then((car) => {
//                 car.make = 'Fiat';
//                 car.model = 'Stilo';
//                 delete car.year; //the field will be removed when updated
//                 //if realtime the data will be updated automatically

//                 //if the item is ajax we must commit the changes manually:
//                 return car.update();

//                 //all of the ops return promises
//             })
//             .then((car) => {
//                 //other operations:
//                 return car.get(); //gets the item from the server
//             })
//             .then((car) => {
//                 car.prop = '5';
//                 return car.reset(); //removes the item from the server
//             })
//             .then((car) => {
//                 return car.get();
//             })
//             .then((car) => {
//                 console.log(car);
//             })

//             //cars.remove(id);
//         })

    //args:

    //id: the object id. If there is such item from the server, its data will be into the returned object
    //if an id is not passed simply an empty object is created on the server
    //if an object instead of id is passed, the data will be created on the server

    //realtime: a boolean defining whether the returned object will be updated in realtime, automatically
}