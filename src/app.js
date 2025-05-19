const express = require('express');

const app = express();

app.use("/hello", (req,res) => {
    res.send('Hello devs!');
})

app.use("/express", (req,res) => {
    res.send('Hello from Express!');
})

app.get("/user", (req, res, next) => {
    console.log(req.query);
    console.log(req.params);
    console.log("First Response");
    //res.send({firstName: "Amit", lastName: "Mahata"});
    next();
},
    (req, res, next) => {
        console.log("Second Response");
        //res.send({ firstName: "Amit", lastName: "Mahata" });
        next();
    },
    (req, res, next) => {
        console.log("Third Response");
        res.send({ firstName: "Amit", lastName: "Mahata" });
        //next();
    }
);

app.listen(2222, () => {
    console.log('Server is successfully listening on port 2222...');
});