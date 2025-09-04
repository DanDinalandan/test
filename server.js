const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types'); //147.7k (gzipped: 21.9k)

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 File Not Found</h1>', 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': mime.lookup(filePath) || 'application/octet-stream' });
            res.end(content, 'utf-8');
        }
    });
});

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Files are saved in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        // Generate a unique file name: timestamp + original file name
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // Limit file size to 10MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
}).single('File');

// Serve static files (e.g., HTML form)
app.use(express.static('public'));

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            if (req.file) {
                res.send(`File uploaded successfully! Filename: ${req.file.filename}`);
                console.log('Uploaded file:', req.file); // Log file details for debugging
            } else {
                res.status(400).send('No file selected!');
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {console.log(`Server running on port ${PORT}`); }); 