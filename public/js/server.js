

    // khai bao bien
    var listMenberofRoom = {
    };
   
function hanlerSocket(socket, io) {
    console.log(socket.id + 'Đã kết nối');


    // 1. Dangnhap 
    socket.on('dangnhap', (name)=>{
        socket.name = name;
        var listroom = Object.keys(listMenberofRoom);
        socket.emit('ds-room', listroom)
        // dang nhap vao phong rieng (join room)
        socket.on('create-room', nameRoom=> {
            socket.phong = nameRoom;
            socket.join(nameRoom);
            console.log(socket.adapter.rooms)
            // them member vao room
            if(Object.keys(listMenberofRoom).includes(nameRoom)) {
                listMenberofRoom[nameRoom].push(name)
            } else {
                listMenberofRoom[nameRoom] = [name];
            }
                getListRoom();
            io.sockets.in(socket.phong).emit('list-member', listMenberofRoom[nameRoom])
            // user out room
            socket.on('user-logout', name=>{
                // hien thi thanh vien roi phong
                socket.to(socket.phong).emit('alert-userout', name);
                
                
                socket.leave(socket.phong)
                if(listMenberofRoom[nameRoom]) {
                    listMenberofRoom[nameRoom].splice(listMenberofRoom[nameRoom].indexOf(name),1);
                    if(listMenberofRoom[nameRoom].length == 0){
                        delete listMenberofRoom[nameRoom]
                    }
                }
                // render lai memnber cua phong
                getMemberOfRoom();
                //  render lai list phong sau khi thoat ra
                getListRoom();
               
               
                
            })
            function getListRoom() {
                return io.sockets.emit('re-render-room', Object.keys(listMenberofRoom));
            }
            function getMemberOfRoom() {
                if(Object.keys(listMenberofRoom).includes(nameRoom)) {
                    return io.sockets.in(nameRoom).emit('re-render-member', listMenberofRoom[nameRoom])
                }   
            }
            socket.on('user-sendchat', textmsg => {
                socket.to(socket.phong).emit('sever-sendchat', textmsg, name);
            })

            
        })
        
        socket.on('disconnect', ()=> {
            io.sockets.emit('disconnectted', socket.name);
            socket.leave(socket.phong);
            if(listMenberofRoom[socket.phong]) {
                listMenberofRoom[socket.phong].splice(listMenberofRoom[socket.phong].indexOf(name),1);
                if(listMenberofRoom[socket.phong].length == 0){
                    delete listMenberofRoom[socket.phong]
                }
            }
            // render lai memnber cua phong
            io.sockets.emit('re-render-room', Object.keys(listMenberofRoom));
            //  render lai list phong sau khi thoat ra
            io.sockets.in(socket.phong).emit('re-render-member', listMenberofRoom[socket.phong]);
            socket.to(socket.phong).emit('alert-userout', name);
           
        })
    })
}
module.exports  = hanlerSocket;