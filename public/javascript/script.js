const socket = io();

socket.emit("Hello");
socket.on("Nothing", function(){
    console.log("Nothing Recieved");
});