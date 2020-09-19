const AmazonCognitoIdentityJs = require("amazon-cognito-identity-js");
global.fetch = require("node-fetch");
const request = require("request");
const crypto = require("crypto");
const { setMaxListeners } = require("process");

const poolData = {
  UserPoolId: "us-east-1_7oXrtUrE1",
  ClientId: "ecvhnqb87meq02ue62n3v2gpa",
};

const userPool = new AmazonCognitoIdentityJs.CognitoUserPool(poolData);

module.exports = {
  signUpForm: (req, res) => {
    return res.view("pages/signup");
  },

  signUp: (req, res) => {
    let username = req.body.username;
    let email = req.body.email;
    let pswd = req.body.password;
    let confirmPswd = req.body.confirmPassword;
    console.log(email);

    if (pswd != confirmPswd) {
      return res.view("pages/signup", {
        err: "Password and confirm password doesnot match",
      });
    }
    const emailData = {
      Name: "email",
      Value: email,
    };
    const emailAttribute = new AmazonCognitoIdentityJs.CognitoUserAttribute(
      emailData
    );
    userPool.signUp(username, pswd, [emailAttribute], null, (err, data) => {
      if (err) {
        console.log("error occured: " + err);
        console.error(err);
        return res.view("pages/signup", {
          err: err.message,
        });
      }
      console.log(data);
      console.log(data.user);
      return res.redirect("/login");
    });
  },

  login: (req, res) => {
    const loginDetails = {
      Username: req.body.username,
      Password: req.body.password,
    };
    const authenticationDetails = new AmazonCognitoIdentityJs.AuthenticationDetails(
      loginDetails
    );
    const userDetails = {
      Username: req.body.username,
      Pool: userPool,
    };
    const cognitoUser = new AmazonCognitoIdentityJs.CognitoUser(userDetails);
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (data) => {
        console.log(data.accessToken);
        req.session.username = req.body.username;
        sails.authenticated = true;
        res.redirect("/");
      },
      onFailure: (err) => {
        console.log(err);
        return res.view("pages/loginpage", {
          err: err.message,
        });
      },
    });
  },

  logout: (req, res) => {
    sails.authenticated = false;
    req.session.username = "";
    return res.redirect("/");
  },

  placeOrder: async (req, res) => {
    console.log("Placing order");
    let username = req.session.username;
    let flowerName = req.param("flowerName");
    let basketName = req.param("basketName");
    console.log(flowerName);
    if (typeof flowerName == "undefined") {
      console.log("VAlue is undefined");
      flowerName = req.body.flowerName;
      basketName = req.body.basketName;
    }
    console.log(basketName);

    let quantityAvailable = await Utils.checkQuantity(flowerName, basketName);
    console.log(quantityAvailable);
    if (quantityAvailable == false) {
      res.view("pages/errorpage", {
        message:
          "Flower or basket is running out of stock. Kindly select another flower basket",
      });
      return;
    }
    const orderId = crypto.randomBytes(16).toString("hex");
    console.log(orderId);
    let basketOrderStatus = await Utils.placeBasketOrder(basketName, orderId);
    let flowerOrderStatus = await Utils.placeFlowerOrder(flowerName, orderId);
    console.log(flowerOrderStatus);
    console.log(basketOrderStatus);
    if (flowerOrderStatus === false || basketOrderStatus === false) {
      console.log("Reverting the transaction");
      let revertBasketOrder = await Utils.completeBasketOrder(orderId, false);
      let revertFlowerOrder = await Utils.completeFlowerOrder(orderId, false);
      console.log(revertBasketOrder + " " + revertFlowerOrder);
      res.view("pages/errorpage", {
        message: "Unprecedented circumstances occured, please try again",
      });
      return;
    } else {
      let completeBasketOrder = await Utils.completeBasketOrder(orderId, true);
      let completeFlowerOrder = await Utils.completeFlowerOrder(orderId, true);
      console.log(completeBasketOrder + " " + completeFlowerOrder);
      var datetime = new Date().toISOString();

      let dateVal = datetime.slice(0, 10);

      OrderHistory.create({
        flowerName: flowerName,
        basketName: basketName,
        orderDate: dateVal,
        username: req.session.username,
        status: "success",
      }).exec((err) => {
        if (err) {
          console.log("Error occured" + err);
          return res.view("pages/errorpage", {
            message: "Order placed successfully",
          });
        }
        return res.view("pages/errorpage", {
          message: "Order placed successfully",
        });
      });
    }
  },

  customizePlaceOrder: (req, res) => {
    let username = req.session.username;

    let flowerName = req.param("flowerName");
    let basketName = req.param("basketName");
    let checkQuantity = checkQuantity(flowerName, basketName);
    return res.send(req.session.username);
  },

  viewCombos: (req, res) => {
    FlowerBasket.find({}).exec(function (err, result) {
      if (err) {
        res.send(500, { error: "Error in Database" });
      }
      if (result == "") {
        res.send("No data present");
      }
      res.view("pages/homepage", { combos: result });
    });
  },

  viewComboDetails: (req, res) => {
    let id = req.param("id");
    FlowerBasket.find({ id: id }).exec(function (err, result) {
      if (err) {
        res.send(500, { error: "Error in Database" });
      }
      if (result == "") {
        res.send("No data present");
      }
      res.view("pages/viewcombodetails", { combo: result });
    });
  },

  showOrderHistory: (req, res) => {
    let username = req.session.username;
    OrderHistory.find({ username: username }).exec(function (err, result) {
      if (err) {
        res.send(500, { error: "Error in Database" });
      }
      if (result == "") {
        res.view("pages/errorpage", { message: "No data present" });
      } else {
        console.log(result);
        res.view("pages/showorderhistory", { orderhistory: result });
      }
    });
  },

  customizeCombo: (req, res) => {
    console.log("Customiz combo");
    request(
      {
        url: sails.config.projectConfig.flowerCompanyUrl + "/getAllFlowerList",
        method: "GET",
      },
      function (error, response, body) {
        if (error) {
          console.log(error);
          return res.view("pages/errorpage", {
            message: "Server down. Please try again",
          });
        } else {
          console.log(JSON.parse(body));
          let flowers = JSON.parse(body);
          request(
            {
              url:
                sails.config.projectConfig.basketCompanyUrl +
                "/getAllBasketList",
              method: "GET",
            },
            function (error, response, body) {
              if (error) {
                console.log(error);
                return res.view("pages/errorpage", {
                  message: "Server down. Please try again",
                });
              } else {
                let baskets = JSON.parse(body);
                return res.view("pages/customizecombo", {
                  flowers: flowers.body,
                  baskets: baskets,
                });
              }
            }
          );
        }
      }
    );
  },
};
