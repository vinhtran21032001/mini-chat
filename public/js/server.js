

    // khai bao bien
    var listMenberofRoom = {
    };
   
function hanlerSocket(socket, io) {
    console.log(socket.id + 'Đã kết nối');


    // . Dangnhap 
    socket.on('dangnhap', (name)=>{
        socket.name = name;
        var listroom = Object.keys(listMenberofRoom);
        socket.emit('ds-room', listroom)
        // 1. dang nhap vao phong rieng (join room)
        socket.on('create-room', nameRoom=> {
            socket.phong = nameRoom;
            socket.join(nameRoom);
            console.log(socket.adapter.rooms)

            // 1.1  them thanh vien moi vao mang
            if(Object.keys(listMenberofRoom).includes(nameRoom)) {
                listMenberofRoom[nameRoom].push(name)
            } else {
                listMenberofRoom[nameRoom] = [name];
            }
              
            
            // 1.2 tra ve mang thanh vien moi
            getListRoom(); 
            io.sockets.in(socket.phong).emit('list-member', listMenberofRoom[nameRoom])
            // 1.3 su kien khi user chat
            socket.on('user-sendchat', textmsg => {
                socket.to(socket.phong).emit('sever-sendchat', textmsg, name);
            })

            // 1.4 su kien thanh vien out nhom
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

            //  ham xu lu
            function getListRoom() {
                return io.sockets.emit('re-render-room', Object.keys(listMenberofRoom));
            }
            function getMemberOfRoom() {
                if(Object.keys(listMenberofRoom).includes(nameRoom)) {
                    return io.sockets.in(nameRoom).emit('re-render-member', listMenberofRoom[nameRoom])
                }   
            }

            
        })
        
        //1.5 su kien thanh vien disconnect
        socket.on('disconnect', ()=> {
            io.sockets.emit('disconnectted', socket.name);
            socket.leave(socket.phong);
            //  kiem tra va xu li thanh vien trong nhom
            if(listMenberofRoom[socket.phong]) {
                listMenberofRoom[socket.phong].splice(listMenberofRoom[socket.phong].indexOf(name),1);
                if(listMenberofRoom[socket.phong].length == 0){
                    delete listMenberofRoom[socket.phong]
                }
            }
            //  tra ve thanh vien cua phong
            io.sockets.emit('re-render-room', Object.keys(listMenberofRoom));
            //  tra ve danh sach phong 
            io.sockets.in(socket.phong).emit('re-render-member', listMenberofRoom[socket.phong]);
            // thong bao co thanh vien thoat nhom
            socket.to(socket.phong).emit('alert-userout', name);
        })
    })
}
module.exports  = hanlerSocket;