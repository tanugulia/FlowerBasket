const mysql = require("mysql");

const dbPool = mysql.createPool({
  connectionLimit: 6,
  host: "cloudproject.cgvh2dl8kyyq.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "aws_data",
  database: "blossom",
  port: "3306",
});

exports.handler = (event, context) => {
  console.log("Search request");
  dbPool.getConnection(function (err, flowerDb) {
    if (err) {
      console.log("Failed to connect to mysql " + err);
      context.succeed({
        statusCode: 500,
        message: "Failed to connect to database",
      });
      flowerDb.release();
      return;
    }
    flowerDb.query(
      "select * from flowers where flowerName = ?",
      [event["flowerName"]],
      (findErr, findResult) => {
        if (findErr) {
          console.log("Error in fetching database " + findErr);
          context.succeed({ statusCode: 500, message: findErr });
          flowerDb.release();
          return;
        }
        if (findResult.length > 0) {
          flowerDb.release();
          let response = {
            statusCode: 500,
            message: "Details of the flower is already present !!",
          };
          context.succeed(response);
        } else {
          flowerDb.query(
            "INSERT INTO `blossom`.`flowers`(`flowerName`,`details`,`price`,`imageUrl`,`quantityAvailable`) VALUES(?,?,?,?,?)",
            [event["flowerName"], event["details"], event["price"], event["imageUrl"], event["quantityAvailable"]],
            (findErr, findResult) => {
              if (findErr) {
                console.log("Error in fetching database " + findErr);
                context.succeed({ statusCode: 500, message: findErr });
                flowerDb.release();
                return;
              }
              flowerDb.release();
              let response = {
                statusCode: 200,
                message: "Successfull",
                body: findResult,
              };
              context.succeed(response);
            }
          );
        }
      }
    );
  });
};
