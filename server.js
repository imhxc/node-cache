const http = require('http');
const fs = require('fs');


const server = http.createServer((request, response) => {
    fs.stat(`www${request.url}`, (statErr, statData) => {
        if (!statErr) {
            const client_mtime = request.headers['if-modified-since'];
            const server_mtime = statData.mtime.toUTCString();
            if (client_mtime) {
                let client_mtime_sec = Math.floor(new Date(client_mtime).getTime() / 1000);
                let server_mtime_sec = Math.floor(statData.mtime.getTime() / 1000);

                if (server_mtime_sec > client_mtime_sec) {
                    //  如果服务器的修改时间大于客户端的修改时间, 直接返回最新数据
                    // 读区文件
                    let file_rs = fs.createReadStream(`www${request.url}`);
                    // 设置缓存
                    response.setHeader('Last-Modified', server_mtime);
                    file_rs.pipe(response);
                    // 监听错误
                    file_rs.on('error', function() {
                        response.statusCode = 404;
                        response.end('not found');
                    })
                } else {
                    response.statusCode = 304;
                    response.end('not modifed');
                }
            } else {
                // 读区文件
                let file_rs = fs.createReadStream(`www${request.url}`);
                // 设置缓存
                response.setHeader('Last-Modified', server_mtime);
                file_rs.pipe(response);
                // 监听错误
                file_rs.on('error', function() {
                    response.statusCode = 404;
                    response.end('not found');
                })
            }
        } else {
            response.statusCode = 404;
            response.end('not found');
        }
    })
    
});

server.listen(8080);