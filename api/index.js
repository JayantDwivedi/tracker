const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const path = require("path");

const app = express();

const server = http.createServer(app);
const io = socketio(server);


app.set("view engine", "ejs");

// Set the views directory to /view (if index.ejs is here)
app.set("views", path.join(__dirname, '../view'));

// Serve static files from /public (e.g., CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

io.on("connection",function(socket){
    socket.on("send-location",function(data){
        io.emit("receive-location",{id:socket.id, ...data})
    })

    socket.on("disconnect",function(){
        io.emit("user-disconnected",socket.id);
    })
})

app.get("/", function (req,res){
    res.render("index");
})

server.listen(3000);
