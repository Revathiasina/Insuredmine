const { Worker, isMainThread, parentPort } = require('worker_threads');
const xlsx = require('xlsx');
const Papa = require('papaparse');
const policyInfoCollection = require('../models/policyInfo');
const userCollection = require('../models/users');
const policyCategoryCollection = require('../models/policyCategory');
const userAccountCollection = require('../models/userAccount');


const uploadExcelFile = async (req, res) => {
    try {
        // Check if file is present
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const buffer = req.file.buffer;

        // Determine file type (xlsx or csv)
        const fileType = req.file.originalname.split('.').pop();

        if (fileType === 'xlsx') {
            const workbook = xlsx.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        } else if (fileType === 'csv') {
            data = [];
            buffer.toString().split('\n').forEach(line => {
                if (line.trim()) {
                    let result = Papa.parse(line, {
                        delimiter: ',',
                        quoteChar: '"'
                    });
                    data.push(result.data[0]);
                }
            });
        } else {
            return res.status(400).json({ error: 'Invalid file type' });
        }

        if (!data?.length) {
            return res.status(400).json({ error: 'No data found in file' });
        } else {
            // Pass data to worker thread for processing
            const worker = new Worker('./src/controller/worker.js', { workerData: { data } });
            console.log('Worker thread created', isMainThread);
            worker.on('message', async (insertedCount) => {
                console.log(`Inserted ${insertedCount} documents into MongoDB`);
                res.status(200).json({ success: true, insertedCount });
            });
            worker.on('error', (error) => {
                console.error('Worker error:', error);
                res.status(500).json({ error, success: false });
            });
        }
    } catch (error) {
        console.error('Error searching for policy info:', error);
        res.status(500).json({ error, success: false });
    }
};
const searchInfo = async (req, res) => {
    try {
        const { username } = req.query;
        // Define a regex pattern for the username
        const usernameRegex = new RegExp(username, 'i');

        // Use aggregation to perform the search
        const policyInfo = await policyInfoCollection.aggregate([
            // {
            //     $addFields: {
            //         policyCategoryId: {
            //             $convert: {
            //                 input: '$policyCategoryId',
            //                 to: 'objectId',
            //                 onError: '',
            //                 onNull: '',
            //             },
            //         },
            //     },
            // },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: policyCategoryCollection.collection.collectionName,
                    localField: 'policyCategoryId',
                    foreignField: '_id',
                    as: 'policyCategorys'
                },
            },
            {
                $unwind: {
                    path: '$policyCategorys',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: userAccountCollection.collection.collectionName,
                    localField: 'collectionId',
                    foreignField: '_id',
                    as: 'collectionList'
                },
            },
            {
                $unwind: {
                    path: '$collectionList',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: {
                    'user.firstName': usernameRegex
                }
            }
        ]);

        res.status(200).json({ policyInfo, success: true });
    } catch (error) {
        console.error('Error searching for policy info:', error);
        res.status(500).json({ error, success: false });
    }
};
const aggregatePolicyInfoByUser = async (req, res) => {
    try {
        // Use aggregation to perform the search
        const userInfo = await userCollection.aggregate([
            {
                $lookup: {
                    from: policyInfoCollection.collection.collectionName,
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'policyInfo'
                }
            },
        ]);

        res.status(200).json({ userInfo, success: true });
    } catch (error) {
        console.error('Error searching for user info:', error);
        res.status(500).json({ error, success: false });
    }
};

module.exports = {
    uploadExcelFile,
    aggregatePolicyInfoByUser,
    searchInfo
};