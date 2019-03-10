const readline = require('readline');


function _readLine(question) {
    return new Promise((resolve, fail) => {

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(question || 'Press enter to continue', (answer) => {
            // TODO: Log the answer in a database
            rl.close();
            resolve(answer);
        });
    });
}

exports.default = _readLine;