const mongoose = require('mongoose')
async function connectionToDB(){

    mongoose.connect('mongodb://127.0.0.1:27017/consultancy').then((data)=>{
        console.log('connected to the DB')
    }).catch((err)=>{
        console.log('not connected')
    })
}
async function UserSignin(user,password){

    connectionToDB()
    const userSchema = new mongoose.Schema({user:String,password:String});
    
    const User = mongoose.models.signin || mongoose.model('signin', userSchema);
    const getData = await User.find({user,password})
    if(getData){
        return getData
    }
    return {}
}

async function AddStock(allStock) {
    connectionToDB()
    try {
        // Create a new stock instance
        const stockSchema = new mongoose.Schema({
            productName: String,
            quantity: Number
        });
        
        // Define the Stock model
        const Stock = mongoose.model('Stock', stockSchema);

        const insertedStock = await Stock.insertMany(allStock);

        // Save the new stock instance to the database
        const savedStock = await insertedStock.save();
        // Return the saved stock data
        return savedStock;
    } catch (error) {
        // Handle errors
        console.error('Error adding stock:', error);
        throw error; // Rethrow the error for the caller to handle
    }
}


async function AddInvoice(data){
    connectionToDB();
    const invoiceSchema = new mongoose.Schema({
        customername:String,
        productName: {},
        total: Number,
        date:Date
    });

    const Invoice = mongoose.model('Invoice',invoiceSchema);
    console.log(data)
    const total = Number(data[0]); // Convert data[2] to a number

if (!isNaN(total)) { // Check if total is a valid number
    const invoiceData = await Invoice.insertMany({
        customername: data[2],
        date: new Date(),
        total: total, // Use the parsed total value
        productName:   data[1]
    });
    // const stockSchema = new mongoose.Schema({
    //     productName: String,
    //     quantity: Number
    // });
    
    // Define the Stock model
    // const Stock = mongoose.model('Stock', stockSchema);
    // for(let i=0;i<)
    // const insertedStock = await Stock.findOne({productName : });

} else {
    console.log("Invalid total value:", data[2]);
    // Handle the case where total is not a valid number
}


}


async function GetIncome(data){
    connectionToDB();

    const invoiceSchema = new mongoose.Schema({
        customername:String,
        productName: {},
        total: Number,
        date:Date
    });
    const fromDate = data.fromDate;
    const toDate = data.toDate;
    const Invoice = mongoose.model('Invoice',invoiceSchema);
    // Assuming fromDate and toDate are strings representing dates in the format 'YYYY-MM-DD'

    // Add the time component to fromDate to start from the beginning of the day
    const fromDateStartOfDay = new Date(`${fromDate}T00:00:00.000Z`);

    // Add the time component to toDate to end at the end of the day
    const toDateEndOfDay = new Date(`${toDate}T23:59:59.999Z`);

    const allData = await Invoice.find({
        date: { $gte: fromDateStartOfDay, $lte: toDateEndOfDay }
    });

    let totalIncome = 0;
    allData.forEach(invoice => {
        totalIncome += invoice.total; // Summing up the total income from all invoices
    });

    console.log("Total income between", fromDate, "and", toDate, "is:", totalIncome);
    return totalIncome

}
module.exports = {UserSignin,AddStock,AddInvoice,GetIncome}