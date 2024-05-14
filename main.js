const express = require('express');
const path = require('path');
// const mongoose = require('mongoose')
const bodyParser= require('body-parser')
const {UserSignin,AddStock,AddInvoice,GetIncome} = require('./schema.js')

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs');
// app.set('views','D:/bill'); 
// parse application/json
app.use(bodyParser.json())
const PORT = process.env.PORT || 3000;
// Serve static files (index.html, images, videos, etc.)
app.use(express.static(path.join(__dirname, 'img')));

// Define a route to serve the index.html file
app.get('/signup', (req, res) => {
  
  res.sendFile(path.join(__dirname, 'signup.html'));

});
app.get('/bill', (req, res) => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();
  const fore = `${day < 10 ? '0' : ''}${day}-${month < 10 ? '0' : ''}${month}-${year}`;

  const tot = JSON.parse(req.query.data);
  let total = 0;
  let data = tot['data1'];
  let cus = tot['cusname'];
  for(const key in data){
    total += data[key].pri*data[key].qua;
  }
  console.log(tot);
  res.render('bill',{data,total,cus,fore});
});
// Define routes

// Route to handle invoice printing and download
app.post('/printInvoice', async (req, res) => {
  try {
    // Extract data from the request body
    const { customerName, items } = req.body;

    // Create a new PDF document
    const doc = new pdfkit();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice.pdf"`);

    // Pipe the PDF content to response
    doc.pipe(res);

    // Add content to the PDF document
    doc.fontSize(24).text('JAYAMURUGAN TEX', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Customer Name: ${customerName}`, { align: 'left' });
    doc.moveDown();
    doc.fontSize(12).text(`Date: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();

    // Add table header
    doc.fontSize(12).text('Product Name', { width: 200, align: 'left' });
    doc.text('Price (₹)', { width: 100, align: 'left' });
    doc.text('Quantity', { width: 100, align: 'left' });
    doc.text('Total Price (₹)', { width: 150, align: 'left' });
    doc.moveDown();

    // Add items to the table
    let totalPrice = 0;
    items.forEach(item => {
      const { productName, price, quantity, totalPrice: itemTotalPrice } = item;
      doc.text(productName, { width: 200, align: 'left' });
      doc.text(price.toString(), { width: 100, align: 'left' });
      doc.text(quantity.toString(), { width: 100, align: 'left' });
      doc.text(itemTotalPrice.toString(), { width: 150, align: 'left' });
      doc.moveDown();
      totalPrice += itemTotalPrice;
    });

    // Add total price
    doc.fontSize(14).text(`Total Amount: ₹${totalPrice.toFixed(2)}`, { align: 'right' });

    // Finalize the PDF document
    doc.end();
  } catch (error) {
    console.error('Error generating PDF invoice:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/', (req, res) => {
  
  res.sendFile(path.join(__dirname, 'signup.html'));

});
app.get('/auth', async (req, res) => {
  const { username, password } = req.query; // Use req.query instead of req.params
  
  // console.log({ username, password }, "request"); // Log the received parameters
  const userLogged = await UserSignin(username, password);
  if (userLogged.length > 0) {
    res.redirect('/home');
  } else {
    res.redirect('/signup');
  }
});

app.get('/home',(req,res)=>{
  res.sendFile(path.join(__dirname, 'index.html'));

})
app.get('/staff', (req, res) => {
  res.sendFile(path.join(__dirname, 'invoice.html'));
});
app.get('/stock',(req,res)=>{
  res.sendFile(path.join(__dirname, 'stock.html'));
});
// app.get('/report',(req,res)=>{
//   res.sendFile(path.join(__dirname, 'report.html'));
// });
// app.get('/income',(req,res)=>{
//   res.sendFile(path.join(__dirname, 'income.html'));
// });


app.get('/print',(req,res)=>{
  res.send("hello ")
})
app.post('/addStock', async (req, res) => {
  try {
      const data = req.body;

      const addStockPromises = [];

        // Iterate over each item in the data array
        for (let i = 0; i < data.length; i++) {
            const productName = data[i][0];
            const quantity = Number(data[i][1]);
            addStockPromises.push({productName,quantity })
        }

        await AddStock(addStockPromises)

      res.status(200).send('Stock items added successfully');
  } catch (error) {
      console.error('Error adding stock items:', error);
      res.status(500).send('Internal Server Error');
  }
});


app.post('/addInvoice',async(req,res)=>{
  const data = req.body;
  await AddInvoice(data);
  
})
// let totalIncome = 0;
// app.get('/some',(req,res)=>{
//   // res.render
//   res.render('incomeSearch', { totalIncome });
// })
app.post('/getIncome',async(req,res)=>{
  const data = req.body;
  totalIncome =  await GetIncome(data)
  res.redirect('/some')
  // res.render('incomeSearch', { totalIncome });
  // console.log(data)
})
var totalIncome = 0;
app.get('/some', (req, res) => {
  // Render the template with the totalIncome value
  res.render('incomeSearch', { totalIncome });
});
app.get('/getReport', (req, res) => {
  // Render the template with the totalIncome value
  res.render('report', { totalIncome });
});

app.post('/getIncome', async (req, res) => {
  try {
      const data = req.body;
      // Compute the total income
       totalIncome = await GetIncome(data);
      // Redirect to /some with the totalIncome value as a query parameter
      console.log(totalIncome)
      res.redirect(`/some?totalIncome=${totalIncome}`);
  } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});
app.post('/getReport', async (req, res) => {
  try {
      const data = req.body;
      // Compute the total income
       totalIncome = await GetIncome(data);
      // Redirect to /some with the totalIncome value as a query parameter
      console.log(totalIncome)
      res.redirect(`/getReport?TotalReport =${totalIncome}`);
  } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});


// Assuming you have an Express route to render the template
app.get('/income', (req, res) => {
  const totalIncome = 0; // Get current date in yyyy-mm-dd format
  res.render('incomeSearch', { totalIncome });
});
app.get('/report', (req, res) => {
  const totalIncome = 0; // Get current date in yyyy-mm-dd format
  res.render('report', { totalIncome });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


// // Import necessary modules
// const express = require('express');
// const path = require('path');
// const bodyParser = require('body-parser');
// // const mongoose= require('mongoose');
// const { UserSignin, AddStock, AddInvoice, GetIncome } = require('./schema.js');
// const pdfkit = require('pdfkit');
// const fs = require('fs');

// const app = express();
// app.use(bodyParser.urlencoded({ extended: false }));
// app.set('view engine', 'ejs');
// app.use(bodyParser.json());
// const PORT = process.env.PORT || 3000;
// app.use(express.static(path.join(__dirname, 'img')));

// // Define routes

// // Route to handle invoice printing and download
// app.post('/printInvoice', async (req, res) => {
//   try {
//     // Extract data from the request body
//     const { customerName, items } = req.body;

//     // Create a new PDF document
//     const doc = new pdfkit();
//     // Pipe the PDF content to response
//     doc.pipe(res);

//     // Set PDF document properties
//     doc.info.Title = 'Invoice';
//     doc.info.Author = 'NELLAI MALLIGAI - VKL';

//     // Add content to the PDF document
//     doc.fontSize(24).text('NELLAI MALLIGAI - VKL', { align: 'center' });
//     doc.moveDown();
//     doc.fontSize(16).text(`Customer Name: ${customerName}`, { align: 'left' });
//     doc.moveDown();
//     doc.fontSize(12).text(`Date: ${new Date().toLocaleString()}`, { align: 'right' });
//     doc.moveDown();

//     // Add table header
//     doc.fontSize(12).text('Product Name', { width: 200, align: 'left' });
//     doc.text('Price (₹)', { width: 100, align: 'left' });
//     doc.text('Quantity', { width: 100, align: 'left' });
//     doc.text('Total Price (₹)', { width: 150, align: 'left' });
//     doc.moveDown();

//     // Add items to the table
//     let totalPrice = 0;
//     items.forEach(item => {
//       const { productName, price, quantity, totalPrice: itemTotalPrice } = item;
//       doc.text(productName, { width: 200, align: 'left' });
//       doc.text(price.toString(), { width: 100, align: 'left' });
//       doc.text(quantity.toString(), { width: 100, align: 'left' });
//       doc.text(itemTotalPrice.toString(), { width: 150, align: 'left' });
//       doc.moveDown();
//       totalPrice += itemTotalPrice;
//     });

//     // Add total price
//     doc.fontSize(14).text(`Total Amount: ₹${totalPrice.toFixed(2)}`, { align: 'right' });

//     // Finalize the PDF document
//     doc.end();
//   } catch (error) {
//     console.error('Error generating PDF invoice:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// // Define your existing routes below

// // Define a route to serve the index.html file
// app.get('/signup', (req, res) => {
//   res.sendFile(path.join(__dirname, 'signup.html'));
// });

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'signup.html'));
// });

// app.get('/auth', async (req, res) => {
//   const { username, password } = req.query;

//   const userLogged = await UserSignin(username, password);
//   if (userLogged.length > 0) {
//     res.redirect('/home');
//   } else {
//     res.redirect('/signup');
//   }
// });

// app.get('/home', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

// app.get('/staff', (req, res) => {
//   res.sendFile(path.join(__dirname, 'invoice.html'));
// });

// app.get('/stock', (req, res) => {
//   res.sendFile(path.join(__dirname, 'stock.html'));
// });

// // Existing routes for handling stock, income, report, etc.

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
