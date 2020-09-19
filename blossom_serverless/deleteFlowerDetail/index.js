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
  console.log("Received request to delete flower detail");
  console.log(event);
  console.log(context);
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
      "select * from flowers where flowerId = ?",
      [event["flowerId"]],
      (findErr, findResult) => {
        if (findErr) {
          console.log("Error in fetching database " + findErr);
          context.succeed({ statusCode: 500, message: findErr });
          flowerDb.release();
          return;
        }

        console.log(findResult);
        if (findResult.length > 0) {
          flowerDb.query(
            "delete from flowers where flowerId= ?",
            [event["flowerId"]],
            (err, result) => {
              if (err) {
                console.log(err);
                let response = {
                  statusCode: 500,
                  message: "Error in deleting data from database",
                };
                flowerDb.release();
                context.succeed(response);
              }
              flowerDb.release();
              let response = {
                statusCode: 200,
                message: "Flower details deleted successfully !!",
              };
              context.succeed(response);
            }
          );
        }
      }
    );
  });
};
