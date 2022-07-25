const express = require("express");
const app = express();
const { Client } = require("pg");
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const port = 4000;

io.on("connection", (socket) => {
  socket.on("dataGetter", (data) => {
    const client = new Client({
      host: "localhost",
      port: "5432",
      user: "postgres",
      password: "dbcil123",
      database: "buses",
    });
    console.log(data);
    client.query(
      `select * from busdata where network_id='${data}' ORDER BY id`,
      (err, res) => {
        socket.emit("sendNetworkData", res.rows);
        // console.log(res.rows);
      }
    );

    client.connect((err, client, done) => {
      if (err) {
        console.log(err);
      } else {
        console.log("connected");
        client.on("notification", (msg) => {
          let nid = JSON.parse(msg.payload);

          // console.log(nid.id);
          client.query(
            `select * from busdata where network_id='${data}' ORDER BY id`,
            (err, res) => {
              console.log(res.rows);
              console.log(res.rows.length);
              console.log(nid.id);
              for (i = 0; i < res.rows.length; i++) {
                if (res.rows[i].id == nid.id) {
                  socket.emit("sendAlteredData", {
                    count: i,
                    lat: res.rows[i].lat,
                    lon: res.rows[i].lon,
                  });
                }
              }
              // console.log(res.rows);
            }
          );
        });
        const query = client.query("LISTEN update_notification");
      }
    });
  });
});

// // const dbRouter = require("./routes/db");
// // app.use("/", dbRouter);
// app.get("/", async (req, res) => {
//   res.send("hello world");
// });

// app.listen(port, () => {
//   console.log("listening on port: 3000");
// });

// //
http.listen(4000, () => {
  console.log("Listening on port 4000");
});
