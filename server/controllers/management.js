import mongoose from "mongoose";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json(admins);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getUserPerformance = async (req, res) => {
  try {
    const { id } = req.params; //This is the current user's id coming from the frontend

    //THis is a mongoose function where you select specific data from another table and match it with the same user ID
    //Wer're grabbing the information about the specific current user from another table 
    //INNER JOIN
    //This will basically connect User to Affilate with the matching ID.
    //THis is similar to the product api where you get all the products from database. The cons is it is very slow.
    //***This should be used as it is a bit of a good practice than its counterpart, as aggregate is way faster than Promise.all syntax in getProducts
    const userWithStats = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } }, //This will match the current user "id" with the "_id" in the User database and grab the information.
      {
        $lookup: { //This will allow us to connect and grab the informtaion from both AffiliateStats and User table database. It matches the "_id" from User => AffiliateStats "userID".
          from: "affiliatestats",
          localField: "_id",
          foreignField: "userId",
          as: "affiliateStats", //Any variable name
        },
      },
      { $unwind: "$affiliateStats" },//this is an essential step to flatten the array
    ]);

    const saleTransactions = await Promise.all(
      userWithStats[0].affiliateStats.affiliateSales.map((id) => {
        return Transaction.findById(id);
      })
    );
    const filteredSaleTransactions = saleTransactions.filter(
      (transaction) => transaction !== null
    );

    res
      .status(200)
      .json({ user: userWithStats[0], sales: filteredSaleTransactions });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
