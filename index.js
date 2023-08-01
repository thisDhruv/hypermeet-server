const {Server}  = require("socket.io");
const io = new Server(8000,{
    cors:true
});
const socketIdToEmailMap = new Map();
const emailToSocketId = new Map(); 

io.on("connection",(socket)=>{
    console.log("Socket Connected",socket.id);

    socket.on("room:join",(data)=>{
        const {email,room} = data;
        socketIdToEmailMap.set(socket.id,email);
        emailToSocketId.set(email,socket.id);
        io.to(room).emit("user:joined", { email, id: socket.id });
        socket.join(room);
        io.to(socket.id).emit("room:join", data);
    })

    socket.on("camera:toggle",({to})=>{
        io.to(to).emit("camera:toggle",{from:to});
    })

    socket.on("user:call",({to,offer,fromEmail})=>{
        io.to(to).emit("incoming:call",{from:socket.id,offer,fromEmail:fromEmail});
    })
    socket.on("call:accepted",({to,ans})=>{
        io.to(to).emit("call:accepted",{from:socket.id,ans});
    })

    socket.on("peer:nego:needed", ({ to, offer }) => {
        // console.log("peer:nego:needed", offer);
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });
    
    socket.on("peer:nego:done", ({ to, ans }) => {
        console.log("peer:nego:done", ans);
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });
    socket.on("outgoing:message", ({ to, message }) => {
        console.log("incoming msg");
        io.to(to).emit("incoming:message", { from: socket.id,message:message});
        // io.to(socket.id).emit("incoming:message", { from: socket.id,message:message});
    });
    socket.on("transcript:outgoing", ({ to, speech,fromemail }) => {
        console.log("incoming msg");
        io.to(to).emit("transcript:incoming", { from: socket.id,speech:speech,fromemail:fromemail});
    });
})