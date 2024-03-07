
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const os = require('os');
const { exec, spawn } = require('child_process');

require('dotenv').config();

let { SERVER_PORT } = process.env;

const maxCpuUsage = 70;
SERVER_PORT = SERVER_PORT || 5050;

// Initialize Express
let app = express();

const controller = require('./src/controller/index');

const connection = require('./src/mongooseConnection');

app.use(cors());

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Parse request body as JSON
app.use(express.json({ limit: '102mb', parameterLimit: '102mb' }));

app.use(express.urlencoded({ extended: false, limit: '102mb' }));

// default
app.get('/', (req, res) => {
    console.log('Server is working on port ' + SERVER_PORT + '.');
    res.send('Server is working');
});

app.post('/corn/schedule', controller.scheduleController.scheduleJob);
app.post('/uploadfile', upload.single('file'), controller.policyInfoController.uploadExcelFile);
app.get('/search', controller.policyInfoController.searchInfo);
app.get('/aggregated/policy/user', controller.policyInfoController.aggregatePolicyInfoByUser);

const restartServer = async () => {
    console.log('Restarting server...');
    await spawn('npm', ['start'], { stdio: 'inherit', shell: true });

};

const restartServerOnCpuHighUsage = async () => {
    setInterval(() => {
        let startMeasure = cpuAverage();

        // Set delay for second Measure
        setTimeout(() => {
            // Grab second Measure
            let endMeasure = cpuAverage();

            // Calculate the difference in idle and total time between the measures
            let idleDifference = endMeasure.idle - startMeasure.idle;
            let totalDifference = endMeasure.total - startMeasure.total;

            // Calculate the average percentage CPU usage
            let usagePercentage = 100 - ~~(100 * idleDifference / totalDifference);
            // let usagePercentage = 100 - Math.floor(100 * idleDifference / totalDifference);

            console.log(`Current CPU usage: ${usagePercentage}%`);

            if (usagePercentage > maxCpuUsage) {
                console.log(`CPU usage (${usagePercentage}%) exceeds ${maxCpuUsage}%. Restarting server...`);
                restartServer();
            }
        }, 500);
    }, 1000);
}

function cpuAverage() {
    let totalIdle = 0, totalTick = 0;
    let cpus = os.cpus();

    for (let i = 0, len = cpus.length; i < len; i++) {
        let cpu = cpus[i];

        for (let type in cpu.times) {
            totalTick += cpu.times[type];
        }

        totalIdle += cpu.times.idle;
    }
    return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}


// Start the server
app.listen(SERVER_PORT, function () {
    console.log('Listening on port ' + SERVER_PORT + '.');
    connection.connect();
});

// restartServerOnCpuHighUsage();