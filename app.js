// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').config();
// }

// const stripesecretkey = process.env.STRIPE_SECRET_KEY;
// const stripepublickey = process.env.STRIPE_PUBLIC_KEY;

// console.log(stripesecretkey, "\n", stripepublickey);

// const express = require("express");
// const app = express();
// app.use(express.json());

// const fs = require("fs");
// const stripe = require('stripe')(stripesecretkey);

// app.set('view engine', 'ejs');
// app.use(express.static('public'));

// app.get("/store", function (req, res) {
//     fs.readFile('itrms.json', function (error, data) {
//         if (error) {
//             res.status(500).end();
//         } else {
//             res.render("store.ejs", {
//                 stripepublickey: stripepublickey,
//                 itrms: JSON.parse(data)
//             });
//         }
//     });
// });

// app.post("/purchase", function (req, res) {
//     fs.readFile('itrms.json', function (error, data) {
//         if (error) {
//             res.status(500).end();
//         } else {
//             const itemsJson = JSON.parse(data);
//             const itemsArray = itemsJson.music.concat(itemsJson.merch);
//             let total = 0;

//             req.body.items.forEach(function (item) {
//                 const itemJson = itemsArray.find(function (i) {
//                     return i.id == item.id;
//                 });
//                 total = total + itemJson.price * item.quantity;
//             });

//             stripe.charges.create({
//                 amount: total,
//                 source: req.body.stripeTokenId,
//                 currency: 'usd'
//             }).then(function () {
//                 console.log('charge successful');
//                 res.json({ message: 'successfully purchased items' });
//             }).catch(function (error) {
//                 console.error('charge fail:', error);
//                 res.status(500).end();
//             });
            
//         }
//     });
// });

// app.listen(3000, () => {
//     console.log('Server is listening on port 3000');
// });
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const stripesecretkey = process.env.STRIPE_SECRET_KEY;
const stripepublickey = process.env.STRIPE_PUBLIC_KEY;

console.log(stripesecretkey, "\n", stripepublickey);

const express = require("express");
const app = express();
app.use(express.json());

const fs = require("fs");
const stripe = require('stripe')(stripesecretkey);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get("/store", function (req, res) {
    fs.readFile('itrms.json', function (error, data) {
        if (error) {
            res.status(500).end();
        } else {
            res.render("store.ejs", {
                stripepublickey: stripepublickey,
                itrms: JSON.parse(data)
            });
        }
    });
});

app.post("/purchase", async function (req, res) {
    try {
        const itemsJson = JSON.parse(fs.readFileSync('itrms.json'));
        const itemsArray = itemsJson.music.concat(itemsJson.merch);
        let total = 0;

        req.body.items.forEach(function (item) {
            const itemJson = itemsArray.find(function (i) {
                return i.id == item.id;
            });
            total = total + itemJson.price * item.quantity;
        });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: total,
            currency: 'usd',
            payment_method: req.body.stripeTokenId,
            confirmation_method: 'manual',
            confirm: true,
        });

        console.log('PaymentIntent created:', paymentIntent);

        res.json({ client_secret: paymentIntent.client_secret });
    } catch (error) {
        console.error('PaymentIntent creation fail:', error);
        res.status(500).end();
    }
});

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
