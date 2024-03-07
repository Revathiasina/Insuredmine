const mongoose = require("mongoose");
const moment = require("moment");
const { workerData, parentPort } = require('worker_threads');
const userCollection = require('../models/users');
const userAccountCollection = require('../models/userAccount');
const policyCategoryCollection = require('../models/policyCategory');
const policyCarrierCollection = require('../models/policyCarrier');
const agentCollection = require('../models/agents');
const policyInfoCollection = require('../models/policyInfo');

const { MONGO_URI } = process.env;

const connect = () => {
    mongoose.set("strictQuery", false);
    mongoose
        .connect(MONGO_URI)
        .then((connection) => {
            console.log("Successfully connected to database");
            return connection;
        })
        .catch((error) => {
            console.log("database connection failed. exiting now...");
            console.error(error);
            process.exit(1);
        });
};

connect();


const processData = async (data) => {
    try {
        let insertedCount = 0;
        // Extract headings
        const headings = data[0]; // Assuming the first row contains headings
        const dataArray = data.slice(1); // Remove the first row since it contains headings

        const processedData = dataArray.map(row => {
            const detailObject = {};
            headings.forEach((heading, index) => {
                detailObject[heading] = row[index];
            });
            return detailObject;
        });
        // Loop through each detail row
        for (const detailRow of processedData) {
            await agentCollection.create({ agentName: detailRow.agent });

            // due to invalid date format, new Date('17-10-1946') we are using moment to convert the date to a valid date format
            const user = {
                userId: insertedCount + 1,
                firstName: detailRow.firstname,
                dob: detailRow.dob ? moment(detailRow.dob, 'DD-MM-YYYY').toDate() : null,
                address: detailRow.address,
                phone: detailRow.phone,
                state: detailRow.state,
                zip: detailRow.zip,
                email: detailRow.email,
                gender: detailRow.gender,
                userType: detailRow.userType
            };
            await userCollection.create(user);

            const collection = await userAccountCollection.create({ accountName: detailRow.account_name });

            const policyCarrier = await policyCarrierCollection.create({ companyName: detailRow.company_name });

            const policyCategory = await policyCategoryCollection.create({ categoryName: detailRow.category_name });

            const policyInfo = {
                policyNumber: detailRow.policy_number,
                policyStartDate: detailRow.policy_start_date ? moment(detailRow.policy_start_date, 'DD-MM-YYYY').toDate() : null,
                policyEndDate: (detailRow.policy_end_date) ? moment(detailRow.policy_end_date, 'DD-MM-YYYY').toDate() : null,
                policyCategoryId: policyCategory._id,  // Use the _id of the policyCategory document
                collectionId: collection._id,
                companyCollectionId: policyCarrier._id,
                userId: user.userId
            };
            await policyInfoCollection.create(policyInfo);

            insertedCount++;
        }

        return insertedCount;
    } catch (error) {
        throw error;
    }
};

processData(workerData.data)
    .then(insertedCount => parentPort.postMessage(insertedCount))
    .catch(error => {
        console.error('Error processing data:', error);
        parentPort.postMessage({ error });
    });
