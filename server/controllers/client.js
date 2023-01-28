import Product from "../models/Product.js";
import User from "../models/User.js";
import ProductStat from "../models/ProductStat.js";
import Transaction from "../models/Transaction.js";
import getCountryIso3 from "country-iso-2-to-3";

export const getProducts = async (req, res) => {
    try {
      const products = await Product.find();
        // INNER JOIN Product and ProductStats
      const productsWithStats = await Promise.all(
        products.map(async (product) => { //async (var name)
          const stat = await ProductStat.find({
            productId: product._id,
          });
          return { //This will return combined tables
            ...product._doc,
            stat,
          };
        })
      );
  
      res.status(200).json(productsWithStats); //THis will be returned to the Frontend
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };

  export const getCustomers = async (req, res) => {
    try {
      const customers = await User.find({ role: "user" }).select("-password");
      res.status(200).json(customers);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };

  export const getTransactions = async (req, res) => {
    try {
      // sort should look like this: { "field": "userId", "sort": "desc"}
      const { page = 1, pageSize = 20, sort = null, search = "" } = req.query;
  
      // formatted sort should look like { userId: -1 }
      const generateSort = () => {
        const sortParsed = JSON.parse(sort);
        const sortFormatted = {
          [sortParsed.field]: (sortParsed.sort = "asc" ? 1 : -1),
        };
  
        return sortFormatted;
      };
      const sortFormatted = Boolean(sort) ? generateSort() : {};
  
      const transactions = await Transaction.find({
        $or: [
          { cost: { $regex: new RegExp(search, "i") } }, //field
          { userId: { $regex: new RegExp(search, "i") } }, //field
          //Add more fields to search
        ],
      })
        .sort(sortFormatted)
        .skip(page * pageSize)
        .limit(pageSize);
  
      const total = await Transaction.countDocuments({ //This will give us the total count from the search result 
        name: { $regex: search, $options: "i" },
      });
  
      res.status(200).json({
        transactions,
        total,
      });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };

  export const getGeography = async (req, res) => {
    try {
      const users = await User.find();
  
      //THis will convert the 2 letter ISO country stored from Database into 3 Letter ISO country as this is the required ISO for nivo [Example: CA => CAN]
      const mappedLocations = users.reduce((acc, { country }) => {
        const countryISO3 = getCountryIso3(country);
        if (!acc[countryISO3]) {
          acc[countryISO3] = 0;
        }
        acc[countryISO3]++;
        return acc;
      }, {});
      console.log(mappedLocations);
      //THis will convert the data into the right format for the nivo map
      const formattedLocations = Object.entries(mappedLocations).map(
        ([country, count]) => {
          return { id: country, value: count };
        }
      );
  
      res.status(200).json(formattedLocations);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };