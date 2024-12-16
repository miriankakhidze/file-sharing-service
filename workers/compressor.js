const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

process.on('message', ({ filePath }) => {
    const compressedPath = `${filePath}.gz`;

    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(compressedPath);
    const gzip = zlib.createGzip();

    input.pipe(gzip).pipe(output);

    output.on('finish', () => {
        process.send({ message: `File compressed: ${compressedPath}` });
        process.exit(0);
    });

    output.on('error', (err) => {
        process.send({ message: `Compression failed: ${err.message}` });
        process.exit(1);
    });
});